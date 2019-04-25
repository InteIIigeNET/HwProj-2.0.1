import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {HomeworksApi, CreateHomeworkViewModel} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router-dom"

interface ICreateHomeworkProps {
    id: number
}

export default class CreateCourse extends React.Component<ICreateHomeworkProps, CreateHomeworkViewModel> {
    constructor(props : ICreateHomeworkProps) {
        super(props);
        this.state = {
            title: "",
            description: ""
        };
    }

    public handleSubmit(e: any) {
        e.preventDefault();
        let api = new HomeworksApi();
        api.addHomework(this.props.id, this.state)
            .then(res => console.log(res));
    }

    public render() {
        return (<div>
            <h1>Добавить домашку</h1>
            <form onSubmit={e => this.handleSubmit(e)}>
                <TextField
                    label="Название домашки"
                    variant="outlined"
                    margin="normal"
                    name={this.state.title}
                    onChange={e => this.setState({ title: e.target.value})}
                />
                <br />
                <TextField
                    label="Описание домашки"
                    variant="outlined"
                    margin="normal"
                    value={this.state.description}
                    onChange={e => this.setState({ description: e.target.value})}
                />
                <br />
                <Button variant="contained" color="primary" type="submit">Добавить домашку</Button>
            </form>
        </div>);
    }
}