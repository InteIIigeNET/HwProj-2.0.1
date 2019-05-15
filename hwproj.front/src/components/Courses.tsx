import * as React from 'react';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { CourseViewModel, CoursesApi } from "../api/courses/api";
import { Link as RouterLink} from 'react-router-dom'

interface ICoursesState {
    isLoaded: boolean,
    courses: CourseViewModel[]
}

export default class Courses extends React.Component<{}, ICoursesState> {
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
            let courseList = courses.map(course => 
                    <li key={course.id}>
                            <RouterLink to={"/courses/" + course.id!.toString()}>
                                {course.name}
                            </RouterLink>
                            <br />
                            {course.groupName}
                    </li>
            ).reverse();

            return (
                <div className="container">
                    <Typography variant='h5' gutterBottom>Текущие курсы:</Typography>
                    <ul>
                        {courseList}
                    </ul>
                </div>
            )
        }

        return (<h1></h1>);
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