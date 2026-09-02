import * as React from "react";
import {Tab, Tabs} from "@mui/material";
import {CoursesList} from "./CoursesList";
import {CoursePreviewView} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import {appBarStateManager} from "../AppBar";

// Оформление вкладок согласовано со страницей курса: у v5 дефолты Tabs отличаются от v4
const tabsSx = {
    minHeight: 44,
    "& .MuiTab-root": {
        minHeight: 44,
        px: 2,
        textTransform: "none",
        fontSize: "0.95rem",
        fontWeight: 500,
    },
    "& .MuiTabs-indicator": {height: 3, borderRadius: "3px 3px 0 0"},
}

interface ICoursesState {
    isLoaded: boolean;
    myCourses: CoursePreviewView[];
    allCourses: CoursePreviewView[];
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
            allCourses: [],
            tabValue: 0,
            isLecturer: this.props.isLecturer,
            isExpert: this.props.isExpert
        };
    }

    public render() {
        const {isLoaded, allCourses, myCourses, tabValue} = this.state;
        const {navigate} = this.props.navigate;

        const activeCourses = myCourses.filter(course => !course.isCompleted)
        const completedCourses = myCourses.filter(course => course.isCompleted)
        const isExpert = this.props.isExpert
        let activeCoursesTab = activeCourses.length > 0 ? 0 : undefined
        let allCoursesTab = activeCoursesTab === 0 ? 1 : 0
        let completedCoursesTab = completedCourses.length > 0
            ? activeCoursesTab === 0 ? 2 : 1
            : undefined

        return (
            <div className="container">
                <Tabs
                    style={{marginBottom: 10}}
                    variant="scrollable"
                    scrollButtons={"auto"}
                    value={tabValue}
                    indicatorColor="primary"
                    sx={tabsSx}
                    onChange={(event, value) => {
                        this.setState({tabValue: value});
                    }}
                >
                    {activeCourses.length > 0 && <Tab label="Ваши курсы"/>}
                    {!isExpert && <Tab label="Все курсы"/>}
                    {completedCourses.length > 0 && <Tab label="Завершенные курсы"/>}
                </Tabs>
                {tabValue === activeCoursesTab &&
                    <CoursesList navigate={navigate} courses={isLoaded ? activeCourses : undefined}
                                 isExpert={isExpert}/>}
                {tabValue === allCoursesTab && !isExpert
                    &&
                    <CoursesList navigate={navigate} courses={isLoaded ? allCourses : undefined} isExpert={isExpert}/>}
                {tabValue === completedCoursesTab &&
                    <CoursesList navigate={navigate} courses={isLoaded ? completedCourses : undefined}
                                 isExpert={isExpert}/>}
            </div>
        );
    }

    async componentDidMount() {
        appBarStateManager.setContextAction(null)
        try {
            ApiSingleton.coursesApi.coursesGetAllUserCourses().then(courses => {
                this.setState(prevState => ({
                    ...prevState,
                    isLoaded: true,
                    myCourses: courses.reverse()
                }));
                ApiSingleton.coursesApi.coursesGetAllCourses().then(allCourses => {
                    this.setState(prevState => ({
                        ...prevState,
                        allCourses: allCourses.reverse(),
                    }));
                });
            });
        } catch (error) {
            this.setState({
                isLoaded: true
            })
        }
    }

    componentWillUnmount() {
        appBarStateManager.setContextAction("Default")
    }
}
