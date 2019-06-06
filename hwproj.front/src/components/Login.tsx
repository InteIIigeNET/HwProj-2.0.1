import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Redirect } from 'react-router-dom';
import AuthService from '../services/AuthService';

interface ILoginState {
    email: string,
    password: string,
    logged: boolean,
}

export default class Login extends React.Component<{}, ILoginState> {
    auth = new AuthService();
    constructor(props: {}) {
        super(props);
        this.auth = new AuthService();
        this.state = {
            email: "",
            password: "",
            logged: this.auth.loggedIn()
        };  
    }

    public handleSubmit(e: any) {
        e.preventDefault();
      
        this.auth.login(this.state.email, this.state.password)
            .then((res : any) => window.location.assign('/'))
            .catch((err : any) =>{
                alert(err);
            })
    }

    public render() {
        if (this.state.logged) {
            return <Redirect to={'/'} />
        }
        return (
            <div className="container">
                <Typography variant='h6' gutterBottom>Войти</Typography>
                <form onSubmit={e => this.handleSubmit(e)}>
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
}