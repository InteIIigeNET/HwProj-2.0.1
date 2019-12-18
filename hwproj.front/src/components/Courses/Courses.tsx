import * as React from "react";
import { CourseViewModel } from "../../api/courses/api";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {CoursesList} from "./CoursesList"
import ApiSingleton from "../../api/ApiSingleton";

interface ICoursesState {
    isLoaded: boolean;
    courses: CourseViewModel[];
    tabValue: number;
}

export default class Courses extends React.Component<{}, ICoursesState> {
    constructor(props : {}) {
        super(props);
        this.state = {
            isLoaded: false,
            courses: [],
            tabValue: 0
        };
    }

    public render() {
        const { isLoaded, courses, tabValue } = this.state;

        if (isLoaded) {
            let activeCourses = courses.filter(course => !course.isComplete);

            let completedCourses = courses.filter(course => course.isComplete);

            return (
                <div className="container">
                    <Tabs value={tabValue} onChange={(event, value) => {this.setState({tabValue: value});}}>
                        <Tab label="Текущие курсы" />
                        <Tab label="Завершенные курсы" />
                    </Tabs>
                    <br />
                        {tabValue === 0 && <CoursesList courses={activeCourses} />}
                        {tabValue === 1 && <CoursesList courses={completedCourses} />}
                </div>
            );
        }

        return (<h1></h1>);
    }

    componentDidMount(): void {
        ApiSingleton.coursesApi.getAll()
            .then(courses => this.setState({
                isLoaded: true,
                courses: courses
            }));
    }
}