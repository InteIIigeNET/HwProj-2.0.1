import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { TextField, Typography } from "@material-ui/core";
import { Button, Center } from "@skbkontur/react-ui";
import LoginIcon from "@skbkontur/react-icons/Login";
import axios from "axios";

import { IUser, IFormField } from "types";
import { API_ROOT } from "config";
import ApiSingleton from "Api/ApiSingleton";
import Header from "parts/Header";

interface Props extends RouteComponentProps {
  auth(user: IUser, token: string): void;
}

interface IState {
  email: IFormField;
  password: IFormField;
}

export default class Login extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      email: { value: "", error: false, helperText: "" },
      password: { value: "", error: false, helperText: "" },
    };
  }

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = this.state;
    let error = false;

    if (email.value === "") {
      error = true;
      this.setState({
        email: { ...email, error: true, helperText: "Это поле обязательно." },
      });
    }

    if (password.value === "") {
      error = true;
      this.setState({
        password: {
          ...password,
          error: true,
          helperText: "Это поле обязательно.",
        },
      });
    }

    if (error) {
      return;
    }

    const res = await axios.post(`${API_ROOT}/account/login`, {
      email: email.value,
      password: password.value,
    });

    if (res.data.errors) {
      this.setState({
        email: {
          ...email,
          error: true,
          helperText: res.data.errors[0].description,
        },
        password: {
          ...password,
          error: true,
        },
      });
      return;
    }

    const token = res.data.value.accessToken;
    ApiSingleton.authService.setToken(token);

    const user: IUser = ApiSingleton.authService.getProfile();
    this.props.auth(user, token);
    this.props.history.push("/profile");
  };

  render() {
    const { email, password } = this.state;
    return (
      <>
        <Header />
        <form className="auth-form" onSubmit={this.handleSubmit}>
          <fieldset className="auth-fieldset">
            <legend>
              <Typography variant="h6" gutterBottom>
                Вход
              </Typography>
            </legend>
            <TextField
              required
              error={email.error}
              type="email"
              label="Email"
              variant="outlined"
              margin="normal"
              value={email.value}
              helperText={email.helperText}
              onChange={(e) =>
                this.setState({
                  email: { ...email, value: e.target.value },
                })
              }
            />
            <br />
            <TextField
              required
              error={password.error}
              type="password"
              label="Password"
              variant="outlined"
              margin="normal"
              value={password.value}
              helperText={password.helperText}
              onChange={(e) =>
                this.setState({
                  password: { ...password, value: e.target.value },
                })
              }
            />
            <br />
            <Button
              size="small"
              use="primary"
              type="submit"
              icon={<LoginIcon />}
              style={{ margin: "0.75rem 0" }}
            >
              Войти
            </Button>
            <p style={{ textAlign: "center" }}>
              Нет аккаунта? <Link to="/register">Создать</Link>
            </p>
          </fieldset>
        </form>
      </>
    );
  }
}
