import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ApiSingleton from "../../api/ApiSingleton";
import Login from "./Login";

jest.mock("../../api/ApiSingleton");
const loginMock = ApiSingleton.authService.login as jest.Mock;

test("makes an api call on 'Войти' button click", async () => {
  const errorMsg = "Invalid Password";
  loginMock.mockRejectedValue(errorMsg);
  render(<Login onLogin={() => {}}/>);

  const loginBtn = screen.getByRole("button", { name: "Войти" });

  await act(async () => {
    userEvent.click(loginBtn);
  });

  const error = screen.getByText(errorMsg);

  expect(error).toBeVisible();
  expect(error).toHaveStyle({ color: "red" });

  expect(loginMock).toHaveBeenCalledTimes(1);
});
