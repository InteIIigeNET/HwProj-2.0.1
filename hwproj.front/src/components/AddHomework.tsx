import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography';
import {HomeworksApi, CreateTaskViewModel, TasksApi} from "../api/homeworks/api";

interface IAddHomeworkProps {
    id: number
    onSubmit: () => void
}

interface IAddHomeworkState {
    title: string,
    description: string,
    tasks: CreateTaskViewModel[]
}

export default class AddHomework extends React.Component<IAddHomeworkProps, IAddHomeworkState> {
    constructor(props : IAddHomeworkProps) {
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
                    multiline
                    fullWidth
                    rows="4"
                    rowsMax="15"
                    label="Описание домашки"
                    variant="outlined"
                    margin="normal"
                    name={this.state.description}
                    onChange={e => this.setState({ description: e.target.value})}
                />
                <ol>
                        {this.state.tasks.map((task, index) =>
                        <li key={index}>
                            <Typography variant='subtitle1'>Задача</Typography>
                            <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.setState({
                                    tasks: this.state.tasks.slice(0, this.state.tasks.length - 1)
                                })}>
                                Убрать задачу
                            </Button>

                            <br />
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
                                multiline
                                fullWidth
                                rows="4"
                                rowsMax="15"
                                label="Условие задачи"
                                variant="outlined"
                                margin="normal"
                                name={task.description}
                                onChange={e => task.description = e.target.value}
                            />
                        </li>)}
                </ol>
                <Button variant="contained" color="primary" onClick={() => this.setState({tasks: [...this.state.tasks, { title: "", description: ""}]})}>Ещё задачу</Button>
                <br />
                <Button variant="contained" color="primary" type="submit">Добавить домашку</Button>
            </form>
        </div>);
    }
}