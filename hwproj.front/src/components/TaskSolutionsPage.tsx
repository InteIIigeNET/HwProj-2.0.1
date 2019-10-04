import * as React from 'react';
import {RouteComponentProps, Link} from "react-router-dom"
import Task from './Task'
import Typography from '@material-ui/core/Typography'
import AddSolution from './AddSolution'
import Button from '@material-ui/core/Button'
import TaskSolutions from './TaskSolutions'
import { TasksApi, HomeworksApi, HomeworkTaskViewModel } from '../api/homeworks';
import { CoursesApi, CourseViewModel } from '../api/courses'
import AuthService from '../services/AuthService'

interface ITaskSolutionsProps {
    taskId: string
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    task: HomeworkTaskViewModel
    addSolution: boolean,
    course: CourseViewModel
}

export default class TaskSolutionsPage extends React.Component<RouteComponentProps<ITaskSolutionsProps>, ITaskSolutionsState> {
    authService = new AuthService();
    coursesApi = new CoursesApi();
    tasksApi = new TasksApi();
    homeworksApi = new HomeworksApi();
    constructor(props: RouteComponentProps<ITaskSolutionsProps>) {
        super(props);
        this.state = {
            isLoaded: false,
            task: {},
            addSolution: false,
            course: {}
        };
    }

    public render() {
        const { isLoaded } = this.state;
        let userId = this.authService.loggedIn() ? this.authService.getProfile()._id : undefined;

        if (isLoaded) {
            if (!this.authService.loggedIn() ||
                userId === this.state.course.mentorId ||
                !this.state.course.courseMates!.some(cm => cm.isAccepted! && cm.studentId === userId)) {
                return <Typography variant='h6'>Страница не найдена</Typography>
            }

            return (
                <div>
                    &nbsp; <Link to={'/courses/' + this.state.course.id!.toString()}>Назад к курсу</Link>
                    <br />
                    <br />
                    <div className="container">
                        <Task task={this.state.task} forStudent={true} forMentor={false} onDeleteClick={() => 3} />
                        {(!this.state.addSolution) && 
                            <div>
                                <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => { this.setState({addSolution: true })}}>Добавить решение</Button>
                                <br />
                                <TaskSolutions forMentor={false} taskId={+this.props.match.params.taskId} studentId={userId} />
                            </div>
                        }
                        {this.state.addSolution && 
                            <div>
                                <AddSolution
                                studentId={userId}
                                taskId={+this.props.match.params.taskId}
                                onAdding={() => this.componentDidMount()}
                                onCancel={() => this.componentDidMount()} />
                                <br />
                                <TaskSolutions forMentor={false} taskId={+this.props.match.params.taskId} studentId={userId} />
                            </div>
                        }
                        <br />
                        
                    </div>
                </div>
            )
        }

        return ""
    }

    componentDidMount() {
        this.tasksApi.getTask(+this.props.match.params.taskId)
            .then(res => res.json())
            .then(task => this.homeworksApi.getHomework(task.homeworkId)
                .then(res => res.json())
                .then(homework => this.coursesApi.get(homework.courseId)
                    .then(res => res.json())
                    .then(course => this.setState({
                        isLoaded: true,
                        addSolution: false,
                        task: task,
                        course: course
                    }))));
    }
}