import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import Button from '@material-ui/core/Button'
import ReactMarkdown from 'react-markdown'
import { HomeworkTaskViewModel, TasksApi } from "../api/homeworks/api";
import AddSolution from './AddSolution'
import {Link as RouterLink} from 'react-router-dom'

interface ITaskState {
    isLoaded: boolean,
    isFound: boolean,
    task: HomeworkTaskViewModel
}

interface ITaskProp {
    id: number,
    forMentor: boolean
    onDeleteClick: () => void
}

export default class Task extends React.Component<ITaskProp, ITaskState> {
    constructor(props : ITaskProp) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            task: {}
        };
    }

    public render() {
        const { isLoaded, isFound, task} = this.state;
        
        if (isLoaded) {
            if (isFound) {
                return (
                    <div>
                        <Typography variant="subtitle1">
                            <RouterLink to={"/task/" + task.id!.toString() + "/55"}>
                                {task.title}
                            </RouterLink>
                            {this.props.forMentor && 
                                    <IconButton aria-label="Delete" onClick={() => this.deleteTask()}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                            }
                            {this.props.forMentor && 
                                    <RouterLink to={'/task/' + task.id!.toString() + '/edit'}>
                                        <EditIcon fontSize="small" />
                                    </RouterLink>
                            }
                        </Typography>
                        
                        <Typography variant="body1">
                            <ReactMarkdown source={task.description} />
                        </Typography>
                    </div>
                );
            }
            else {
                return <Typography variant="h2" gutterBottom>
                            Не удалось найти задачу.
                        </Typography>
            }
        }

        return (<h1></h1>);
    }

    deleteTask(): void {
        let api = new TasksApi();
        api.deleteTask(this.props.id)
            .then(res => this.props.onDeleteClick())
    }

    componentDidMount(): void {
        let api = new TasksApi();
        api.getTask(this.props.id)
            .then(res => res.json())
            .then(task => this.setState({
                isLoaded: true,
                isFound: true,
                task: task
            }))
            .catch(err => this.setState({ isLoaded: true, isFound: false }))
    }
}