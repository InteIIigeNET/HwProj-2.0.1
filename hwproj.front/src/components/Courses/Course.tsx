import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import {RouteComponentProps} from 'react-router';
import { AccountDataDto, CourseViewModel, HomeworkViewModel } from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import CourseStudents from "./CourseStudents";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import { Button, Typography } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";

interface ICourseMate {
    name: string;
    surname: string;
    middleName: string;
    email: string;
    id: string;
}

interface ICourseState {
    isLoaded: boolean;
    isFound: boolean;
    course: CourseViewModel;
    courseHomework: HomeworkViewModel[];
    createHomework: boolean;
    mentor: AccountDataDto;
    acceptedStudents: ICourseMate[];
    newStudents: ICourseMate[];
}

interface ICourseProps {
    id: string;
}

export default class Course extends React.Component<RouteComponentProps<ICourseProps>, ICourseState> {
    constructor(props: RouteComponentProps<ICourseProps>) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            course: {
                mentorId: "",
            },
            courseHomework: [],
            createHomework: false,
            mentor: {
                name: "",
                surname: "",
                middleName: "",
                email: "",
                role: "",
            },
            acceptedStudents: [],
            newStudents: [],
        };
    }

    public render() {
        const { isLoaded, isFound, course, createHomework, mentor } = this.state;
        if (isLoaded) {
        if (isFound) {
            let isLogged = ApiSingleton.authService.isLoggedIn()
            let userId = isLogged
            ? ApiSingleton.authService.getUserId()
            : undefined;
            let isMentor = isLogged && userId === String(course.mentorId);
            let isSignedInCourse =
            isLogged && this.state.newStudents!.some((cm: any) => cm.id === userId);
            let isAcceptedStudent = isLogged && this.state.acceptedStudents!.some(
                (cm: any) => cm.id === userId
            );
            return (
            <div className="container">
                <div className="d-flex justify-content-between">
                <div>
                    <Typography variant="h5">
                    {course.name} &nbsp;
                    {isMentor && (
                        <RouterLink to={"./" + this.props.match.params.id + "/edit"}>
                        <EditIcon fontSize="small"/>
                        </RouterLink>
                    )}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                    {course.groupName}
                    </Typography>
                </div>
                <div>
                    <Typography variant="h5">
                    {mentor.name}&nbsp;{mentor.surname}
                    </Typography>
                    {(isMentor || isAcceptedStudent) && (
                    <Typography variant="subtitle1">{mentor.email}</Typography>
                    )}
                    {isLogged && !isSignedInCourse && !isMentor && !isAcceptedStudent &&(
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => this.joinCourse()}
                    >
                        Записаться
                    </Button>
                    )}
                    {isLogged &&
                    isSignedInCourse &&
                    !isAcceptedStudent &&
                    "Ваша заявка рассматривается."}
                </div>
                </div>
                {createHomework && (
                <div>
                    <CourseStudents
                      courseMates={this.state.acceptedStudents}
                      homeworks={this.state.courseHomework}
                      userId={userId as string}
                      isMentor={isMentor}
                      course={this.state.course}
                    />
                    <br />
                    <NewCourseStudents
                      onUpdate={() => this.componentDidMount()}
                      course={this.state.course}
                      students={this.state.newStudents}
                      courseId={this.props.match.params.id}
                    />
                    <br />
                    <AddHomework
                      id={+this.props.match.params.id}
                      onCancel={() => this.componentDidMount()}
                      onSubmit={() => this.componentDidMount()}
                    />
                    <CourseHomework
                      onDelete={() => this.componentDidMount()}
                      isStudent={isAcceptedStudent}
                      isMentor={isMentor}
                      homework={this.state.courseHomework}
                    />
                </div>
                )}
                {isMentor && !createHomework && (
                <div>
                    <CourseStudents
                      courseMates={this.state.acceptedStudents}
                      homeworks={this.state.courseHomework}
                      userId={userId as string}
                      isMentor={isMentor}
                      course={this.state.course}
                    />
                    <br />
                    <NewCourseStudents
                      onUpdate={() => this.componentDidMount()}
                      course={this.state.course}
                      students={this.state.newStudents}
                      courseId={this.props.match.params.id}
                    />
                    <br />
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                          this.setState({ createHomework: true });
                      }}
                    >
                    Добавить домашку
                    </Button>
                    <CourseHomework
                      onDelete={() => this.componentDidMount()}
                      isStudent={isAcceptedStudent}
                      isMentor={isMentor}
                      homework={this.state.courseHomework}
                    />
                </div>
                )}
                {isAcceptedStudent && (
                <CourseStudents
                  courseMates={this.state.acceptedStudents}
                  homeworks={this.state.courseHomework}
                  userId={userId as string}
                  isMentor={isMentor}
                  course={this.state.course}
                />
                )}
                {!isMentor && (
                <div>
                    <CourseHomework
                      onDelete={() => this.componentDidMount()}
                      homework={this.state.courseHomework}
                      isStudent={isAcceptedStudent}
                      isMentor={isMentor}
                    />
                </div>
                )}
            </div>
            );
        }
        return <Typography variant="h3">Не удалось найти курс.</Typography>;
        }
        return <h1> </h1>;
    }

    joinCourse() {
        const token = ApiSingleton.authService.getToken();
        ApiSingleton.coursesApi
            .apiCoursesSignInCourseByCourseIdPost(+this.props.match.params.id, { headers: {"Authorization": `Bearer ${token}`} })
            .then((res) => this.componentDidMount());
    }

    async componentDidMount() {
        const token = ApiSingleton.authService.getToken();
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+this.props.match.params.id, { headers: {"Authorization": `Bearer ${token}`}});
        this.setState({
          isLoaded: true,
          isFound: true,
          course: course,
          courseHomework: course.homeworks!,
          createHomework: false,
          mentor: await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(course.mentorId!),
          acceptedStudents: await Promise.all(course.courseMates!
            .filter(cm => cm.isAccepted)
            .map(async (cm) => {
                const user = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(cm.studentId!);
                return {
                    name: user.name!,
                    surname: user.surname!,
                    middleName: user.middleName!,
                    email: user.email!,
                    id: cm.studentId!,
                }
            })),
          newStudents: await Promise.all(course.courseMates!
            .filter(cm => !cm.isAccepted)
            .map(async (cm) => {
                const user = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(cm.studentId!);
                return {
                    name: user.name!,
                    surname: user.surname!,
                    middleName: user.middleName!,
                    email: user.email!,
                    id: cm.studentId!,
                }
            })),
        })
      }
}
