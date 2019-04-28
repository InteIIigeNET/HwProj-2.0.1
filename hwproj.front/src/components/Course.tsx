import * as React from 'react';
import { CourseViewModel, CoursesApi } from "../api/courses/api";
import CourseHomework from "./CourseHomework"
import {RouteComponentProps} from "react-router-dom"
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AddHomework from './AddHomework'

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
                    <div>
                        <Typography variant="h3" gutterBottom>
                            {course.name}
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            {course.groupName}
                        </Typography>
                        {createHomework &&
                            <div>
                                <AddHomework
                                id={+this.props.match.params.id}
                                onSubmit={() => { this.setState({createHomework: false })}} />
                                <CourseHomework id={+this.props.match.params.id} />
                            </div>
                        }
                        {!createHomework &&
                            <div>
                                <Button
                                variant="contained"
                                color="primary"
                                onClick={() => { this.setState({createHomework: true })}}>Добавить домашку</Button>
                                <CourseHomework id={+this.props.match.params.id} />
                            </div>
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

    componentDidMount(): void {
        let api = new CoursesApi();
        api.get(+this.props.match.params.id)
            .then(res => res.json())
            .then(course => this.setState({
                isLoaded: true,
                isFound: true,
                course: course
            }))
            .catch(err => this.setState({ isLoaded: true, isFound: false }))
    }
}