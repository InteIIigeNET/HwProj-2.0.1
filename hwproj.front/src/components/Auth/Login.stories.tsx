import * as React from "react";
import { storiesOf } from "@storybook/react";
import Login from "./Login";

storiesOf("Login page", module).add("simple", () => (
  <Login onLogin={() => {}} />
));
