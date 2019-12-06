import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { AccountApi, RegisterViewModel } from "../../api/auth/api";

interface IRegisterState {
    registerData: RegisterViewModel;
    logged: boolean;
}

export class Register extends React.Component<{}, IRegisterState> {
    authService = new AuthService();
    accountApi = new AccountApi();

    constructor(props: {}) {
        super(props);
        this.authService = new AuthService();
        this.state = {
            registerData: {
                name: "",
                surname: "",
                email: "",
                password: "",
                passwordConfirm: "",
            },
            logged: this.authService.isLoggedIn()
        };
    }

    public render(): JSX.Element {
        const {registerData, logged} = this.state;

        if (logged) {
            return <Redirect to={"/"} />;
        }

        return (
            <div className="container">
                <Typography variant="h6" gutterBottom>Регистрация</Typography>
                <form onSubmit={this.handleSubmit}>
                    <TextField
                        required
                        label="Имя"
                        variant="outlined"
                        margin="normal"
                        name={registerData.name}
                        onChange={e => this.setState({ registerData: {...this.state.registerData, name: e.target.value}})}
                    />
                    <br />
                    <TextField
                        required
                        label="Фамилия"
                        variant="outlined"
                        margin="normal"
                        name={registerData.surname}
                        onChange={e => this.setState({ registerData: {...this.state.registerData, surname: e.target.value}})}
                    />
                    <br />
                    <TextField
                        required
                        type="email"
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        name={registerData.email}
                        onChange={e => this.setState({ registerData: {...this.state.registerData, email: e.target.value}})}
                    />
                    <br />
                    <TextField
                        required
                        type="password"
                        label="Пароль"
                        variant="outlined"
                        margin="normal"
                        value={registerData.password}
                        onChange={e => this.setState({ registerData: {...this.state.registerData, password: e.target.value}})}
                    />
                    <br />
                    <TextField
                        required
                        type="password"
                        label="Поддвердите пароль"
                        variant="outlined"
                        margin="normal"
                        value={registerData.passwordConfirm}
                        onChange={e => this.setState({ registerData: {...this.state.registerData, passwordConfirm: e.target.value}})}
                    />
                    <br />
                    <Button size="small" variant="contained" color="primary" type="submit">Зарегистрироваться</Button>
                </form>
            </div>
        );
    }

    private async handleSubmit(): Promise<void> {
        const {email, password} = this.state.registerData;

        await this.accountApi.register(this.state.registerData);
        await this.authService.login(email, password);

        window.location.assign("/");
    }
}