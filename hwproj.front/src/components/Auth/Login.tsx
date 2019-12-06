import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import AuthService from "../../services/AuthService";

interface ILoginState {
    email: string;
    password: string;
    logged: boolean;
}

export default class Login extends React.Component<{}, ILoginState> {
    authService = new AuthService();

    constructor(props: {}) {
        super(props);
        this.state = {
            email: "",
            password: "",
            logged: this.authService.isLoggedIn()
        };
    }

    render(): JSX.Element {
        if (this.state.logged) {
            return <Redirect to={"/"} />;
        }
        return (
            <div className="container">
                <Typography variant="h6" gutterBottom>Войти</Typography>
                <form onSubmit={this.handleSubmit}>
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
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value})}
                    />
                    <br />
                    <Button size="small" variant="contained" color="primary" type="submit">Войти</Button>
                </form>
            </div>
        );
    }

    private handleSubmit = async () => {
        const {email, password} = this.state;

        await this.authService.login(email, password);
        window.location.assign("/");
    }
}