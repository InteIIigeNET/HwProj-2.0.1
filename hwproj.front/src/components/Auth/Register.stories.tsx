import * as React from "react";
import { storiesOf } from "@storybook/react";
import Register from "./Register";

storiesOf("Register page", module)
  .add("simple", () =>
    <Register onLogin={() => {}}/>
    );