import React from "react";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";
import { render, screen } from "@testing-library/react";

import App from "./App";

test("displays Login Page on /login url", () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <App />
    </MemoryRouter>
  );

  const heading = screen.getByRole("heading", { name: "Войти" });

  expect(heading).toBeVisible();
});
