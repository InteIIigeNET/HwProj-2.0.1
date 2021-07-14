import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import ApiSingleton from "../api/ApiSingleton";
import { IUser } from "types";
import { EditAccountViewModel } from "../api/auth";
import { FormEvent } from "react";

interface IEditProfileState {
  isLoaded: boolean;
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
      isLoaded: false,
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

    // let editViewModel: EditAccountViewModel = {
    //   name: this.state.name,
    //   surname: this.state.surname,
    //   middleName: this.state.middleName,
    //   currentPassword: this.state.currentPassword,
    //   newPassword: this.state.newPassword,
    // };

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

    /* а у нас EditAccountViewModel поменялась как бы
    ApiSingleton.accountApi
      .apiAccountEditPut(editViewModel)
      .then((res) => this.setState({ edited: true }));
     */
    //ApiSingleton.accountApi.apiAccountEditPut(editViewModel);
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/"} />;
    }

    if (this.state.isLoaded) {
      if (!ApiSingleton.authService.getLogginStateFake()) {
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

    return "";
  }

  async componentDidMount() {

    const currentUser = await ApiSingleton.authService.getUserByUserIdFake()
    this.setState({
      isLoaded: true,
      name: currentUser.name,
      surname: currentUser.surname,
      email: currentUser.email,
      middleName: currentUser.middleName,
      currentPassword: currentUser.password,
    })
    // ApiSingleton.accountApi
    //   .apiAccountGetUserDataByUserIdGet(
    //     ApiSingleton.authService.getProfile()._id
    //   )
    //   .then((res) => JSON.stringify(res))
    //   .then((user) => {
    //     const userObj = JSON.parse(user);
    //     console.log({ userObj });
    //     this.setState({
    //       isLoaded: true,
    //       name: userObj.name,
    //       surname: userObj.surname ?? "",
    //     });
    //   });
  }
}
