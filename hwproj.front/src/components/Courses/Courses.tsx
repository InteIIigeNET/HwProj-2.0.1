import * as React from "react";
import {Tab, Tabs, CircularProgress} from "@material-ui/core";
import {CoursesList} from "./CoursesList";
import {CoursePreviewView} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";
import {UserRoles} from "../Auth/UserRoles";

const Roles = UserRoles.Roles;

interface ICoursesState {
    isLoaded: boolean;
    myCourses: CoursePreviewView[];
    allCourses: CoursePreviewView[];
    tabValue: number;
    role: UserRoles.Roles
}

interface Props {
    navigate: any,
    role: UserRoles.Roles
}

export default class Courses extends React.Component<Props, ICoursesState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoaded: false,
            myCourses: [],
            allCourses: [],
            tabValue: 0,
            role: props.role
        };
    }

    public render() {
        const {isLoaded, allCourses, myCourses, tabValue} = this.state;
        const {navigate} = this.props.navigate;
        const role = this.props.role;

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
                    {(role == Roles.Lecturer || role == Roles.Student) && <Tab label="Все курсы"/>}
                    {completedCourses.length > 0 && <Tab label="Завершенные курсы"/>}
                </Tabs>
                <br/>
                {tabValue === activeCoursesTab && <CoursesList navigate={navigate} courses={activeCourses}/>}
                {tabValue === allCoursesTab && (role == Roles.Lecturer || role == Roles.Student)
                    && <CoursesList navigate={navigate} courses={allCourses}/>}
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
