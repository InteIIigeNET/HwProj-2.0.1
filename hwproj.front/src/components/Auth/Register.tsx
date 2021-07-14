import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
//import { RegisterViewModel } from "../../api/auth";
import "./Styles/Register.css";

interface RegisterViewModel {
  name: string;
  surname: string;
  middleName: string;
  password: string;
  passwordConfirm: string;
  email: string;
}

interface IRegisterState {
  registerData: RegisterViewModel;
  logged: boolean;
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
      logged: ApiSingleton.authService.getLogginStateFake(),
    };
  }

  public render(): JSX.Element {
    const { registerData, logged } = this.state;

    if (logged) {
      return <Redirect to={"/"} />;
    }

    return (
      <div className="page">
        <Typography component="h1" variant="h5">
          Регистрация
        </Typography>
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
            required
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
    // const { email, password } = this.state.registerData;
    // await ApiSingleton.accountApi.apiAccountRegisterPost(this.state.registerData);
    // await ApiSingleton.authService.login(email, password);

    const registerUserModel = {
      name: this.state.registerData.name,
      surname: this.state.registerData.surname,
      email: this.state.registerData.email,
      middleName: this.state.registerData.middleName,
      password: this.state.registerData.password,
      isLecturer: false
    }

    const user = await ApiSingleton.authService.registerUserFake(registerUserModel)
    debugger
    ApiSingleton.authService.loginFake()
    ApiSingleton.authService.setRoleFake("student")
    ApiSingleton.authService.setUserIdFake(user.id)
    this.setState({logged: true})
    window.location.assign("/")
  };
}
