import React, { FormEvent } from "react";
import { RouteComponentProps } from "react-router-dom";
import { TextField, Button, Typography } from "@material-ui/core";

import ApiSingleton from "../../api/ApiSingleton";

interface LoginProps extends Partial<RouteComponentProps> {
  onLogin?: () => void;
}

interface ILoginState {
  email: string;
  password: string;
  error: string;
}

export default class Login extends React.Component<LoginProps, ILoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
    };
  }

  handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await ApiSingleton.authService.login(
        this.state.email,
        this.state.password
      );
      this.props?.onLogin?.();
    } catch (err) {
      if (typeof err === "string") {
        this.setState({ error: err });
      } else {
        console.log(err);
        //throw new Error("Unhandled eror." + JSON.stringify(err));
      }
    }
  };

  render() {
    const headerStyles: React.CSSProperties = { marginRight: "9.5rem" };

    if (this.state.error) {
      headerStyles.marginBottom = "-1.5rem";
    }

    return (
      <div className="container vertical-center-form">
        <Typography variant="h6" style={headerStyles}>
          Войти
        </Typography>
        {this.state.error && (
          <p style={{ color: "red", marginBottom: "0" }}>{this.state.error}</p>
        )}
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
}
