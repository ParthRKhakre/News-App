import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import Login from "@/pages/Login";

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
