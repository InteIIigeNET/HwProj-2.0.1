import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import ApiSingleton from "../api/ApiSingleton";

interface IEditProfileState {
  isLoaded: boolean;
  name: string;
  surname: string;
  edited: boolean;
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
      edited: false,
    };
  }

  public handleSubmit(e: any) {
    e.preventDefault();

    let editViewModel = {
      newName: this.state.name,
      newSurname: this.state.surname,
    };

    /* а у нас EditViewModel поменялась как бы
    ApiSingleton.accountApi
      .apiAccountEditPut(editViewModel)
      .then((res) => this.setState({ edited: true }));
     */
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/"} />;
    }

    if (this.state.isLoaded) {
      if (!ApiSingleton.authService.isLoggedIn()) {
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
                label="Имя"
                variant="outlined"
                margin="normal"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
              <TextField
                required
                label="Фамилия"
                variant="outlined"
                margin="normal"
                value={this.state.surname}
                onChange={(e) => this.setState({ surname: e.target.value })}
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

  componentDidMount() {
    if (ApiSingleton.authService.isLoggedIn()) {
      ApiSingleton.accountApi
        .apiAccountGetUserDataByUserIdGet(ApiSingleton.authService.getProfile()._id)
        .then((res) => JSON.stringify(res))
        .then((user) =>
          this.setState({
            isLoaded: true,
            name: user
            // а на surname вообще забили, нехорошо
          })
        );
    }
  }
}
