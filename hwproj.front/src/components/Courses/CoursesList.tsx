import * as React from "react";
import { CourseViewModel } from "../../api/courses/api";
import { Link as RouterLink} from "react-router-dom";

interface ICoursesProps {
    courses: CourseViewModel[];
}

export default class CoursesList extends React.Component< ICoursesProps > {
    public render() {
        const { courses } = this.props;

        return (
            <div className="container">
                {
                    courses.map(course =>
                    <li key={course.id}>
                        <RouterLink to={"/courses/" + course.id!.toString()}>
                            {course.name}
                        </RouterLink>
                        <br />
                        {course.groupName}
                    </li>).reverse()
                }
            </div>
        );
    }
}