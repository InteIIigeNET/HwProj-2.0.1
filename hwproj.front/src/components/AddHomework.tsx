import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {HomeworksApi, CreateHomeworkViewModel, CreateTaskViewModel, TasksApi} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router-dom"
import { Typography } from '@material-ui/core';

interface ICreateHomeworkProps {
    id: number
    onSubmit: () => void
}

interface ICreateHomeworkState {
    title: string,
    description: string,
    tasks: CreateTaskViewModel[]
}

export default class CreateCourse extends React.Component<ICreateHomeworkProps, ICreateHomeworkState> {
    constructor(props : ICreateHomeworkProps) {
        super(props);
        this.state = {
            title: "",
            description: "",
            tasks: [{ title: "", description: ""}]
        };
    }

    public handleSubmit(e: any) {
        e.preventDefault();
        let homeworksApi = new HomeworksApi();
        let tasksApi = new TasksApi()
        homeworksApi.addHomework(this.props.id, {title: this.state.title, description: this.state.description})
            .then(homeworkId => this.state.tasks.forEach(t => {
                tasksApi.addTask(homeworkId, t)
            }))
            .then(this.props.onSubmit);
    }

    public render() {
        return (<div>
            <Typography variant='h6'>Добавить домашку</Typography>
            <form onSubmit={e => this.handleSubmit(e)}>
                <TextField
                    required
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
                <ol>
                    {this.state.tasks.map(task => <div>
                        <Typography variant='subtitle1'> Задача</Typography>
                        <TextField
                            required
                            label="Название задачи"
                            variant="outlined"
                            margin="normal"
                            name={task.title}
                            onChange={e => task.title = e.target.value}
                        />
                        <br />
                        <TextField
                            label="Условие задачи"
                            variant="outlined"
                            margin="normal"
                            name={task.description}
                            onChange={e => task.description = e.target.value}
                        />
                    </div>)}
                </ol>
                <Button variant="contained" color="primary" onClick={() => this.setState({tasks: [...this.state.tasks, { title: "", description: ""}]})}>Ещё задачу</Button>
                <br />
                <Button variant="contained" color="primary" type="submit">Добавить домашку</Button>
            </form>
        </div>);
    }
}