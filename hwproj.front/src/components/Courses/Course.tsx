import * as React from "react";
import {Link as RouterLink} from "react-router-dom";
import {RouteComponentProps} from 'react-router';
import {AccountDataDto, CourseViewModel, HomeworkViewModel} from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import CourseStudents from "./CourseStudents";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Grid, ListItem, Typography, Link} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Lecturers from "./Lecturers";

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
    mentors: AccountDataDto[];
    acceptedStudents: ICourseMate[];
    newStudents: ICourseMate[];
}

interface ICourseProps {
    id: string;
}

const styles = makeStyles(theme => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

const Course: React.FC<RouteComponentProps<ICourseProps>> = (props) => {
    const courseId = props.match.params.id
    const classes = styles()

    const [courseState, setCourseState] = useState<ICourseState>({
        isFound: false,
        course: {},
        courseHomework: [],
        createHomework: false,
        mentors: [],
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
            mentors: await Promise.all(course.mentorIds!.split('/').map(mentor => ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(mentor))),
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

    const {isFound, course, createHomework, mentors, newStudents, acceptedStudents} = courseState;
    if (isFound) {
        const isLogged = ApiSingleton.authService.isLoggedIn()

        const userId = isLogged
            ? ApiSingleton.authService.getUserId()
            : undefined

        const isMentor = isLogged && course.mentorIds!.includes(userId!)

        const isSignedInCourse =
            isLogged && newStudents!.some((cm: any) => cm.id === userId)

        const isAcceptedStudent = isLogged && acceptedStudents!.some(
            (cm: any) => cm.id === userId
        )
        return (
            <Grid style={{ marginBottom: '50px' }}>
                <Grid container justify="center" style={{marginTop: "15px"}}>
                    <Grid container xs={11} className={classes.info}>
                        <Grid item>
                            <Typography style={{ fontSize: '22px'}}>
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
                        </Grid>
                        <Grid item style={{ width: '187px'}}>
                            <Grid container alignItems="flex-end" direction="column" xs={12}>
                                <Grid item>
                                    <Lecturers
                                        update={() => {}}
                                        mentors={mentors}
                                        courseId={courseId}
                                        isEditCourse={false}
                                    />
                                </Grid>
                                {isLogged && !isSignedInCourse && !isMentor && !isAcceptedStudent && (
                                    <Grid item style={{ width: '100%', marginTop: '16px'}}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={() => joinCourse()}
                                        >
                                            Записаться
                                        </Button>
                                    </Grid>
                                )}
                                {isLogged && isSignedInCourse && !isAcceptedStudent &&
                                <Grid item style={{ width: '100%', marginTop: '16px'}}>
                                    <Typography style={{ fontSize: '15px' }}>
                                        Ваша заявка рассматривается
                                    </Typography>
                                </Grid>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                {createHomework && (
                    <div>
                        <Grid container justifyContent="center" style={{marginTop: "15px", marginBottom: "15px"}}>
                            <Grid item xs={11}>
                                <CourseStudents
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
                            <Grid item xs={11} style={{marginTop: "15px"}}>
                                <AddHomework
                                    id={+courseId}
                                    onCancel={() => setCurrentState()}
                                    onSubmit={() => setCurrentState()}
                                />
                            </Grid>
                            <Grid item xs={11} style={{marginTop: "15px"}}>
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
                        <Grid container justifyContent="center" style={{marginTop: "15px", marginBottom: "15px"}}>
                            <Grid item xs={11}>
                                <CourseStudents
                                    homeworks={courseState.courseHomework}
                                    userId={userId as string}
                                    isMentor={isMentor}
                                    course={courseState.course}
                                />
                            </Grid>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Grid item xs={11}>
                                <NewCourseStudents
                                    onUpdate={() => setCurrentState()}
                                    course={courseState.course}
                                    students={courseState.newStudents}
                                    courseId={courseId}
                                />
                            </Grid>
                            <Grid item xs={11} style={{marginTop: "15px"}}>
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
                                    Добавить задание
                                </Button>
                            </Grid>
                            <Grid item xs={11} style={{marginTop: "15px"}}>
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
                    <Grid container justifyContent="center" style={{marginTop: "15px", marginBottom: "15px"}}>
                        <Grid item xs={11}>
                            <CourseStudents
                                homeworks={courseState.courseHomework}
                                userId={userId as string}
                                isMentor={isMentor}
                                course={courseState.course}
                            />
                        </Grid>
                    </Grid>
                )}
                {!isMentor && (
                    <Grid container justifyContent="center" style={{marginTop: "15px", marginBottom: "15px"}}>
                        <Grid xs={11}>
                            <CourseHomework
                                onDelete={() => setCurrentState()}
                                homework={courseState.courseHomework}
                                isStudent={isAcceptedStudent}
                                isMentor={isMentor}
                            />
                        </Grid>
                    </Grid>
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