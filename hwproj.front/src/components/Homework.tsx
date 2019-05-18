import * as React from 'react';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ReactMarkdown from 'react-markdown';
import { HomeworkViewModel, HomeworksApi} from "../api/homeworks/api";
import AddTask from'./AddTask'
import HomeworkTasks from './HomeworkTasks'
import EditIcon from '@material-ui/icons/Edit'
import {Link as RouterLink} from 'react-router-dom'

interface IHomeworkProps {
    id: number,
    forMentor: boolean,
    forStudent: boolean,
    onDeleteClick: () => void
}

interface IHomeworkState {
    isLoaded: boolean,
    isFound: boolean,
    homework: HomeworkViewModel,
    createTask: boolean
}

export default class Homework extends React.Component<IHomeworkProps, IHomeworkState> {
    constructor(props : IHomeworkProps) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            homework: {},
            createTask: false
        };
    }

    public render() {
        const { isLoaded, isFound, homework, createTask } = this.state;

        if (isLoaded) {
            if (isFound) {
                let homeworkDateString = new Date(homework.date!.toString()).toLocaleDateString("ru-RU");
                return (
                    <div className="container">
                        <b>{homework.title}</b> {homeworkDateString}
                        {this.props.forMentor &&
                            <IconButton aria-label="Delete" onClick={() => this.deleteHomework()}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        }
                        {this.props.forMentor && 
                                <RouterLink to={'/homework/' + homework.id!.toString() + '/edit'}>
                                    <EditIcon fontSize="small" />
                                </RouterLink>
                        }
                        <ReactMarkdown source={homework.description} />
                        {(this.props.forMentor && this.state.createTask) && 
                            <div>
                                <HomeworkTasks forStudent={this.props.forStudent} forMentor={this.props.forMentor} id={this.props.id} />
                                <AddTask
                                id={homework.id!}
                                onAdding={() => this.setState({createTask: false})}
                                onCancel={() => this.setState({createTask: false})} />
                            </div>
                        }
                        {(this.props.forMentor && !this.state.createTask) &&
                            <div>
                                <HomeworkTasks forStudent={this.props.forStudent} forMentor={this.props.forMentor} id={this.props.id} />
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => { this.setState({createTask: true })}}>Добавить задачу</Button>
                            </div>
                        }
                        {!this.props.forMentor &&
                            <HomeworkTasks forStudent={this.props.forStudent} forMentor={this.props.forMentor} id={this.props.id} />
                        }
                    </div>
                )
            }
        }

        return <h1></h1>
    }

    deleteHomework(): void {
        let api = new HomeworksApi();
        api.deleteHomework(this.props.id)
            .then(res => this.props.onDeleteClick());
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getHomework(this.props.id)
            .then(res => res.json())
            .then(homework => this.setState({
                isLoaded: true,
                isFound: true,
                homework: homework
            }))
            .catch(err => this.setState({
                isLoaded: true,
                isFound: false
            }));
    }
}