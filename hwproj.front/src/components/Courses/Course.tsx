import * as React from "react";
import {Link as RouterLink} from "react-router-dom";
import {RouteComponentProps} from 'react-router';
import {AccountDataDto, CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import CourseStudents from "./CourseStudents";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Grid, Tab, Tabs, Typography, IconButton, Switch} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {Chip, FormControlLabel, Stack} from "@mui/material";
import CourseExperimental from "./CourseExperimental";

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
    studentSolutions: StatisticsCourseMatesModel[];
    showExperimentalFeature: boolean
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
        showExperimentalFeature: false,
        isFound: false,
        course: {},
        courseHomework: [],
        createHomework: false,
        mentors: [],
        acceptedStudents: [],
        newStudents: [],
        isReadingMode: true,
        tabValue: 0,
        studentSolutions: []
    })
    const setCurrentState = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId)
        const solutions = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdGet(+courseId)

        setCourseState(prevState => ({
            ...prevState,
            isFound: true,
            course: course,
            courseHomework: course.homeworks!,
            createHomework: false,
            mentors: course.mentors!,
            acceptedStudents: course.acceptedStudents!,
            newStudents: course.newStudents!,
            studentSolutions: solutions
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
        isReadingMode,
        studentSolutions
    } = courseState;

    const unratedSolutionsCount = studentSolutions
        .flatMap(x => x.homeworks)
        .flatMap(x => x!.tasks)
        .filter(t => t!.solution!.slice(-1)[0]?.state === 0) //last solution
        .length

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

        const showExperimentalFeature = isMentor ? courseState.showExperimentalFeature : true

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
                                {isMentor && <div><Switch value={showExperimentalFeature}
                                                          onChange={(e, checked) => setCourseState(prevState => ({
                                                              ...prevState,
                                                              showExperimentalFeature: checked
                                                          }))}/> Включить экспериментальный режим отображения
                                </div>}
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
                        {(isMentor || isAcceptedStudent) && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Решения</div>
                                <Chip size={"small"} color={"default"}
                                      label={unratedSolutionsCount}/>
                            </Stack>
                        }/>}
                        {isMentor && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Заявки</div>
                                <Chip size={"small"} color={"default"}
                                      label={newStudents.length}/>
                            </Stack>}/>}
                    </Tabs>
                    <br/>
                    {tabValue === 0 && <div>
                        {
                            showExperimentalFeature ?
                                <CourseExperimental homeworks={courseState.courseHomework} isMentor={isMentor}
                                                    studentSolutions={[]} isStudentAccepted={isAcceptedStudent}/> :
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
                                </div>
                        }
                    </div>}
                    {tabValue === 1 &&
                        <Grid container style={{marginBottom: "15px"}}>
                            <Grid item xs={11}>
                                <CourseStudents
                                    homeworks={courseState.courseHomework}
                                    userId={userId as string}
                                    isMentor={isMentor}
                                    course={courseState.course}
                                    solutions={studentSolutions}
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
