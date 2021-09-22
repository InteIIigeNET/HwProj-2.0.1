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

# Что сделать, чтоб заработала авторизация через гугл:

_Backend:_

1. Очистить солюшен, перебилдить проект.
2. npm install
3. Перейти в HwProj.AuthService.API и прописать следующее:
3.1) dotnet user-secrets init
3.2) dotnet user-secrets set "Authentication:Google:ClientId" "there should be clientId"
3.3) dotnet user-secrets set "Authentication:Google:ClientSecret" "there should be clientSecret"

_Frontend:_

Для того, чтоб работала авторизация через Google, нужно в корневой папке фронта (hwproj.front) создать файл .env и прописать в нем REACT_APP_GOOGLE_CLIENT_ID= 'there should be clientId'

