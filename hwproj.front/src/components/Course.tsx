import * as React from 'react';
import { CourseViewModel, CoursesApi } from "../api/courses/api";
import CourseHomework from "./CourseHomework"
import {RouteComponentProps, Route} from "react-router-dom"
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import AddHomework from './AddHomework';
import CourseStudents from './CourseStudents';
import AuthService from './AuthService';
import { Link as RouterLink } from 'react-router-dom'

interface ICourseState {
    isLoaded: boolean,
    isFound: boolean,
    course: CourseViewModel,
    createHomework: boolean
}

interface ICourseProp {
    id: string
}

export default class Course extends React.Component<RouteComponentProps<ICourseProp>, ICourseState> {
    authService = new AuthService();
    coursesApi = new CoursesApi();
    constructor(props : RouteComponentProps<ICourseProp>) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            course: {},
            createHomework: false
        };
    }

    public render() {
        const { isLoaded, isFound, course, createHomework } = this.state;
        if (isLoaded) {
            if (isFound) {
                let isLogged = this.authService.loggedIn();
                let userId = isLogged ? this.authService.getProfile()._id : undefined
                let isMentor = isLogged && userId === course.mentorId;
                let isSignedInCourse = isLogged && course.courseMates!.some(cm => cm.studentId === userId)
                let isAcceptedStudent = isLogged && course.courseMates!.some(cm => cm.studentId === userId && cm.isAccepted!)
                return (
                    <div className="container">
                        <div className="d-flex justify-content-between">
                            <div>
                                <Typography variant="h5">
                                    {course.name} &nbsp;
                                    {isMentor && 
                                        <RouterLink to={'./' + this.state.course.id + '/edit'}>
                                            <EditIcon fontSize="small" />
                                        </RouterLink>
                                    }
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    {course.groupName}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="h5">
                                    Mentod ID: {course.mentorId}
                                </Typography>
                                {(isLogged && !isSignedInCourse && !isMentor) &&
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => this.joinCourse()}>Записаться</Button>
                                }
                            </div>
                        </div>
                        <CourseStudents courseId={+this.props.match.params.id} />
                        <br />
                        {createHomework &&
                            <div>
                                <AddHomework
                                id={+this.props.match.params.id}
                                onCancel={() => this.componentDidMount()}
                                onSubmit={() => this.componentDidMount()} />
                                <CourseHomework forStudent={isAcceptedStudent} forMentor={isMentor} id={+this.props.match.params.id} />
                            </div>
                        }
                        {(isMentor && !createHomework) &&
                            <div>
                                <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => { this.setState({createHomework: true })}}>Добавить домашку</Button>
                                <CourseHomework forStudent={isAcceptedStudent} forMentor={isMentor} id={+this.props.match.params.id} />
                            </div>
                        }
                        {!isMentor &&
                            <CourseHomework forStudent={isAcceptedStudent} forMentor={isMentor} id={+this.props.match.params.id} />
                        }
                        
                    </div>
                )
            }

            return <Typography variant="h3">
                        Не удалось найти курс.
                    </Typography>
        }

        return <h1></h1>
    }

    joinCourse() {
        this.coursesApi.signInCourse(+this.props.match.params.id, 55);
    }

    componentDidMount(): void {
        this.coursesApi.get(+this.props.match.params.id)
            .then(res => res.json())
            .then(course => this.setState({
                isLoaded: true,
                isFound: true,
                course: course,
                createHomework: false
            }))
            .catch(err => this.setState({ isLoaded: true, isFound: false }))
    }
}