import json
from collections import Counter

from app.core.db import get_connection, initialize_database

class AnalyticsService:
    def __init__(self) -> None:
        initialize_database()
        self._records: list[dict] = []
        self._hydrate_cache()

    def _hydrate_cache(self) -> None:
        with get_connection() as connection:
            rows = connection.execute(
                "SELECT label, important_words FROM analytics_predictions ORDER BY id ASC"
            ).fetchall()
        self._records = [
            {
                "label": row["label"],
                "important_words": json.loads(row["important_words"] or "[]"),
            }
            for row in rows
        ]

    def record_prediction(self, result: dict) -> None:
        important_words = result.get("important_words") or []
        record = {
            "label": result.get("label", "UNKNOWN"),
            "important_words": important_words,
        }
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO analytics_predictions (label, important_words)
                VALUES (?, ?)
                """,
                (record["label"], json.dumps(important_words)),
            )
        self._records.append(record)

    def get_summary(self) -> dict:
        total_checked = len(self._records)
        fake_count = sum(1 for record in self._records if record["label"] == "FAKE")
        real_count = sum(1 for record in self._records if record["label"] == "REAL")
        fake_percentage = round((fake_count / total_checked) * 100, 2) if total_checked else 0

        keyword_counter = Counter()
        for record in self._records:
            keyword_counter.update(record["important_words"])

        return {
            "total_checked": total_checked,
            "fake_count": fake_count,
            "real_count": real_count,
            "fake_percentage": fake_percentage,
            "top_keywords": [keyword for keyword, _ in keyword_counter.most_common(5)],
        }

    def reset_for_tests(self) -> None:
        with get_connection() as connection:
            connection.execute("DELETE FROM analytics_predictions")
        self._records.clear()


analytics_service = AnalyticsService()
