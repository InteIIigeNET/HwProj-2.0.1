import * as React from "react";
import {Link as RouterLink} from "react-router-dom";
import {RouteComponentProps} from 'react-router';
import {AccountDataDto, CourseViewModel, HomeworkViewModel} from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import CourseStudents from "./CourseStudents";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Grid, Tab, Tabs, Typography, IconButton} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {Chip, Stack} from "@mui/material";

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
    acceptedStudents: AccountDataDto[];
    newStudents: AccountDataDto[];
    isReadingMode: boolean;
    tabValue: number;
}

interface ICourseProps {
    id: string;
}

const styles = makeStyles(() => ({
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
        isReadingMode: true,
        tabValue: 0
    })
    const setCurrentState = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId)

        setCourseState(prevState => ({
            isFound: true,
            course: course,
            courseHomework: course.homeworks!,
            createHomework: false,
            mentors: course.mentors!,
            acceptedStudents: course.acceptedStudents!,
            newStudents: course.newStudents!,
            isReadingMode: prevState.isReadingMode,
            tabValue: prevState.tabValue
        }))
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi
            .apiCoursesSignInCourseByCourseIdPost(+courseId)
            .then(() => setCurrentState());
    }

    const {
        isFound,
        course,
        tabValue,
        createHomework,
        mentors,
        newStudents,
        acceptedStudents,
        isReadingMode
    } = courseState;
    if (isFound) {
        const isLogged = ApiSingleton.authService.isLoggedIn()

        //TODO: move to authservice
        const userId = isLogged
            ? ApiSingleton.authService.getUserId()
            : undefined

        const isMentor = isLogged && mentors.some(t => t.userId === userId)

        const isSignedInCourse =
            isLogged && newStudents!.some(cm => cm.userId === userId)

        const isAcceptedStudent =
            isLogged && acceptedStudents!.some(cm => cm.userId === userId)

        return (
            <div className="container">
                <Grid style={{marginBottom: '50px'}}>
                    <Grid container style={{marginTop: "15px"}}>
                        <Grid container xs={11} className={classes.info}>
                            <Grid item>
                                <Typography style={{fontSize: '22px'}}>
                                    {`${course.name} / ${course.groupName}`} &nbsp;
                                    {isMentor &&
                                        <IconButton style={{marginLeft: -5}} onClick={() =>
                                            setCourseState(prevState => ({
                                                ...prevState,
                                                isReadingMode: !isReadingMode
                                            }))}>
                                            {isReadingMode
                                                ? <VisibilityIcon
                                                    titleAccess="Режим чтения включен"
                                                    fontSize={"small"}/>
                                                : <VisibilityOffIcon
                                                    titleAccess="Режим чтения выключен"
                                                    fontSize={"small"}
                                                />}
                                        </IconButton>
                                    }
                                    {isMentor && !isReadingMode! && (
                                        <RouterLink to={"./" + courseId! + "/edit"}>
                                            <EditIcon fontSize="small"/>
                                        </RouterLink>
                                    )}
                                </Typography>
                                <Typography style={{fontSize: "18px", color: "GrayText"}}>
                                    {mentors.map(t => `${t.name} ${t.surname}`).join(", ")}
                                </Typography>
                            </Grid>
                            <Grid item style={{width: '187px'}}>
                                <Grid container alignItems="flex-end" direction="column" xs={12}>
                                    {isLogged && !isSignedInCourse && !isMentor && !isAcceptedStudent && (
                                        <Grid item style={{width: '100%', marginTop: '16px'}}>
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
                                        <Grid item style={{width: '100%', marginTop: '16px'}}>
                                            <Typography style={{fontSize: '15px'}}>
                                                Ваша заявка рассматривается
                                            </Typography>
                                        </Grid>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Tabs
                        value={tabValue}
                        style={{marginTop: 15}}
                        indicatorColor="primary"
                        onChange={(event, value) => {
                            setCourseState(prevState => ({
                                ...prevState,
                                tabValue: value
                            }));
                        }}
                    >
                        <Tab label="Домашние задания"/>
                        {(isMentor || isAcceptedStudent) && <Tab label="Решения"/>}
                        {isMentor && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Заявки</div>
                                <Chip size={"small"} color={"default"}
                                      label={newStudents.length}/>
                            </Stack>}/>}
                    </Tabs>
                    <br/>
                    {tabValue === 0 &&
                        <div>
                            {createHomework && (
                                <div>
                                    <Grid container>
                                        <Grid item xs={11}>
                                            <AddHomework
                                                id={+courseId}
                                                onCancel={() => setCurrentState()}
                                                onSubmit={() => setCurrentState()}
                                            />
                                        </Grid>
                                        <Grid item xs={11}>
                                            <CourseHomework
                                                onDelete={() => setCurrentState()}
                                                isStudent={isAcceptedStudent}
                                                isMentor={isMentor}
                                                isReadingMode={isReadingMode}
                                                homework={courseState.courseHomework}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>
                            )}
                            {isMentor && !createHomework && (
                                <div>
                                    <Grid container>
                                        {!isReadingMode! &&
                                            <Grid item xs={11} style={{marginBottom: 15}}>
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
                                        }
                                        <Grid item xs={11}>
                                            <CourseHomework
                                                onDelete={() => setCurrentState()}
                                                isStudent={isAcceptedStudent}
                                                isMentor={isMentor}
                                                isReadingMode={isReadingMode}
                                                homework={courseState.courseHomework}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>
                            )}
                            {!isMentor && (
                                <Grid container>
                                    <Grid xs={11}>
                                        <CourseHomework
                                            onDelete={() => setCurrentState()}
                                            homework={courseState.courseHomework}
                                            isStudent={isAcceptedStudent}
                                            isMentor={isMentor}
                                            isReadingMode={isReadingMode}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </div>}
                    {tabValue === 1 &&
                        <Grid container style={{marginBottom: "15px"}}>
                            <Grid item xs={11}>
                                <CourseStudents
                                    homeworks={courseState.courseHomework}
                                    userId={userId as string}
                                    isMentor={isMentor}
                                    course={courseState.course}
                                />
                            </Grid>
                        </Grid>}
                    {tabValue === 2 && isMentor &&
                        <Grid item xs={11}>
                            <NewCourseStudents
                                onUpdate={() => setCurrentState()}
                                course={courseState.course}
                                students={courseState.newStudents}
                                courseId={courseId}
                            />
                        </Grid>
                    }
                </Grid>
            </div>
        );
    }
    return (
        <Typography>
        </Typography>
    )
}

export default Course
