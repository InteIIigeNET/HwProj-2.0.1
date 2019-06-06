import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography';
import {TasksApi, CreateTaskViewModel} from "../api/homeworks/api";

interface IAddTaskProps {
    id: number,
    onAdding: () => void,
    onCancel: () => void
}

export default class AddTask extends React.Component<IAddTaskProps, CreateTaskViewModel> {
    constructor(props : IAddTaskProps) {
        super(props);
        this.state = {
            title: "",
            description: ""
        };
    }

    public handleSubmit(e: any) {
        let api = new TasksApi();
        api.addTask(this.props.id, this.state)
            .then(taskId => console.log(taskId))
            .then(this.props.onAdding);
    }

    public render() {
        return (<div>
            <Typography variant='subtitle1'>Добавить задачу</Typography>
            <form onSubmit={e => this.handleSubmit(e)}>
                <TextField
                    required
                    label="Название задачи"
                    variant="outlined"
                    margin="normal"
                    value={this.state.title}
                    onChange={e => this.setState({ title: e.target.value })}
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
                    value={this.state.description}
                    onChange={e => this.setState({ description: e.target.value })}
                />
                <br />
                <Button size="small" variant="contained" color="primary" type="submit">Добавить задачу</Button>
                &nbsp;
                <Button onClick={() => this.props.onCancel()} size="small" variant="contained" color="primary">Отменить</Button>
            </form>
        </div>);
    }
}