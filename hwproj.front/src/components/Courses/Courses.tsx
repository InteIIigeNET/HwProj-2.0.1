import * as React from "react";
import {Tab, Tabs} from "@material-ui/core";
import {CoursesList} from "./CoursesList";
import {CoursePreviewView} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";
import {appBarStateManager} from "../AppBar";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

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
        let activeCoursesTab = !isLoaded || activeCourses.length > 0 ? 0 : undefined
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
                    onChange={(event, value) => {
                        this.setState({tabValue: value});
                    }}
                >
                    {!isLoaded || activeCourses.length > 0 && <Tab label="Ваши курсы"/>}
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
            const courses = await ApiSingleton.coursesApi.coursesGetAllUserCourses()
            const allCourses = await ApiSingleton.coursesApi.coursesGetAllCourses();
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

    componentWillUnmount() {
        appBarStateManager.setContextAction("Default")
    }
}
