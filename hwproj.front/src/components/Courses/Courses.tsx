import * as React from "react";
import {Tab, Tabs, CircularProgress} from "@material-ui/core";
import {CoursesList} from "./CoursesList";
import {CoursePreviewView} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";

interface ICoursesState {
    isLoaded: boolean;
    myCourses: CoursePreviewView[];
    tabValue: number;
    isLecturer: boolean;
    isExpert: boolean;
}

interface Props {
    navigate: any,
    isLecturer: boolean;
    isExpert: boolean;
}

export default class Courses extends React.Component<Props, ICoursesState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoaded: false,
            myCourses: [],
            tabValue: 0,
            isLecturer: this.props.isLecturer,
            isExpert: this.props.isExpert
        };
    }

    public render() {
        const {isLoaded, myCourses, tabValue} = this.state;
        const {navigate} = this.props.navigate;

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
        const isExpert = this.props.isExpert
        let activeCoursesTab = activeCourses.length > 0 ? 0 : undefined
        let completedCoursesTab = completedCourses.length > 0
            ? activeCoursesTab === 0 ? 1 : 0
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
                    {completedCourses.length > 0 && <Tab label="Завершенные курсы"/>}
                </Tabs>
                <br/>
                {tabValue === activeCoursesTab &&
                    <CoursesList navigate={navigate} courses={activeCourses} isExpert={isExpert}/>}
                {tabValue === completedCoursesTab &&
                    <CoursesList navigate={navigate} courses={completedCourses} isExpert={isExpert}/>}
            </div>
        );
    }

    async componentDidMount() {
        try {
            const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet()
            this.setState({
                isLoaded: true,
                myCourses: courses.reverse(),
            })
        } catch (error) {
            this.setState({
                isLoaded: true
            })
        }
    }
}
