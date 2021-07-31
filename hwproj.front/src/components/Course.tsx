import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import {RouteComponentProps} from 'react-router';

import { AccountDataDto, CourseViewModel } from "../api/";
import { HomeworkViewModel } from "../api/homeworks";
import CourseHomework from "./CourseHomework";
import AddHomework from "./AddHomework";
import CourseStudents from "./CourseStudents";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../api/ApiSingleton";

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
            let isLogged = ApiSingleton.authService.getLogginStateFake();
            let userId = isLogged
            ? String(ApiSingleton.authService.getUserIdFake())
            : undefined;
            let isMentor = isLogged && userId === String(course.mentorId);
            let isSignedInCourse =
            isLogged && this.state.newStudents!.some((cm: any) => cm.id === userId);
            let isAcceptedStudent =
            isLogged && this.state.acceptedStudents!.some(
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
                    forMentor={isMentor}
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
                    forStudent={isAcceptedStudent}
                    forMentor={isMentor}
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
                    forMentor={isMentor}
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
                    forStudent={isAcceptedStudent}
                    forMentor={isMentor}
                    homework={this.state.courseHomework}
                    />
                </div>
                )}
                {isAcceptedStudent && (
                <CourseStudents
                    courseMates={this.state.acceptedStudents}
                    homeworks={this.state.courseHomework}
                    userId={userId as string}
                    forMentor={isMentor}
                    course={this.state.course}
                />
                )}
                {!isMentor && (
                <div>
                    <CourseHomework
                    onDelete={() => this.componentDidMount()}
                    homework={this.state.courseHomework}
                    forStudent={isAcceptedStudent}
                    forMentor={isMentor}
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
        ApiSingleton.coursesApi
            .apiCoursesSignInCourseByCourseIdPost(+this.props.match.params.id, 55)
            .then((res) => this.componentDidMount());
    }

    // async componentDidMount() {
    //     await ApiSingleton.coursesApi
    //     .apiCoursesByCourseIdGet(+this.props.match.params.id)
    //     .then((course: CourseViewModel) =>
    //         ApiSingleton.homeworksApi
    //         .apiHomeworksCourseHomeworksByCourseIdGet(course.id!)
    //         .then((homework) =>
    //             ApiSingleton.accountApi
    //             .apiAccountGetUserDataByUserIdGet(course.mentorId!)
    //             .then(
    //                 async (mentor) =>
    //                 await Promise.all(
    //                     course.courseMates!.map(async (cm) => {
    //                         const res = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(cm.studentId!);
    //                         return { user: {name: res.name!, surname: res.surname!, middleName: res.middleName!, email: res.email!, id: cm.studentId!}, isAccepted: cm.isAccepted };
    //                     })
    //                 ).then((courseMates) =>
    //                     this.setState({
    //                         isLoaded: true,
    //                         isFound: true,
    //                         course: course,
    //                         courseHomework: homework,
    //                         createHomework: false,
    //                         mentor: mentor,
    //                         acceptedStudents: courseMates.filter((cm) => cm.isAccepted).map(cm => cm.user),
    //                         newStudents: courseMates.filter((cm) => !cm.isAccepted).map(cm => cm.user),
    //                     })
    //                 )
    //             )
    //         )
    //     )
    //     .catch((err) => this.setState({ isLoaded: true, isFound: false }));
    // }

    async componentDidMount() {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+this.props.match.params.id);

        this.setState({
          isLoaded: true,
          isFound: true,
          course: course,
          courseHomework: await ApiSingleton.courseService.getHomeworksByCourseId(+this.props.match.params.id),
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

//export default withRouter(Course);