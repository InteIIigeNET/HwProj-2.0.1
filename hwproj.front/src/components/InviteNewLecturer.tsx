import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Redirect } from 'react-router-dom';
import { AccountApi } from '../api/auth/api';
import AuthService from '../services/AuthService';

interface IEditTaskState {
    userEmail: string,
    invited: boolean
}

export default class InviteNewLecturer extends React.Component<{}, IEditTaskState> {
    authService = new AuthService();
    constructor(props: {}) {
        super(props)
        this.state = {
            userEmail: "",
            invited: false
        };
    }
            
    public handleSubmit(e: any) {
        e.preventDefault();
        let api = new AccountApi();

        api.inviteNewLecturer({emailOfInvitedPerson: this.state.userEmail})
            .then(res => this.setState({invited: true}))
    }

    public render() {
        if (this.state.invited) {
            return <Redirect to={'/'} />
        }

        if (!this.authService.isLoggedIn() || this.authService.getProfile()._role !== "lecturer") {
            return <Typography variant='h6' gutterBottom>Страница не найдена</Typography>
        }

        return (
            <div>
                <div className="container">
                    <Typography variant='h6' gutterBottom>Пригласить преподавателя</Typography>
                    <form onSubmit={e => this.handleSubmit(e)}>
                        <TextField
                            required
                            label="Email пользователя"
                            variant="outlined"
                            margin="normal"
                            value={this.state.userEmail}
                            onChange={e => this.setState({ userEmail: e.target.value })}
                        />
                        <br />
                        <Button size="small" variant="contained" color="primary" type="submit">Пригласить</Button>
                    </form>
                </div>
            </div>
        );
    }
}