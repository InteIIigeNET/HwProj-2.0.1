import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import axios from "axios";
import { TextField, Typography } from "@material-ui/core";
import { Button, Center, Gapped } from "@skbkontur/react-ui";
import { UserAdd } from "@skbkontur/react-icons";

import { IFormField } from "types";
import { API_ROOT } from "config";
import Header from "parts/Header";
import ApiSingleton from "../../api/ApiSingleton";
import './Register.css';

type Props = RouteComponentProps;

interface IState {
  firstName: IFormField;
  lastName: IFormField;
  middleName: IFormField;
  email: IFormField;
  password: IFormField;
  password2: IFormField;
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_MIN_LENGTH = 6;
const REQUIRED_ERROR_MESSAGE = "Это поле обязательно!";

export default class Register extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      firstName: { value: "", error: false, helperText: "" },
      lastName: { value: "", error: false, helperText: "" },
      middleName: { value: "", error: false, helperText: "" },
      email: { value: "", error: false, helperText: "" },
      password: { value: "", error: false, helperText: "" },
      password2: { value: "", error: false, helperText: "" },
    };
  }

  validate = () => {
    let isValid = true;
    const { firstName, lastName, email, password, password2 } = this.state;

    if (firstName.value === "") {
      this.setState({
        firstName: {
          ...firstName,
          error: true,
          helperText: REQUIRED_ERROR_MESSAGE,
        },
      });
      isValid = false;
    }

    if (lastName.value === "") {
      this.setState({
        lastName: {
          ...lastName,
          error: true,
          helperText: REQUIRED_ERROR_MESSAGE,
        },
      });
      isValid = false;
    }

    if (email.value === "") {
      this.setState({
        email: { ...email, error: true, helperText: REQUIRED_ERROR_MESSAGE },
      });
      isValid = false;
    } else if (!EMAIL_REGEX.test(email.value)) {
      this.setState({
        email: {
          ...email,
          error: true,
          helperText: "Введите правильный адрес!",
        },
      });
      isValid = false;
    }

    if (password.value === "") {
      this.setState({
        password: {
          ...password,
          error: true,
          helperText: REQUIRED_ERROR_MESSAGE,
        },
      });
      isValid = false;
    } else if (password.value.length < PASSWORD_MIN_LENGTH) {
      this.setState({
        password: {
          ...password,
          error: true,
          helperText: `Это поле должно быть минимум ${PASSWORD_MIN_LENGTH} символов!`,
        },
      });
      isValid = false;
    }

    if (password2.value === "") {
      this.setState({
        password2: {
          ...password2,
          error: true,
          helperText: REQUIRED_ERROR_MESSAGE,
        },
      });
      isValid = false;
    } else if (password2.value !== password.value) {
      this.setState({
        password2: {
          ...password2,
          error: true,
          helperText: "Пароли не совпадают!",
        },
      });
      isValid = false;
    }

    return isValid;
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof IState;
    const field = this.state[name];

    if (field.error) {
      this.setState({
        ...this.state,
        [name]: { error: false, helperText: "", value: e.target.value },
      });
    } else {
      this.setState({
        ...this.state,
        [name]: { ...field, value: e.target.value },
      });
    }
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!this.validate()) {
      return;
    }

    const data = {
      name: this.state.firstName.value,
      surname: this.state.lastName.value,
      middleName: this.state.middleName.value,
      email: this.state.email.value,
      password: this.state.password.value,
      passwordConfirm: this.state.password2.value,
    };

    const res = await ApiSingleton.accountApi.apiAccountRegisterPost(data);

    /*if (res.data.errors.length > 0) {
      this.setState({
        email: {
          ...this.state.email,
          error: true,
          helperText: res.data.errors[0].description,
        },
      });
      return;
    }*/

    this.props.history.push("/login");
  };

  // TODO: Redesign! :)
  render() {
    const {
      firstName,
      lastName,
      middleName,
      email,
      password,
      password2,
    } = this.state;
    return (
      <>
        <Header />
        <div className={'auth-form'}>
          <form onSubmit={this.handleSubmit}>
            <fieldset className="auth-fieldset" style={{ 
              // display: 'flex',
              // alignItems: 'center',
              // justifyContent: 'center',
              // flexDirection: 'column',
              // flexWrap: 'wrap',
            }}>
              <legend>
                <Typography variant="h6" gutterBottom>
                  Регистрация
                </Typography>
              </legend>
              <div className="row">
               
                <div className="column">
                  <TextField
                      required
                      type="email"
                      label="Email"
                      variant="outlined"
                      margin="normal"
                      name="email"
                      error={email.error}
                      value={email.value}
                      helperText={email.helperText}
                      onChange={this.handleChange}
                  />
                  <TextField
                      required
                      type="password"
                      label="Пароль"
                      variant="outlined"
                      margin="normal"
                      name="password"
                      error={password.error}
                      value={password.value}
                      helperText={password.helperText}
                      onChange={this.handleChange}
                  />
                  <TextField
                      required
                      type="password"
                      label="Подтвердите пароль"
                      variant="outlined"
                      margin="normal"
                      name="password2"
                      error={password2.error}
                      value={password2.value}
                      helperText={password2.helperText}
                      onChange={this.handleChange}
                  />
                </div>
                  <div className="column">
                    <TextField
                        required
                        label="Имя"
                        variant="outlined"
                        margin="normal"
                        name="firstName"
                        value={firstName.value}
                        error={firstName.error}
                        helperText={firstName.helperText}
                        onChange={this.handleChange}
                    />
                    <TextField
                        required
                        label="Фамилия"
                        variant="outlined"
                        margin="normal"
                        name="lastName"
                        error={lastName.error}
                        value={lastName.value}
                        helperText={lastName.helperText}
                        onChange={this.handleChange}
                    />
                    <TextField
                        label="Отчество"
                        variant="outlined"
                        margin="normal"
                        name="middleName"
                        error={middleName.error}
                        value={middleName.value}
                        helperText={middleName.helperText}
                        onChange={this.handleChange}
                    />
                  </div>
                </div>
       
              <Button
                  size="small"
                  use="primary"
                  type="submit"
                  onClick={this.handleSubmit}
                  icon={<UserAdd />}
                  style={{ margin: "0.75rem 0" }}
              >
                Зарегистрироваться
              </Button>
              <p style={{ textAlign: "center" }}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </p>
            </fieldset>
          </form>
        </div>
       
      </>
    );
  }
}
