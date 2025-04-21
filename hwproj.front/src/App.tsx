import React, {Component} from "react";
import {Route, Routes, useNavigate} from "react-router-dom";
import "./App.css";
import "./components/Courses/Course";
import Course from "./components/Courses/Course";
import Courses from "./components/Courses/Courses";
import StudentStatsChart from "./components/Courses/Statistics/StudentStatsChart";
import {CreateCourse} from "./components/Courses/CreateCourse";
import Notifications from "./components/Notifications";
import Workspace from "./components/Workspace";
import TaskSolutionsPage from "./components/Solutions/TaskSolutionsPage";
import {AppBarContextAction, appBarStateManager, Header} from "./components/AppBar";
import Login from "./components/Auth/Login";
import EditCourse from "./components/Courses/EditCourse";
import EditTask from "./components/Tasks/EditTask";
import EditHomework from "./components/Homeworks/EditHomework";
import Register from "./components/Auth/Register";
import ExpertsNotebook from "./components/Experts/Notebook";
import StudentSolutionsPage from "./components/Solutions/StudentSolutionsPage";
import EditProfile from "./components/EditProfile";
import ApiSingleton from "./api/ApiSingleton";
import SystemInfoComponent from "./components/System/SystemInfoComponent";
import WrongPath from "./components/WrongPath";
import ResetPassword from "components/Auth/ResetPassword";
import PasswordRecovery from "components/Auth/PasswordRecovery";
import AuthLayout from "./AuthLayout";
import ExpertAuthLayout from "./components/Experts/AuthLayout";
import TrackPageChanges from "TrackPageChanges";

// TODO: add flux

interface AppState {
    loggedIn: boolean;
    isLecturer: boolean;
    isExpert: boolean;
    newNotificationsCount: number;
    appBarContextAction: AppBarContextAction
}

const withRouter = (Component: any) => {
    return (props: any) => {
        const navigate = useNavigate();

        return (
            <Component
                navigate={navigate}
                {...props}
            />
        );
    };
};

class App extends Component<{ navigate: any }, AppState> {
    constructor(props: { navigate: any }) {
        super(props);
        this.state = {
            loggedIn: ApiSingleton.authService.isLoggedIn(),
            isLecturer: ApiSingleton.authService.isLecturer(),
            isExpert: ApiSingleton.authService.isExpert(),
            newNotificationsCount: 0,
            appBarContextAction: "Default"
        };
        appBarStateManager.setOnContextActionChange(appBarState => this.setState({appBarContextAction: appBarState}))
    }

    componentDidMount = async () => {
        await this.updatedNewNotificationsCount()
    }

    updatedNewNotificationsCount = async () => {
        if (ApiSingleton.authService.isLoggedIn()) {
            const data = await ApiSingleton.notificationsApi.notificationsGetNewNotificationsCount()
            this.setState({newNotificationsCount: data})
        }
    }

    login = async (returnUrl: string | null) => {
        const isLecturer = ApiSingleton.authService.isLecturer();
        const isExpert = ApiSingleton.authService.isExpert();
        this.setState({
            loggedIn: true,
            isLecturer: isLecturer,
            isExpert: isExpert
        })
        if (!isExpert) {
            await this.updatedNewNotificationsCount()
            this.props.navigate(returnUrl || "/");
        }
    }

    logout = () => {
        ApiSingleton.authService.logout();
        this.setState({loggedIn: false, isLecturer: false, isExpert: false, newNotificationsCount: 0});
        this.props.navigate("/login");
    }

    render() {
        return (
            <>
                <Header loggedIn={this.state.loggedIn}
                        newNotificationsCount={this.state.newNotificationsCount}
                        isLecturer={this.state.isLecturer}
                        isExpert={this.state.isExpert}
                        onLogout={this.logout}
                        contextAction={this.state.appBarContextAction}/>
                <TrackPageChanges/>
                <Routes>
                    <Route element={<AuthLayout/>}>
                        <Route path="user/edit" element={<EditProfile isExpert={this.state.isExpert}/>}/>
                        <Route path="/" element={<Workspace/>}/>
                        <Route path="notifications"
                               element={<Notifications onMarkAsSeen={this.updatedNewNotificationsCount}/>}/>
                        <Route path="courses"
                               element={<Courses navigate={this.props.navigate} isLecturer={this.state.isLecturer}
                                                 isExpert={this.state.isExpert}/>}/>
                        <Route path="profile/:id" element={<Workspace/>}/>
                        <Route path="experts" element={<ExpertsNotebook/>}/>
                        <Route path="create_course" element={<CreateCourse/>}/>
                        <Route path="courses/:courseId" element={<Course/>}/>
                        <Route path="courses/:courseId/:tab" element={<Course/>}/>
                        <Route path="courses/:courseId/editHomeworks" element={<Course isReadingMode={false}/>}/>
                        <Route path="courses/:courseId/editInfo" element={<EditCourse/>}/>
                        <Route path="homework/:homeworkId/edit" element={<EditHomework/>}/>
                        <Route path="task/:taskId/edit" element={<EditTask/>}/>
                        <Route path="task/:taskId/:studentId" element={<StudentSolutionsPage/>}/>
                        <Route path="task/:taskId/" element={<TaskSolutionsPage/>}/>
                    </Route>
                    <Route path="statistics/:courseId/charts" element={<StudentStatsChart/>}/>
                    <Route path="status" element={<SystemInfoComponent/>}/>
                    <Route path="login" element={<Login onLogin={this.login}/>}/>
                    <Route path="register" element={<Register/>}/>
                    <Route path="recovery" element={<PasswordRecovery/>}/>
                    <Route path="resetPassword" element={<ResetPassword/>}/>
                    <Route path="join/:token" element={<ExpertAuthLayout onLogin={this.login}/>}/>
                    <Route path={"*"} element={<WrongPath/>}/>
                </Routes>
                <div style={{marginBottom: 10}}/>
            </>
        );
    }
}

export default withRouter(App);
