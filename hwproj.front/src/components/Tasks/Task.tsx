import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ReactMarkdown from 'react-markdown'
import { HomeworkTaskViewModel } from "../../api";
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";

interface ITaskProp {
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    forStudent: boolean,
    onDeleteClick: () => void
}

export default class Task extends React.Component<ITaskProp, {}> {
    public render() {
        let task = this.props.task;
        let deadlineDate = new Date(task.deadlineDate!.toString()).toLocaleString("ru-RU")
        let publicationDate = new Date(task.publicationDate!.toString()).toLocaleString("ru-RU")
        return (
            <div>
                <Typography variant="subtitle1">
                    {this.props.forStudent &&
                        <RouterLink to={"/task/" + task.id!.toString()}>
                            {task.title}
                        </RouterLink>
                    }

                    {!this.props.forStudent && task.title}
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
                <Typography>
                    Дата публикации: {publicationDate}
                </Typography>

                <Typography>
                    Дедлайн: {deadlineDate}
                </Typography>
            </div>
        );
    }

    deleteTask(): void {
        ApiSingleton.tasksApi.apiTasksDeleteByTaskIdDelete(this.props.task.id!)
            .then(res => this.props.onDeleteClick())
    }
}