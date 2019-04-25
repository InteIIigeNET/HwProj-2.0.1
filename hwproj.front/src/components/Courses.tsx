import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import { CourseViewModel, CoursesApi } from "../api/courses/api";
import classNames from 'classnames';
import { Typography } from '@material-ui/core';

interface ICoursesState {
    isLoaded: boolean,
    courses: CourseViewModel[]
}

export default class Course extends React.Component<{}, ICoursesState> {
    constructor(props : {}) {
        super(props);
        this.state = {
            isLoaded: false,
            courses: []
        };
    }

    public render() {
        const { isLoaded, courses} = this.state;
        if (isLoaded) {
            let coursesItems = courses.map(course => 
                    <ListItem key={course.id}>
                            <Link href={"/courses/" + course.id!.toString()}>
                                    {course.groupName} {course.name}
                            </Link>
                    </ListItem>
            ).reverse();

            return (
                <div>
                    <List>
                        {coursesItems}
                    </List>
                </div>
            )
        }

        return (<h1>Loading...</h1>);
    }

    componentDidMount(): void {
        let api = new CoursesApi();
        api.getAll()
            .then(courses => this.setState({
                isLoaded: true,
                courses: courses
            }))
    }
}