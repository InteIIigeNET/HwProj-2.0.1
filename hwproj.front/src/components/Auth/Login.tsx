import * as React from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import { Redirect } from "react-router-dom";
import { FormEvent } from "react";
import axios from "axios";

import ApiSingleton from "../../api/ApiSingleton";

interface ILoginState {
  email: string;
  password: string;
}

export default class Login extends React.Component<{}, ILoginState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      email: "",
      password: "",
    };
  }

  render(): JSX.Element {
    return (
      <div className="container vertical-center-form">
        <Typography variant="h6" gutterBottom>
          Войти
        </Typography>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <br />
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

    /*const res = await axios.post(`${API_AUTH}/account/login`, {
      email: email,
      password: password,
    });

    const token = res.data.value.accessToken;
    ApiSingleton.authService.setToken(token);*/

    await ApiSingleton.authService.login(email, password);

    window.location.assign("/");
  };
}
