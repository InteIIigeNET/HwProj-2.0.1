import * as React from "react";
import { storiesOf } from "@storybook/react";
import RegistrationRequestForm from "@/components/RegistrationRequests/RegistrationRequestForm";

storiesOf("Register page", module)
  .add("simple", () =>
    <RegistrationRequestForm/>
    );