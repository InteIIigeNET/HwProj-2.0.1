import * as React from 'react';
import TableCell from '@material-ui/core/TableCell'
import { TasksApi } from '../api/homeworks/api'

interface ITaskCellProps {
    taskId: number
}

interface ITaskCellState {
    title: string
}

export default class TaskCell extends React.Component<ITaskCellProps, ITaskCellState> {
    tasksClient = new TasksApi();
    constructor(props : ITaskCellProps) {
        super(props);
        this.state = {
            title: ""
        }
    }

    public render() {
        return <TableCell padding="none" component="td" align="center">{this.state.title}</TableCell>
    }

    componentDidMount() {
        this.tasksClient.getTask(this.props.taskId)
            .then(res => res.json())
            .then(task => this.setState({title: task.title}))
    }
}