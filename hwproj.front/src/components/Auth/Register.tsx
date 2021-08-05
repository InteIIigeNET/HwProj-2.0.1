import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import { RegisterViewModel } from "../../api/";
import "./Styles/Register.css";

interface IRegisterState {
  registerData: RegisterViewModel;
  loggedIn: boolean;
  error: string[];
}

export class Register extends React.Component<{}, IRegisterState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      registerData: {
        name: "",
        surname: "",
        email: "",
        middleName: "",
        password: "",
        passwordConfirm: "",
      },
      loggedIn: ApiSingleton.authService.loggedIn(),
      error: [],
    };
  }

  render(): JSX.Element {
    const { registerData, loggedIn } = this.state;

    if (loggedIn) {
      return <Redirect to={"/"} />;
    }

    return (
      <div className="page">
        <Typography component="h1" variant="h5">
          Регистрация
        </Typography>
          {this.state.error.length > 0 && (
              <p style={{ color: "red", marginBottom: "0" }}>{this.state.error}</p>
          )}
        <form onSubmit={this.handleSubmit} className="form">
          <TextField
            size="small"
            required
            label="Имя"
            variant="outlined"
            margin="normal"
            name={registerData.name}
            onChange={(e) =>
              this.setState({
                registerData: {
                  ...this.state.registerData,
                  name: e.target.value,
                },
              })
            }
          />
          <TextField
            required
            size="small"
            label="Фамилия"
            variant="outlined"
            margin="normal"
            name={registerData.surname}
            onChange={(e) =>
              this.setState({
                registerData: {
                  ...this.state.registerData,
                  surname: e.target.value,
                },
              })
            }
          />
          <TextField
            size="small"
            label="Отчество"
            variant="outlined"
            margin="normal"
            name={registerData.middleName}
            onChange={(e) =>
              this.setState({
                registerData: {
                  ...this.state.registerData,
                  middleName: e.target.value,
                },
              })
            }
          />
          <TextField
            required
            size="small"
            type="email"
            label="Email"
            variant="outlined"
            margin="normal"
            name={registerData.email}
            onChange={(e) =>
              this.setState({
                registerData: {
                  ...this.state.registerData,
                  email: e.target.value,
                },
              })
            }
          />
          <TextField
            required
            size="small"
            type="password"
            label="Пароль"
            variant="outlined"
            margin="normal"
            value={registerData.password}
            onChange={(e) =>
              this.setState({
                registerData: {
                  ...this.state.registerData,
                  password: e.target.value,
                },
              })
            }
          />
          <TextField
            required
            size="small"
            type="password"
            label="Поддвердите пароль"
            variant="outlined"
            margin="normal"
            value={registerData.passwordConfirm}
            onChange={(e) =>
              this.setState({
                registerData: {
                  ...this.state.registerData,
                  passwordConfirm: e.target.value,
                },
              })
            }
          />
          <br />
          <Button
            size="medium"
            variant="contained"
            color="primary"
            type="submit"
          >
            Зарегистрироваться
          </Button>
        </form>
      </div>
    );
  }

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    debugger
    const result = await ApiSingleton.authService.register(this.state.registerData)
    this.setState({
      error: result!.error!,
      loggedIn: result.loggedIn
    })
    if (result.loggedIn)
    {
        window.location.assign("/")
    }
  };
}
