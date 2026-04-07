import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import SubmitNews from "@/pages/SubmitNews";

test("submit news page validates short content", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          requestPrediction: vi.fn(),
          saveCustomNews: vi.fn(),
          pushToast: vi.fn()
        }}
      >
        <SubmitNews />
      </AuthContext.Provider>
    </MemoryRouter>
  );

  await user.type(screen.getByLabelText(/headline/i), "Breaking update");
  await user.type(screen.getByLabelText(/content/i), "Too short");
  await user.click(screen.getByRole("button", { name: /check authenticity/i }));

  expect(screen.getByText("Use at least 20 characters of content.")).toBeInTheDocument();
});
