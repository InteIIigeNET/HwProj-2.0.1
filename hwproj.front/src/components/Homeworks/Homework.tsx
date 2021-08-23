import * as React from 'react';
import { Button, IconButton } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ReactMarkdown from 'react-markdown';
import { HomeworkViewModel } from "../../api";
import AddTask from'../Tasks/AddTask'
import HomeworkTasks from '../Tasks/HomeworkTasks'
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from '../../api/ApiSingleton';

interface IHomeworkProps {
    homework: HomeworkViewModel,
    forMentor: boolean,
    forStudent: boolean,
    onDeleteClick: () => void
}

interface IHomeworkState {
    createTask: boolean
}

export default class Homework extends React.Component<IHomeworkProps, IHomeworkState> {
    constructor(props : IHomeworkProps) {
        super(props);
        this.state = {
            createTask: false
        };
    }

    public render() {
        let homeworkDateString = new Date(this.props.homework.date!.toString()).toLocaleDateString("ru-RU");
        return (
            <div className="container">
                <b>{this.props.homework.title}</b> {homeworkDateString}
                {this.props.forMentor &&
                    <IconButton aria-label="Delete" onClick={() => this.deleteHomework()}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                }
                {this.props.forMentor && 
                        <RouterLink to={'/homework/' + this.props.homework.id!.toString() + '/edit'}>
                            <EditIcon fontSize="small" />
                        </RouterLink>
                }
                <ReactMarkdown source={this.props.homework.description} />
                {(this.props.forMentor && this.state.createTask) && 
                    <div>
                        <HomeworkTasks onDelete={() => this.props.onDeleteClick()} tasks={this.props.homework.tasks!} forStudent={this.props.forStudent} forMentor={this.props.forMentor} />
                        <AddTask
                            id={this.props.homework.id!}
                            onAdding={() => window.location.reload()}
                            onCancel={() => this.setState({createTask: false})}
                            update={() => this.props.onDeleteClick()} 
                        />
                    </div>
                }
                {(this.props.forMentor && !this.state.createTask) &&
                    <div>
                        <HomeworkTasks onDelete={() => this.props.onDeleteClick()} tasks={this.props.homework.tasks!} forStudent={this.props.forStudent} forMentor={this.props.forMentor} />
                        <Button
                            style={{ marginTop: "10px" }}
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => { this.setState({createTask: true })}}>Добавить задачу</Button>
                    </div>
                }
                {!this.props.forMentor &&
                    <HomeworkTasks onDelete={() => this.props.onDeleteClick()} tasks={this.props.homework.tasks!} forStudent={this.props.forStudent} forMentor={this.props.forMentor} />
                }
            </div>
        )
    }

    deleteHomework(): void {
        const token = ApiSingleton.authService.getToken()
        ApiSingleton.homeworksApi.apiHomeworksDeleteByHomeworkIdDelete(this.props.homework.id!, { headers: {"Authorization": `Bearer ${token}`} })
            .then(res => this.props.onDeleteClick());
    }

}