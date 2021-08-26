import * as React from "react";
import { FormEvent } from "react";
import { Redirect } from "react-router-dom";

import { Button, TextField, Typography } from "@material-ui/core";

import ApiSingleton from "../api/ApiSingleton";

interface IEditProfileState {
    isLoaded: boolean;
    edited: boolean;
    errors: string[];
    name: string;
    surname: string;
    middleName?: string;
    currentPassword: string;
    newPassword: string;
}

export default class EditProfile extends React.Component<{}, IEditProfileState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoaded: false,
            edited: false,
            errors: [],
            name: "",
            surname: "",
            middleName: "",
            currentPassword: "",
            newPassword: "",
        };
    }

    handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const editForm = {
          name: this.state.name,
          surname: this.state.surname,
          middleName: this.state.middleName,
          currentPassword: this.state.currentPassword,
          newPassword: this.state.newPassword,
      }
      ApiSingleton.accountApi
        .apiAccountEditPut(editForm)
        .then((res) => {
            if (res.succeeded) {
                this.setState({ edited: true });
            }
            else {
                this.setState({ errors: res.errors! });
            }
        });
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
                    <TextField
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
                    {this.state.errors && (
                        <p style={{ color: "red", marginBottom: "0" }}>{this.state.errors}</p>
                    )}
                </div>


                </div>
            );
        }
        return "";
    }

    async componentDidMount() {
        const currentUser = await (await ApiSingleton.accountApi.apiAccountGetUserDataGet()).userData!
        this.setState({
            isLoaded: true,
            name: currentUser.name!,
            surname: currentUser.surname!,
            middleName: currentUser.middleName!,
        });
    }
}
