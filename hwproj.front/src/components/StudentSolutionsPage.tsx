import * as React from 'react';
import {RouteComponentProps, Link} from "react-router-dom";
import AuthService from '../services/AuthService';
import { CourseViewModel, CoursesApi } from '../api/courses/api'
import { TasksApi, HomeworksApi, HomeworkTaskViewModel } from '../api/homeworks/api'
import Typography from '@material-ui/core/Typography'
import Task from './Task'
import TaskSolutions from './TaskSolutions'

interface IStudentSolutionsPageProps {
    taskId: string,
    studentId: string
}

interface IStudentSolutionsPageState {
    task: HomeworkTaskViewModel,
    isLoaded: boolean,
    course: CourseViewModel
}

export default class StudentSolutionsPage extends React.Component<RouteComponentProps<IStudentSolutionsPageProps>, IStudentSolutionsPageState> {
    authService = new AuthService();
    coursesApi = new CoursesApi();
    tasksApi = new TasksApi();
    homeworksApi = new HomeworksApi();
    constructor(props : RouteComponentProps<IStudentSolutionsPageProps>) {
        super(props);
        this.state = {
            task: {},
            isLoaded: false,
            course: {}
        }
    }

    public render() {
        const { isLoaded } = this.state;
        let userId = this.authService.isLoggedIn() ? this.authService.getProfile()._id : undefined;

        if (isLoaded) {
            if (!this.authService.isLoggedIn() ||
                userId !== this.state.course.mentorId!) {
                return <Typography variant='h6'>Страница не найдена</Typography>
            }

            return (
                <div>
                    &nbsp; <Link to={'/courses/' + this.state.course.id!.toString()}>Назад к курсу</Link>
                    <br />
                    <br />
                    <div className="container">
                        <Task task={this.state.task} forStudent={false} forMentor={true} onDeleteClick={() => 0} />
                        <TaskSolutions forMentor={true} taskId={+this.props.match.params.taskId} studentId={this.props.match.params.studentId} />
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
                        task: task,
                        isLoaded: true,
                        course: course
                    }))));
    }
}