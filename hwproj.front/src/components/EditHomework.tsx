import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Redirect, Link } from 'react-router-dom';
import { HomeworksApi } from "../api/homeworks/api";
import { CoursesApi } from "../api/courses/api"
import {RouteComponentProps} from "react-router-dom"
import AuthService from '../services/AuthService'

interface IEditHomeworkState {
    isLoaded: boolean,
    title: string,
    description: string,
    courseId: number,
    courseMentorId: string,
    edited: boolean
}

interface IEditHomeworkProps {
    homeworkId: string
}

export default class EditHomework extends React.Component<RouteComponentProps<IEditHomeworkProps>, IEditHomeworkState> {
    homeworkApi = new HomeworksApi();
    coursesApi = new CoursesApi();
    authService = new AuthService();
    constructor(props: RouteComponentProps<IEditHomeworkProps>) {
        super(props)
        this.state = {
            isLoaded: false,
            title: "",
            description: "",
            courseId: 0,
            courseMentorId: "",
            edited: false
        };
    }
            
    public handleSubmit(e: any) {
        e.preventDefault();

        let homeworkViewModel = {
            title: this.state.title,
            description: this.state.description
        };

        this.homeworkApi.updateHomework(+this.props.match.params.homeworkId, homeworkViewModel)
            .then(res => this.setState({edited: true}))
    }

    public render() {
        if (this.state.edited) {
            return <Redirect to={'/courses/' + this.state.courseId} />
        }

        if (this.state.isLoaded) {
            if (!this.authService.loggedIn() || this.authService.getProfile()._id !== this.state.courseMentorId) {
                return <Typography variant='h6' gutterBottom>Только преподаватель может редактировать домашку</Typography>
            }
            return (
                <div>
                    &nbsp; <Link to={'/courses/' + this.state.courseId.toString()}>Назад к курсу</Link>
                    <br />
                    <br />
                    <div className="container">
                        <Typography variant='h6' gutterBottom>Редактировать домашку</Typography>
                        <form onSubmit={e => this.handleSubmit(e)}>
                            <TextField
                                required
                                label="Название домашки"
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
                                label="Описание домашки"
                                variant="outlined"
                                margin="normal"
                                value={this.state.description}
                                onChange={e => this.setState({ description: e.target.value})}
                            />
                            <br />
                            <Button size="small" variant="contained" color="primary" type="submit">Редактировать домашку</Button>
                        </form>
                    </div>
                </div>
            );
        }

        return "";
    }

    componentDidMount() {
        this.homeworkApi.getHomework(+this.props.match.params.homeworkId)
            .then(res => res.json())
            .then(homework => this.coursesApi.get(homework.courseId)
                .then(res => res.json())
                .then(course => this.setState({
                    isLoaded: true,
                    title: homework.title,
                    description: homework.description,
                    courseId: homework.courseId,
                    courseMentorId: course.mentorId
        })))
    }
}