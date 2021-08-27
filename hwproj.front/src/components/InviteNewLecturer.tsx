import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import ApiSingleton from "../api/ApiSingleton";

interface IEditTaskState {
  userEmail: string;
  invited: boolean;
  errors: string[];
}

export default class InviteNewLecturer extends React.Component<{}, IEditTaskState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            userEmail: "",
            invited: false,
            errors: [],
        };
    }

    public handleSubmit(e: any) {
        e.preventDefault();
        ApiSingleton.accountApi
            .apiAccountInviteNewLecturerPost({ email: this.state.userEmail })
            .then((res) => {
                this.setState(
                    {
                        invited: res.succeeded!,
                        errors: res.errors!,
                    }
                );
            });
    }

    public render() {
        if (this.state.invited) {
            return <Redirect to={"/"} />;
        }

        if (!ApiSingleton.authService.isLecturer()) {
            return (
                <Typography variant="h6" gutterBottom>
                    Страница не найдена
                </Typography>
            );
        }

        return (
        <div className="page">
            <Typography component="h1" variant="h5">
                Пригласить преподавателя
            </Typography>
            <form onSubmit={(e) => this.handleSubmit(e)} className="form">
            <TextField
                required
                label="Email Address"
                variant="outlined"
                margin="normal"
                className="lecturerInput"
                value={this.state.userEmail}
                onChange={(e) => this.setState({ userEmail: e.target.value })}
            />
            <br/>
            <Button
                size="large"
                variant="contained"
                color="primary"
                type="submit"
                className="inviteButton"
            >
                Пригласить
            </Button>
            </form>

            {this.state.errors && (
                <p style={{ color: "red", marginBottom: "0" }}>{this.state.errors}</p>
            )}
        </div>
        );
    }
}
