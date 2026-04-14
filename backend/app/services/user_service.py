from dataclasses import dataclass
from typing import Dict, Optional

from app.core.db import get_connection, initialize_database
from app.core.security import get_password_hash, verify_password


ALLOWED_ROLES = {"admin", "reporter", "user"}


@dataclass
class UserRecord:
    username: str
    hashed_password: str
    role: str


class InMemoryUserStore:
    """SQLite-backed auth store with a small in-memory cache for fast reads."""

    def __init__(self) -> None:
        initialize_database()
        self._users: Dict[str, UserRecord] = {}
        self._load_existing_users()

    def _load_existing_users(self) -> None:
        with get_connection() as connection:
            rows = connection.execute(
                "SELECT username, hashed_password, role FROM users"
            ).fetchall()
        self._users = {
            row["username"]: UserRecord(
                username=row["username"],
                hashed_password=row["hashed_password"],
                role=row["role"],
            )
            for row in rows
        }

    def create_user(self, username: str, password: str, role: str = "user") -> UserRecord:
        normalized_username = username.strip().lower()
        normalized_role = role.strip().lower()

        if not normalized_username:
            raise ValueError("Username cannot be empty.")
        if not password:
            raise ValueError("Password cannot be empty.")
        if normalized_role not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(sorted(ALLOWED_ROLES))}.")
        if normalized_username in self._users:
            raise ValueError("Username already exists.")

        user = UserRecord(
            username=normalized_username,
            hashed_password=get_password_hash(password),
            role=normalized_role,
        )
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO users (username, hashed_password, role)
                VALUES (?, ?, ?)
                """,
                (user.username, user.hashed_password, user.role),
            )
        self._users[normalized_username] = user
        return user

    def authenticate(self, username: str, password: str) -> Optional[UserRecord]:
        normalized_username = username.strip().lower()
        user = self._users.get(normalized_username)
        if user is None:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def get_user(self, username: str) -> Optional[UserRecord]:
        return self._users.get(username.strip().lower())

    def reset_for_tests(self) -> None:
        with get_connection() as connection:
            connection.execute("DELETE FROM users")
        self._users.clear()


user_store = InMemoryUserStore()
