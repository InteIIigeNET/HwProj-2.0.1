import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import ApiSingleton from "../api/ApiSingleton";
import { FormEvent } from "react";

interface IEditProfileState {
  name: string;
  surname: string;
  middleName: string;
  currentPassword: string;
  newPassword: string;
  edited: boolean;
  email: string;
}

export default class EditProfile extends React.Component<
  {},
  IEditProfileState
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      name: "",
      surname: "",
      middleName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      edited: false,
    };
  }

  handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userModel = {
      name: this.state.name,
      surname: this.state.surname,
      middleName: this.state.middleName,
      email: this.state.email,
      password: this.state.newPassword,
      isLecturer: ApiSingleton.authService.getRoleFake()
    }

    await ApiSingleton.authService.editUserProfile(userModel)
    this.setState({edited: true})
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/"} />;
    }

    if (!ApiSingleton.authService.loggedIn()) {
      return (
        <Typography variant="h6" gutterBottom>
          Страница не найдена
        </Typography>
      );
    }

    return (
      <div>
        <div className="page">
          <Typography variant="h6" gutterBottom>
            Редактировать профиль
          </Typography>
          <form onSubmit={(e) => this.handleSubmit(e)} className="form">
            <TextField
                required
                label="Фамилия"
                variant="outlined"
                margin="normal"
                value={this.state.surname}
                onChange={(e) => this.setState({ surname: e.target.value })}
            />
            <TextField
              required
              label="Имя"
              variant="outlined"
              margin="normal"
              value={this.state.name}
              onChange={(e) => this.setState({ name: e.target.value })}
            />
            <TextField
              required
              label="Отчество"
              variant="outlined"
              margin="normal"
              value={this.state.middleName}
              onChange={(e) => this.setState({ middleName: e.target.value })}
            />
            <TextField
                required
                label="Пароль"
                variant="outlined"
                margin="normal"
                value={this.state.currentPassword}
                onChange={(e) => this.setState({ currentPassword: e.target.value })}
            />
            <TextField
                required
                label="Новый пароль"
                variant="outlined"
                margin="normal"
                value={this.state.newPassword}
                onChange={(e) => this.setState({ newPassword: e.target.value })}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              type="submit"
            >
              Редактировать профиль
            </Button>
          </form>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    debugger
    const userData = await ApiSingleton.authService.getProfile()
    console.log(userData)
    debugger
    // this.setState({
    //   name: currentUser.name,
    //   surname: currentUser.surname,
    //   email: currentUser.email,
    //   middleName: currentUser.middleName,
    //   currentPassword: currentUser.password,
    // })
  }
}
