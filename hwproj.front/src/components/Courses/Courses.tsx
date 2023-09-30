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

export default class Courses extends React.Component<{ navigate: any }, ICoursesState> {
    constructor(props: { navigate: any }) {
        super(props);
        this.state = {
            isLoaded: false,
            myCourses: [],
            allCourses: [],
            tabValue: 0,
        };
    }

    public render() {
        const {isLoaded, allCourses, myCourses, tabValue} = this.state;
        const {navigate} = this.props

        if (!isLoaded) {
            return (
                <div className="container">
                    <p>Загрузка курсов...</p>
                    <CircularProgress/>
                </div>
            );
        }

        const activeCourses = myCourses.filter(course => !course.isCompleted)
        const completedCourses = myCourses.filter(course => course.isCompleted)

        let activeCoursesTab = activeCourses.length > 0 ? 0 : undefined
        let allCoursesTab = activeCoursesTab === 0 ? 1 : 0
        let completedCoursesTab = completedCourses.length > 0
            ? activeCoursesTab === 0 ? 2 : 1
            : undefined

        return (
            <div className="container">
                <Tabs
                    value={tabValue}
                    indicatorColor="primary"
                    onChange={(event, value) => {
                        this.setState({tabValue: value});
                    }}
                >
                    {activeCourses.length > 0 && <Tab label="Ваши курсы"/>}
                    <Tab label="Все курсы"/>
                    {completedCourses.length > 0 && <Tab label="Завершенные курсы"/>}
                </Tabs>
                <br/>
                {tabValue === activeCoursesTab && <CoursesList navigate={navigate} courses={activeCourses}/>}
                {tabValue === allCoursesTab && <CoursesList navigate={navigate} courses={allCourses}/>}
                {tabValue === completedCoursesTab && <CoursesList navigate={navigate} courses={completedCourses}/>}
            </div>
        );
    }

    async componentDidMount() {
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
