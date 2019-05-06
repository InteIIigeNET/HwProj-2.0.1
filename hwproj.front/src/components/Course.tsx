import * as React from 'react';
import { CourseViewModel, CoursesApi } from "../api/courses/api";
import CourseHomework from "./CourseHomework"
import {RouteComponentProps} from "react-router-dom"
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AddHomework from './AddHomework';
import CourseStudents from'./CourseStudents';

const userId = "1";

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
                return (
                    <div className="container">
                        <div className="d-flex justify-content-between">
                            <div>
                                <Typography variant="h5">
                                    {course.name}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    {course.groupName}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="h5">
                                    Mentod ID: {course.mentorId}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => this.joinCourse()}>Записаться</Button>
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
                                <CourseHomework forMentor={this.state.course.mentorId === userId} id={+this.props.match.params.id} />
                            </div>
                        }
                        {(userId === this.state.course.mentorId && !createHomework) &&
                            <div>
                                <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => { this.setState({createHomework: true })}}>Добавить домашку</Button>
                                <CourseHomework forMentor={this.state.course.mentorId === userId} id={+this.props.match.params.id} />
                            </div>
                        }
                        {userId !== this.state.course.mentorId &&
                            <CourseHomework forMentor={this.state.course.mentorId === userId} id={+this.props.match.params.id} />
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
        let api = new CoursesApi();
        api.signInCourse(+this.props.match.params.id, 55);
    }

    componentDidMount(): void {
        let api = new CoursesApi();
        api.get(+this.props.match.params.id)
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