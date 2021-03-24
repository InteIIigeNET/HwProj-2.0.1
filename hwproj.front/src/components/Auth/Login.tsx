import * as React from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import { Link, Redirect } from "react-router-dom";
import { FormEvent } from "react";

import ApiSingleton from "../../api/ApiSingleton";

interface ILoginState {
  email: string;
  password: string;
  logged: boolean;
}

export default class Login extends React.Component<{}, ILoginState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      password: "",
      logged: ApiSingleton.authService.isLoggedIn(),
    };
  }

  render(): JSX.Element {
    if (this.state.logged) {
      return <Redirect to={"/"} />;
    }
    return (
      <div className="container vertical-center-form">
        <Typography variant="h6" gutterBottom>
          Войти
        </Typography>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <TextField
            required
            type="email"
            label="Email"
            variant="outlined"
            margin="normal"
            name={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
          />
          <br />
          <TextField
            required
            type="password"
            label="Password"
            variant="outlined"
            margin="normal"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
          />
          <br />
          <Button
            size="small"
            variant="contained"
            color="primary"
            type="submit"
          >
            Войти
          </Button>
        </form>
      </div>
    );
  }

  private handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = this.state;

    console.log("before login");
    const tokenCredentials = await ApiSingleton.authService.login(
      email,
      password
    );
    console.log("after login", tokenCredentials);

    ApiSingleton.accountApi
      .getUserDataById(ApiSingleton.authService.getProfile()._id)
      .then((res) => res.json())
      .then((user) => {
        console.log({ user });
      });

    window.location.assign("/");
  };
}
