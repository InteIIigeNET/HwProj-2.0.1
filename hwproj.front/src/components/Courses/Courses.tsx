import * as React from "react";
import { Tab, Tabs, CircularProgress } from "@material-ui/core";
import { CoursesList } from "./CoursesList";
import { CourseViewModel } from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";

interface ICoursesState {
  isLoaded: boolean;
  courses: CourseViewModel[];
  tabValue: number;
}

export default class Courses extends React.Component<{}, ICoursesState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoaded: false,
            courses: [],
            tabValue: 0,
        };
    }

    public render() {
        const { isLoaded, courses, tabValue } = this.state;

        if (!isLoaded) {
            return (
                <div className="container">
                    <p>Loading courses...</p>
                    <CircularProgress />
                </div>
            );
        }

        let activeCourses = courses.filter((course) => !course.isCompleted);
        let completedCourses = courses.filter((course) => course.isCompleted);
        debugger
        return (
            <div className="container">
                <Tabs
                    value={tabValue}
                    indicatorColor="primary"
                    onChange={(event, value) => { this.setState({ tabValue: value }); }}
                >
                    <Tab label="Текущие курсы" />
                    <Tab label="Завершенные курсы" />
                </Tabs>
                <br />
                {tabValue === 0 && <CoursesList courses={activeCourses} />}
                {tabValue === 1 && <CoursesList courses={completedCourses} />}
            </div>
        );
    }

    async componentDidMount(){
        if (!ApiSingleton.authService.isLoggedIn()) {
            window.location.assign("/login");
        }
        const token = ApiSingleton.authService.getToken();
        try {
            const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet({ headers: {"Authorization": `Bearer ${token}`}})
            this.setState({
                isLoaded: true,
                courses: courses
            })
        }
        catch(error)
        {
            this.setState({
                isLoaded: true
            })
        }
    }
}
