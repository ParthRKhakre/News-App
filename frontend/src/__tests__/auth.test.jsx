import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

test("login page validates empty inputs", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  );

  await user.click(screen.getByRole("button", { name: /login/i }));

  expect(screen.getByText("Username is required.")).toBeInTheDocument();
  expect(screen.getByText("Password is required.")).toBeInTheDocument();
});

test("signup page lets the user choose a role and submits it", async () => {
  const user = userEvent.setup();
  const signup = vi.fn().mockResolvedValue({});

  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ signup }}>
        <Signup />
      </AuthContext.Provider>
    </MemoryRouter>
  );

  await user.type(screen.getByLabelText(/username/i), "reporter1");
  await user.type(screen.getByLabelText(/password/i), "secret123");
  await user.selectOptions(screen.getByLabelText(/role/i), "reporter");
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(signup).toHaveBeenCalledWith({
    username: "reporter1",
    password: "secret123",
    role: "reporter",
  });
});
