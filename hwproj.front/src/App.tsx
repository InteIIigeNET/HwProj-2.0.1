import React, {Component} from "react";
import {Route, Routes, useNavigate} from "react-router-dom";
import "./App.css";
import "./components/Courses/Course";
import Course from "./components/Courses/Course";
import Courses from "./components/Courses/Courses";
import CreateCourse from "./components/Courses/CreateCourse";
import Notifications from "./components/Notifications";
import Workspace from "./components/Workspace";
import TaskSolutionsPage from "./components/Solutions/TaskSolutionsPage";
import {Header} from "./components/AppBar";
import Login from "./components/Auth/Login";
import EditCourse from "./components/Courses/EditCourse";
import EditTask from "./components/Tasks/EditTask";
import EditHomework from "./components/Homeworks/EditHomework";
import Register from "./components/Auth/Register";
import StudentSolutionsPage from "./components/Solutions/StudentSolutionsPage";
import EditProfile from "./components/EditProfile";
import ApiSingleton from "./api/ApiSingleton";
import SystemInfoComponent from "./components/System/SystemInfoComponent";
import WrongPath from "./components/WrongPath";
import ResetPassword from "components/Auth/ResetPassword";
import PasswordRecovery from "components/Auth/PasswordRecovery";
import AuthLayout from "./AuthLayout";

// TODO: add flux

interface AppState {
    loggedIn: boolean;
    isLecturer: boolean;
    newNotificationsCount: number;
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
            newNotificationsCount: 0
        };
    }

    componentDidMount = async () => {
        await this.updatedNewNotificationsCount()
    }

    updatedNewNotificationsCount = async () => {
        if (ApiSingleton.authService.isLoggedIn()) {
            const data = await ApiSingleton.notificationsApi.apiNotificationsGetNewNotificationsCountGet()
            this.setState({newNotificationsCount: data})
        }
    }

    login = () => {
        this.setState({
            loggedIn: true,
            isLecturer: ApiSingleton.authService.isLecturer()
        })
        this.props.navigate("/");
    }

    logout = () => {
        ApiSingleton.authService.logout();
        this.setState({loggedIn: false});
        this.setState({isLecturer: false});
        this.props.navigate("/login");
    }

    render() {
        return (
            <>
                <Header loggedIn={this.state.loggedIn}
                        newNotificationsCount={this.state.newNotificationsCount}
                        isLecturer={this.state.isLecturer}
                        onLogout={this.logout}/>
                <Routes>
                    <Route element={<AuthLayout/>}>
                        <Route path="user/edit" element={<EditProfile/>}/>
                        <Route path="/" element={<Workspace/>}/>
                        <Route path="notifications"
                               element={<Notifications onMarkAsSeen={this.updatedNewNotificationsCount}/>}/>
                        <Route path="courses" element={<Courses navigate={this.props.navigate}/>}/>
                        <Route path="profile/:id" element={<Workspace/>}/>
                        <Route path="create_course" element={<CreateCourse/>}/>
                        <Route path="courses/:courseId" element={<Course/>}/>
                        <Route path="courses/:courseId/:tab" element={<Course/>}/>
                        <Route path="courses/:courseId/edit" element={<EditCourse/>}/>
                        <Route path="homework/:homeworkId/edit" element={<EditHomework/>}/>
                        <Route path="task/:taskId/edit" element={<EditTask/>}/>
                        <Route path="task/:taskId/:studentId" element={<StudentSolutionsPage/>}/>
                        <Route path="task/:taskId/" element={<TaskSolutionsPage/>}/>
                    </Route>
                    <Route path="system" element={<SystemInfoComponent/>}/>
                    <Route path="login" element={<Login onLogin={this.login}/>}/>
                    <Route path="register" element={<Register onLogin={this.login}/>}/>
                    <Route path="recovery" element={<PasswordRecovery/>}/>
                    <Route path="resetPassword" element={<ResetPassword/>}/>
                    <Route path={"*"} element={<WrongPath/>}/>
                </Routes>
            </>
        );
    }
}

export default withRouter(App);
