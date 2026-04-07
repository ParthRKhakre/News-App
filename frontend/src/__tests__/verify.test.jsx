import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import Verify from "@/pages/Verify";

test("verify page loads blockchain record", async () => {
  const user = userEvent.setup();
  const verifyHash = vi.fn().mockResolvedValue({
    result: "FAKE",
    confidence: 9200,
    timestamp: 1710000000,
    txHash: "0xabc",
  });

  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ verifyHash }}>
        <Verify />
      </AuthContext.Provider>
    </MemoryRouter>
  );

  await user.type(screen.getByLabelText(/verification hash/i), "known-hash");
  await user.click(screen.getByRole("button", { name: /verify/i }));

  await waitFor(() => expect(screen.getByText("FAKE")).toBeInTheDocument());
  expect(verifyHash).toHaveBeenCalled();
  expect(screen.getByText("92.00%")).toBeInTheDocument();
});
