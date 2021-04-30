import * as React from "react";
import { TextField, Button, Typography, Avatar, CssBaseline, FormControlLabel,
   Checkbox, Grid, Box } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { FormEvent } from "react";
import ApiSingleton from "../../api/ApiSingleton";
import './Styles/Login.css';

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
      <div className="page">
        <Typography component="h1" variant="h5">
          Войти
        </Typography>
        <form onSubmit={(e) => this.handleSubmit(e)} className="loginForm">
          <TextField
            required
            type="email"
            label="Email Address"
            variant="outlined"
            margin="normal"
            name={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
          />
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
            className="loginButton"
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

    await ApiSingleton.authService.login(email, password);

    window.location.assign("/");
  };
}
