import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {TasksApi, CreateTaskViewModel} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router-dom"
import { Typography } from '@material-ui/core';

interface ICreateTaskProps {
    id: number
    onAdding: () => void
}

export default class AddTask extends React.Component<ICreateTaskProps, CreateTaskViewModel> {
    constructor(props : ICreateTaskProps) {
        super(props);
        this.state = {
            title: "",
            description: ""
        };
    }

    public handleSubmit(e: any) {
        e.preventDefault();
        let api = new TasksApi();
        api.addTask(this.props.id, this.state)
            .then(this.props.onAdding);
    }

    public render() {
        return (<div>
            <Typography variant='h6'>Добавить задачу</Typography>
            <form onSubmit={e => this.handleSubmit(e)}>
                <TextField
                    label="Название задачи"
                    variant="outlined"
                    margin="normal"
                    name={this.state.title}
                    onChange={e => this.setState({ title: e.target.value})}
                />
                <br />
                <TextField
                    label="Условие задачи"
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