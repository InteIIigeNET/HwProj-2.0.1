import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import {RouteComponentProps} from 'react-router';
import { AccountDataDto, CourseViewModel, HomeworkViewModel } from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import CourseStudents from "./CourseStudents";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import { Button, Container, Grid, Paper, Typography } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";

interface ICourseMate {
    name: string;
    surname: string;
    middleName: string;
    email: string;
    id: string;
}

interface ICourseState {
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

const styles = makeStyles( theme => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "nowrap",
    },
    item: {
    }
  }));

const Course: React.FC<RouteComponentProps<ICourseProps>> = (props) => {

    const courseId = props.match.params.id
    const classes = styles()

    const [ courseState, setCourseState ] = useState<ICourseState>({
        isFound: false,
        course: {},
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
    })

    const setCurrentState = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId)
        setCourseState({
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

    useEffect(() => {
        setCurrentState()
    }, [])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi
            .apiCoursesSignInCourseByCourseIdPost(+courseId)
            .then((res) => setCurrentState());
    }

    const { isFound, course, createHomework, mentor, newStudents, acceptedStudents } = courseState;
    if (isFound) {
        const isLogged = ApiSingleton.authService.isLoggedIn()
        const userId = isLogged
            ? ApiSingleton.authService.getUserId()
            : undefined;
        const isMentor = isLogged && userId === String(course.mentorId);
        const isSignedInCourse =
            isLogged && newStudents!.some((cm: any) => cm.id === userId);
        const isAcceptedStudent = isLogged && acceptedStudents!.some(
            (cm: any) => cm.id === userId
        );
        return (
            <Grid>
                <Grid container justify="center" style={{ marginTop: "15px" }}>
                    <Grid item xs={11} className={classes.info}>
                        <div>
                            <Typography variant="h5">
                                {course.name} &nbsp;
                                {isMentor && (
                                    <RouterLink to={"./" + courseId! + "/edit"}>
                                        <EditIcon fontSize="small"/>
                                    </RouterLink>
                                )}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Группа: {course.groupName}
                            </Typography>
                        </div>              
                        <div>
                            <Typography variant="h5">
                                {mentor.name}&nbsp;{mentor.surname}
                            </Typography>
                            {(isMentor || isAcceptedStudent) && (
                            <Typography variant="subtitle1">
                                {mentor.email}
                            </Typography>
                            )}
                            {isLogged && !isSignedInCourse && !isMentor && !isAcceptedStudent &&(
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => joinCourse()}
                            >
                                Записаться
                            </Button>
                            )}
                            {isLogged && isSignedInCourse && !isAcceptedStudent &&
                            <Typography>
                                Ваша заявка рассматривается
                            </Typography>}
                        </div>
                    </Grid>
                </Grid>
                {createHomework && (
                <div>
                    <Grid container justifyContent="center" style={{ marginTop: "15px", marginBottom: "15px" }}>
                        <Grid item xs={11}>
                            <CourseStudents
                                courseMates={courseState.acceptedStudents}
                                homeworks={courseState.courseHomework}
                                userId={userId as string}
                                isMentor={isMentor}
                                course={courseState.course}
                            />
                        </Grid>
                        <Grid item xs={11}>
                            <NewCourseStudents
                                onUpdate={() => setCurrentState()}
                                course={course}
                                students={newStudents}
                                courseId={courseId}
                            />
                        </Grid>
                        <Grid item xs={11} style={{ marginTop: "15px" }}>
                            <AddHomework
                                id={+courseId}
                                onCancel={() => setCurrentState()}
                                onSubmit={() => setCurrentState()}
                            />
                        </Grid>
                        <Grid item xs={11} style={{ marginTop: "15px" }}>
                            <CourseHomework
                                onDelete={() => setCurrentState()}
                                isStudent={isAcceptedStudent}
                                isMentor={isMentor}
                                homework={courseState.courseHomework}
                            />
                        </Grid>
                    </Grid>
                </div>
                )}
                {isMentor && !createHomework && (
                <div>
                    <Grid container justifyContent="center" style={{ marginTop: "15px", marginBottom: "15px" }}>
                        <Grid item xs={11}>
                            <CourseStudents
                                courseMates={courseState.acceptedStudents}
                                homeworks={courseState.courseHomework}
                                userId={userId as string}
                                isMentor={isMentor}
                                course={courseState.course}
                            />
                        </Grid>
                    </Grid>
                    <Grid container className={classes.item} justifyContent="center">
                        <Grid item xs={11}>
                            <NewCourseStudents
                                onUpdate={() => setCurrentState()}
                                course={courseState.course}
                                students={courseState.newStudents}
                                courseId={courseId}
                            />
                        </Grid>
                        <Grid item xs={11} style={{ marginTop: "15px" }}>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setCourseState(prevState => ({
                                        ...prevState,
                                        createHomework: true 
                                    }));
                                }}
                            >
                                Добавить домашку
                            </Button>
                        </Grid>
                        <Grid item xs={11} style={{ marginTop: "15px" }}>
                            <CourseHomework
                                onDelete={() => setCurrentState()}
                                isStudent={isAcceptedStudent}
                                isMentor={isMentor}
                                homework={courseState.courseHomework}
                            />
                        </Grid>
                    </Grid>
                </div>
                )}
                {isAcceptedStudent && (
                    <Grid container justifyContent="center" style={{ marginTop: "15px", marginBottom: "15px" }}>
                        <Grid item xs={11}>
                            <CourseStudents
                                courseMates={courseState.acceptedStudents}
                                homeworks={courseState.courseHomework}
                                userId={userId as string}
                                isMentor={isMentor}
                                course={courseState.course}
                            />
                        </Grid>
                    </Grid>
                )}
                {!isMentor && (
                <div>
                    <CourseHomework
                        onDelete={() => setCurrentState()}
                        homework={courseState.courseHomework}
                        isStudent={isAcceptedStudent}
                        isMentor={isMentor}
                    />
                </div>
                )}
            </Grid>
        );
    }
    return (
        <Typography>
        </Typography>
    )
}

export default Course