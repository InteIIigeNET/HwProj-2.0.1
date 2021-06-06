# Just use [Storybook](https://github.com/storybookjs/storybook).

## Available Scripts

In the project directory, you can run:

### `npm run storybook`

## Write your own stories
The page will reload if you make edits.<br>

```ts
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Register } from "./Register";

storiesOf("Register page", module)
  .add("simple", () => <Register/>);
 ```

# To start the JSON Server, type in the terminal:

### `json-server --watch data/db.json --port 3001`