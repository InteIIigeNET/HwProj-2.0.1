import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Redirect } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { AccountApi } from '../api/auth/api'

interface IRegisterState {
    name: string,
    surname: string,
    email: string,
    password: string,
    confirmPassword: string,
    logged: boolean
}

export default class Register extends React.Component<{}, IRegisterState> {
    authService = new AuthService();
    authApi = new AccountApi();
    constructor(props: {}) {
        super(props);
        this.authService = new AuthService();
        this.state = {
            name: "",
            surname: "",
            email: "",
            password: "",
            confirmPassword: "",
            logged: this.authService.loggedIn()
        };  
    }

    public handleSubmit(e: any) {
        e.preventDefault();

        this.authApi.register({
            name: this.state.name,
            surname: this.state.surname,
            email: this.state.email,
            password: this.state.password,
            passwordConfirm: this.state.confirmPassword
        })
        .then(res => this.authService.login(this.state.email, this.state.password)
            .then(res => window.location.assign('/')));
    }

    public render() {
        if (this.state.logged) {
            return <Redirect to={'/'} />
        }

        return (
            <div className="container">
                <Typography variant='h6' gutterBottom>Регистрация</Typography>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <TextField
                        required
                        label="Имя"
                        variant="outlined"
                        margin="normal"
                        name={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })}
                    />
                    <br />
                    <TextField
                        required
                        label="Фамилия"
                        variant="outlined"
                        margin="normal"
                        name={this.state.surname}
                        onChange={e => this.setState({ surname: e.target.value })}
                    />
                    <br />
                    <TextField
                        required
                        type="email"
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        name={this.state.email}
                        onChange={e => this.setState({ email: e.target.value })}
                    />
                    <br />
                    <TextField
                        required
                        type="password"
                        label="Пароль"
                        variant="outlined"
                        margin="normal"
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value})}
                    />
                    <br />
                    <TextField
                        required
                        type="password"
                        label="Поддвердите пароль"
                        variant="outlined"
                        margin="normal"
                        value={this.state.confirmPassword}
                        onChange={e => this.setState({ confirmPassword: e.target.value})}
                    />
                    <br />
                    <Button size="small" variant="contained" color="primary" type="submit">Зарегистрироваться</Button>
                </form>
            </div>
        );
    }
}