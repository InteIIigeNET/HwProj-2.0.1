import * as React from "react";
import {Tab, Tabs, CircularProgress} from "@material-ui/core";
import {CoursesList} from "./CoursesList";
import {CoursePreviewView} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";

interface ICoursesState {
    isLoaded: boolean;
    myCourses: CoursePreviewView[];
    allCourses: CoursePreviewView[];
    tabValue: number;
}

export default class Courses extends React.Component<{}, ICoursesState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoaded: false,
            myCourses: [],
            allCourses: [],
            tabValue: 0,
        };
    }

    public render() {
        const {isLoaded, allCourses, myCourses: courses, tabValue} = this.state;

        if (!isLoaded) {
            return (
                <div className="container">
                    <p>Загрузка курсов...</p>
                    <CircularProgress/>
                </div>
            );
        }

        let activeCourses = courses.filter((course) => !course.isCompleted);
        let completedCourses = courses.filter((course) => course.isCompleted);

        let activeCoursesTab = activeCourses.length > 0 ? 1 : 2;
        let completedCoursesTab = activeCourses.length > 0 ? 2 : 1;
        return (
            <div className="container">
                <Tabs
                    value={tabValue}
                    indicatorColor="primary"
                    onChange={(event, value) => {
                        this.setState({tabValue: value});
                    }}
                >
                    <Tab label="Все курсы"/>
                    {activeCourses.length > 0 && <Tab label="Ваши курсы"/>}
                    {completedCourses.length > 0 && <Tab label="Завершенные курсы"/>}
                </Tabs>
                <br/>
                {tabValue === 0 && <CoursesList courses={allCourses}/>}
                {tabValue === activeCoursesTab && <CoursesList courses={activeCourses}/>}
                {tabValue === completedCoursesTab && <CoursesList courses={completedCourses}/>}
            </div>
        );
    }

    async componentDidMount() {
        if (!ApiSingleton.authService.isLoggedIn()) {
            window.location.assign("/login");
        }
        try {
            const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet()
            const allCourses = await ApiSingleton.coursesApi.apiCoursesGet();
            this.setState({
                isLoaded: true,
                myCourses: courses.reverse(),
                allCourses: allCourses.reverse(),
            })
        } catch (error) {
            this.setState({
                isLoaded: true
            })
        }
    }
}
