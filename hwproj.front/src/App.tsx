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
import {Alert} from "@mui/material";
import {Snackbar} from "@material-ui/core";

// TODO: add flux

interface AppState {
    loggedIn: boolean;
    isLecturer: boolean;
    isExpert: boolean;
    newNotificationsCount: number;
    appBarContextAction: AppBarContextAction;
    authReady: boolean;
    snackbarOpen: boolean;
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
            loggedIn: ApiSingleton.authService.loggedIn(),
            isLecturer: ApiSingleton.authService.isLecturer(),
            isExpert: ApiSingleton.authService.isExpert(),
            newNotificationsCount: 0,
            appBarContextAction: "Default",
            authReady: false,
            snackbarOpen: localStorage.getItem("cookies") !== "true",
        };
        appBarStateManager.setOnContextActionChange(appBarState => this.setState({appBarContextAction: appBarState}))
    }

    componentDidMount = async () => {
        const user = await ApiSingleton.authService.getProfile();
        this.setState(
            {
                loggedIn: !!user,
                isLecturer: ApiSingleton.authService.isLecturer(),
                isExpert: ApiSingleton.authService.isExpert(),
                authReady: true,
            }
        );

        await this.updatedNewNotificationsCount()
    }

    updatedNewNotificationsCount = async () => {
        if (ApiSingleton.authService.loggedIn()) {
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

    logout = async () => {
        await ApiSingleton.authService.logout();
        this.setState({loggedIn: false, isLecturer: false, isExpert: false, newNotificationsCount: 0, authReady: true});
        this.props.navigate("/login");
    }

    closeSnackbar = () => {
        localStorage.setItem("cookies", "true");
        this.setState({
            snackbarOpen: false,
        });
    }

    render() {
        if (!this.state.authReady) {return null;}
        return (
            <>
                <Header loggedIn={this.state.loggedIn}
                        newNotificationsCount={this.state.newNotificationsCount}
                        isLecturer={this.state.isLecturer}
                        isExpert={this.state.isExpert}
                        onLogout={this.logout}
                        contextAction={this.state.appBarContextAction}/>
                <TrackPageChanges/>
                <Snackbar
                    anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                    open={this.state.snackbarOpen}
                >
                    <Alert
                        severity="info"
                        onClose={this.closeSnackbar}
                    >
                        Мы используем куки для авторизации
                    </Alert>
                </Snackbar>
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
                        <Route path="courses/:courseId/editInfo" element={<EditCourse/>}/>
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
