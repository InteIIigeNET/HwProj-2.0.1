import React from "react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { render, screen } from "@testing-library/react";

import App from "./App";

test("displays Login Page on /login url", () => {
  const history = createMemoryHistory({ initialEntries: ["/login"] });

  render(
    <Router history={history}>
      <App />
    </Router>
  );

  const heading = screen.getByRole("heading", { name: "Войти" });

  expect(heading).toBeVisible();
});
