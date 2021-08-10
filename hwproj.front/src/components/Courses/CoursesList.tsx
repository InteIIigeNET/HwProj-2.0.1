import * as React from "react";
import { CourseViewModel } from "../../api/";
import {
    Link as RouterLink,
    BrowserRouter as Router,
    Switch, Route, Link
} from "react-router-dom";

interface ICoursesProps {
    courses: CourseViewModel[];
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
    public render() {
        const { courses } = this.props;

        return (
            <div className="container">
                <Router>
                    {courses.map((course) => (
                    <li key={course.id} onClick={() => window.location.assign("/courses/"  + course.id!.toString())}>
                        <RouterLink to={"/courses/" + course.id!.toString()}>
                                {course.name}
                        </RouterLink>   
                        <br />
                        {course.groupName}
                    </li>
                    ))}
                </Router>
            </div>
        );
    }
}
