import * as React from "react";
import {Link as RouterLink, useSearchParams} from "react-router-dom";
import {AccountDataDto, CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import StudentStats from "./StudentStats";
import {Solution} from "../../api";
import StudentStatsTable from "./StudentStatsTable";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Grid, Tab, Tabs, Typography, IconButton, Switch, CircularProgress} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {Alert, AlertTitle, Chip, Stack} from "@mui/material";
import CourseExperimental from "./CourseExperimental";
import {useParams, useNavigate} from 'react-router-dom';
import MentorsList from "../Common/MentorsList";
import LecturerStatistics from "./Statistics/LecturerStatistics";
import AssessmentIcon from '@mui/icons-material/Assessment';

type TabValue = "homeworks" | "stats" | "applications"

function isAcceptableTabValue(str: string): str is TabValue {
    return str === "homeworks" || str === "stats" || str === "applications";
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
    studentSolutions: StatisticsCourseMatesModel[];
    isStudentViewMode: boolean;
}

interface IPageState {
    tabValue: TabValue
}

const styles = makeStyles(() => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

const tasks1 : HomeworkTaskViewModel[] = [
    {id: 1, title: "Тестовая задача", maxRating: 10, deadlineDate: new Date(2024, 2, 14), publicationDate: new Date(2024, 2, 7)},
    {id: 2, title: "Сортировка пузырьком", maxRating: 10, deadlineDate: new Date(2024, 2, 14), publicationDate: new Date(2024, 2, 7)},
    {id: 3, title: "Сложная задача", maxRating: 20, deadlineDate: new Date(2024, 2, 21), publicationDate: new Date(2024, 2, 7)},
]
const tasks2 : HomeworkTaskViewModel[] = [
    {id: 4, title: "Сделай что-нибудь", maxRating: 10, deadlineDate: new Date(2024, 2, 28), publicationDate: new Date(2024, 2, 21)},
    {id: 5, title: "Учимся писать комментарии", maxRating: 10, deadlineDate: new Date(2024, 2, 28), publicationDate: new Date(2024, 2, 21)},
    {id: 6, title: "Наибольшая возрастающая последовательность", maxRating: 10, deadlineDate: new Date(2024, 2, 28), publicationDate: new Date(2024, 2, 21)},
]
const tasks3 : HomeworkTaskViewModel[] = [
    {id: 7, title: "Алгоритм Дейкстры", maxRating: 5, deadlineDate: new Date(2024, 3, 15), publicationDate: new Date(2024, 3, 5)},
    {id: 8, title: "Консольная апа", maxRating: 5, deadlineDate: new Date(2024, 3, 16), publicationDate: new Date(2024, 3, 5)},
    {id: 9, title: "Еще сложная задача", maxRating: 20, deadlineDate: new Date(2024, 3, 17), publicationDate: new Date(2024, 3, 5)},
]
const tasks4 : HomeworkTaskViewModel[] = [
    {id: 10, title: "BFS/DFS", maxRating: 10, deadlineDate: new Date(2024, 3, 25), publicationDate: new Date(2024, 3, 18)},
    {id: 11, title: "Сжатие данных", maxRating: 10, deadlineDate: new Date(2024, 3, 25), publicationDate: new Date(2024, 3, 18)},
    {id: 12, title: "Раскраска графа", maxRating: 20, deadlineDate: new Date(2024, 3, 25), publicationDate: new Date(2024, 3, 18)},
]
const tasks5 : HomeworkTaskViewModel[] = [
    {id: 13, title: "Дубликаты", maxRating: 10, deadlineDate: new Date(2024, 4, 7), publicationDate: new Date(2024, 3, 30)},
    {id: 14, title: "Динамическое программирование", maxRating: 10, deadlineDate: new Date(2024, 4, 7), publicationDate: new Date(2024, 3, 30)},
    {id: 15, title: "Последняя задача курса", maxRating: 20, deadlineDate: new Date(2024, 4, 14), publicationDate: new Date(2024, 3, 30)},
]

const homeworks : HomeworkViewModel[] = [
    {id: 1, title: "First homework", tasks: tasks1, publicationDate: new Date(2024, 2, 7)},
    {id: 2, title: "Second homework", tasks: tasks2, publicationDate: new Date(2024, 2, 21)},
    {id: 3, title: "Third homework", tasks: tasks3, publicationDate: new Date(2024, 3, 5)},
    {id: 4, title: "Fourth homework", tasks: tasks4, publicationDate: new Date(2024, 3, 18)},
    {id: 5, title: "Fifth homework", tasks: tasks5, publicationDate: new Date(2024, 3, 30)},
]


const solutions : StatisticsCourseMatesModel[] = [
    {id: "1", name: "Вася", surname: "Пупкин", homeworks: [
        {id: 1, tasks: [
            {id: 1, solution: [{rating: 8, taskId: 1, publicationDate: new Date(2024, 2, 9)},
                    {rating: 9, taskId: 1, publicationDate: new Date(2024, 2, 12)}]},
            {id: 2, solution: [{rating: 7, taskId: 2, publicationDate: new Date(2024, 2, 13)}]},
            {id: 3, solution: [{rating: 7, taskId: 3, publicationDate: new Date(2024, 2, 19)},
                    {rating: 9, taskId: 3, publicationDate: new Date(2024, 2, 20, 20, 54)},
                    {rating: 10, taskId: 3, publicationDate: new Date(2024, 2, 25)}]}
            ]
        },
        {id: 2, tasks: [
            {id: 4, solution: [{rating: 1, taskId: 4, publicationDate: new Date(2024, 2, 27, 19, 11)},
                    {rating: 8, taskId: 4, publicationDate: new Date(2024, 2, 31, 19, 11)}]},
            {id: 5, solution: [{rating: 9, taskId: 5, publicationDate: new Date(2024, 2, 28, 5, 22)}]},
            {id: 6, solution: [{rating: 7, taskId: 6, publicationDate: new Date(2024, 2, 29)}]} // просрочил
            ]
        },
        {id: 3, tasks: [
            {id: 7, solution: [{rating: 3, taskId: 7, publicationDate: new Date(2024, 3, 10)},
                    {rating: 5, taskId: 7, publicationDate: new Date(2024, 3, 14)}]},
            {id: 8, solution: [{rating: 5, taskId: 8, publicationDate: new Date(2024, 3, 15)}]},
            {id: 9, solution: [{rating: 15, taskId: 9, publicationDate: new Date(2024, 3, 15)}]}
            ]
        },
        {id: 4, tasks: [
            {id: 10, solution: [{rating: 6, taskId: 10, publicationDate: new Date(2024, 3, 21)},
                    {rating: 9, taskId: 10, publicationDate: new Date(2024, 3, 24)}]},
            {id: 11, solution: [{rating: 8, taskId: 11, publicationDate: new Date(2024, 3, 21)}]},
            {id: 12, solution: [{rating: 20, taskId: 12, publicationDate: new Date(2024, 3, 26)}]} // просрочил
            ]
        },
        {id: 5, tasks: [
            {id: 13, solution: [{rating: 8, taskId: 13, publicationDate: new Date(2024, 4, 4)}, // 
                    {rating: 10, taskId: 13, publicationDate: new Date(2024, 4, 7)}]},
            {id: 14, solution: [ {state:  Solution.StateEnum.NUMBER_0, taskId: 14, publicationDate: new Date(2024, 4, 6)}] },
            {id: 15, solution: []} // решил не делать
            ]
        }
        ]
    },
    {id: "2", name: "Лионель", surname: "Месси", homeworks: [
            {id: 1, tasks: [
                    {id: 1, solution: [{rating: 5, taskId: 1, publicationDate: new Date(2024, 2, 12)}]},
                    {id: 2, solution: [{rating: 5, taskId: 2, publicationDate: new Date(2024, 2, 13)}]},
                    {id: 3, solution: [{rating: 10, taskId: 3, publicationDate: new Date(2024, 2, 19)}]}
                ]
            },
            {id: 2, tasks: [
                    {id: 4, solution: [{rating: 6, taskId: 4, publicationDate: new Date(2024, 3, 5)}]},
                    {id: 5, solution: [{rating: 4, taskId: 5, publicationDate: new Date(2024, 3, 8)}]},
                    {id: 6, solution: [{rating: 5, taskId: 6, publicationDate: new Date(2024, 3, 8)}]} // просрочил
                ]
            },
            {id: 3, tasks: [
                    {id: 7, solution: [{rating: 4, taskId: 7, publicationDate: new Date(2024, 3, 21)}]},
                    {id: 8, solution: [{rating: 3, taskId: 8, publicationDate: new Date(2024, 3, 21)}]},
                    {id: 9, solution: [{rating: 12, taskId: 9, publicationDate: new Date(2024, 3, 21)}]}
                ]
            },
            {id: 4, tasks: [
                    {id: 10, solution: [{rating: 10, taskId: 10, publicationDate: new Date(2024, 3, 28)}]},
                    {id: 11, solution: [{rating: 10, taskId: 11, publicationDate: new Date(2024, 4, 1)}]},
                    {id: 12, solution: [{rating: 20, taskId: 12, publicationDate: new Date(2024, 4, 6)}]} // просрочил
                ]
            },
            {id: 5, tasks: [
                    {id: 13, solution: [{rating: 10, taskId: 13, publicationDate: new Date(2024, 4, 8)}]},
                    {id: 14, solution: [{rating: 10, taskId: 14, publicationDate: new Date(2024, 4, 10)}]},
                    {id: 15, solution: [{rating: 19, taskId: 15, publicationDate: new Date(2024, 4, 14)}]} // решил не делать
                ]
            }
        ]
    },
    {id: "3", name: "Патрик", surname: "Мелроуз", homeworks: [
            {id: 1, tasks: [
                    {id: 1, solution: [{rating: 10, taskId: 1, publicationDate: new Date(2024, 2, 10)}]},
                    {id: 2, solution: [{rating: 10, taskId: 2, publicationDate: new Date(2024, 2, 10)}]},
                    {id: 3, solution: [{rating: 20, taskId: 3, publicationDate: new Date(2024, 2, 18)}]}
                ]
            },
            {id: 2, tasks: [
                    {id: 4, solution: [{rating: 10, taskId: 4, publicationDate: new Date(2024, 2, 22)}]},
                    {id: 5, solution: [{rating: 10, taskId: 5, publicationDate: new Date(2024, 2, 22)}]},
                    {id: 6, solution: [{rating: 10, taskId: 6, publicationDate: new Date(2024, 2, 23)}]} // просрочил
                ]
            },
            {id: 3, tasks: [
                    {id: 7, solution: [{rating: 8, taskId: 7, publicationDate: new Date(2024, 3, 12)}]},
                    {id: 8, solution: [{rating: 6, taskId: 8, publicationDate: new Date(2024, 3, 12)}]},
                    {id: 9, solution: [{rating: 10, taskId: 9, publicationDate: new Date(2024, 3, 15)}]}
                ]
            },
            {id: 4, tasks: [
                    {id: 10, solution: [{rating: 6, taskId: 10, publicationDate: new Date(2024, 3, 24)}]},
                    {id: 11, solution: [{rating: 4, taskId: 11, publicationDate: new Date(2024, 3, 24)}]},
                    {id: 12, solution: [/*{rating: 20, taskId: 12, publicationDate: new Date(2024, 3, 26)}*/]} // просрочил
                ]
            },
            {id: 5, tasks: [
                    {id: 13, solution: [/*{rating: 10, taskId: 13, publicationDate: new Date(2024, 4, 6)}*/]},
                    {id: 14, solution: [/*{rating: 10, taskId: 14, publicationDate: new Date(2024, 4, 7)}*/]},
                    {id: 15, solution: []} // решил не делать
                ]
            }
        ]
    },
    /*
    {id: "4", name: "Райан", surname: "Гослинг", homeworks: []},
    {id: "5", name: "Эмма", surname: "Стоун", homeworks: []},
    {id: "6", name: "Питер", surname: "Паркер", homeworks: []},
    {id: "7", name: "Райан", surname: "Гослинг", homeworks: []},
    {id: "8", name: "Эмма", surname: "Стоун", homeworks: []},
    {id: "9", name: "Питер", surname: "Паркер", homeworks: []},
    {id: "10", name: "Райан", surname: "Гослинг", homeworks: []},
    {id: "11", name: "Эмма", surname: "Стоун", homeworks: []},
    {id: "12", name: "Питер", surname: "Паркер", homeworks: []},
     */
]

const Course: React.FC = () => {
    const {courseId, tab} = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
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
        studentSolutions: [],
        isStudentViewMode: false
    })

    const [pageState, setPageState] = useState<IPageState>({
        tabValue: "homeworks"
    })

    const {
        isFound,
        course,
        createHomework,
        mentors,
        newStudents,
        acceptedStudents,
        isReadingMode,
        studentSolutions,
    } = courseState;

    const getPostedHomeworks = (homeworks: HomeworkViewModel[]) =>
        homeworks.filter(h => !h.isDeferred).map(h => ({
            ...h,
            tasks: h.tasks?.filter(t => !t.isDeferred)
        }))

    const userId = ApiSingleton.authService.getUserId()

    const isLecturer = ApiSingleton.authService.isLecturer()
    const isCourseMentor = mentors.some(t => t.userId === userId)

    const isStudentViewMode = isCourseMentor ? courseState.isStudentViewMode : true

    const courseHomeworks = (isCourseMentor && isStudentViewMode)
        ? getPostedHomeworks(courseState.courseHomework)
        : courseState.courseHomework

    const isSignedInCourse = newStudents!.some(cm => cm.userId === userId)

    const isAcceptedStudent = acceptedStudents!.some(cm => cm.userId === userId)

    const showStatsTab = isCourseMentor || isAcceptedStudent
    const showApplicationsTab = isCourseMentor

    const changeTab = (newTab: string) => {
        if (isAcceptableTabValue(newTab) && newTab !== pageState.tabValue) {
            if (newTab === "stats" && !showStatsTab) return;
            if (newTab === "applications" && !showApplicationsTab) return;

            setPageState(prevState => ({
                ...prevState,
                tabValue: newTab
            }));
        }
    }

    const setCurrentState = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId!)

        // У пользователя изменилась роль (иначе он не может стать лектором в курсе), 
        // однако он все ещё использует токен с прежней ролью
        const shouldRefreshToken =
            !ApiSingleton.authService.isLecturer() &&
            course &&
            course.mentors!.some(t => t.userId === userId)
        if (shouldRefreshToken) {
            const newToken = await ApiSingleton.accountApi.apiAccountRefreshTokenGet()
            newToken.value && ApiSingleton.authService.refreshToken(newToken.value.accessToken!)
            return
        }

        const solutions = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdGet(+courseId!)

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

    useEffect(() => changeTab(tab || "homeworks"), [tab, courseId, isFound])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi
            .apiCoursesSignInCourseByCourseIdPost(+courseId!)
            .then(() => setCurrentState());
    }

    const {tabValue} = pageState
    const searchedHomeworkId = searchParams.get("homeworkId")

    const unratedSolutionsCount = studentSolutions
        .flatMap(x => x.homeworks)
        .flatMap(x => x!.tasks)
        .filter(t => t!.solution!.slice(-1)[0]?.state === 0) //last solution
        .length

    const [lecturerStatsState, setLecturerStatsState] = useState(false);

    if (isFound) {
        return (
            <div className="container">
                <Grid style={{marginBottom: '50px', marginTop: "15px"}}>
                    <Grid container direction={"column"} spacing={1}>
                        {course.isCompleted && <Grid item>
                            <Alert severity="warning">
                                <AlertTitle>Курс завершен!</AlertTitle>
                                {isAcceptedStudent
                                    ? "Вы можете отправлять решения и получать уведомления об их проверке."
                                    : isCourseMentor
                                        ? "Вы продолжите получать уведомления о новых заявках на вступление и решениях."
                                        : !isLecturer ? "Вы можете записаться на курс и отправлять решения." : ""}
                            </Alert>
                        </Grid>}
                        <Grid item container xs={11} className={classes.info}>
                            <Grid item>
                                <Typography style={{fontSize: '22px'}}>
                                    {`${course.name} / ${course.groupName}`} &nbsp;
                                    {isCourseMentor &&
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
                                    {isCourseMentor && !isReadingMode! && (
                                        <RouterLink to={`/courses/${courseId}/edit`}>
                                            <EditIcon fontSize="small"/>
                                        </RouterLink>
                                    )}
                                </Typography>
                                <Grid container alignItems={"center"}>
                                    <Grid item>
                                        <MentorsList mentors={mentors}/>
                                    </Grid>
                                    {isCourseMentor && isReadingMode &&
                                        <Grid item>
                                            <IconButton onClick={() => setLecturerStatsState(true)}>
                                                <AssessmentIcon>
                                                    Статистика лекторов по курсу
                                                </AssessmentIcon>
                                            </IconButton>
                                        </Grid>
                                    }
                                    {lecturerStatsState &&
                                        <LecturerStatistics courseId={+courseId!}
                                                            onClose={() => setLecturerStatsState(false)}/>
                                    }
                                </Grid>
                                {isCourseMentor && <div><Switch value={isStudentViewMode}
                                                                onChange={(e, checked) => setCourseState(prevState => ({
                                                                    ...prevState,
                                                                    isStudentViewMode: checked
                                                                }))}/>
                                    <Typography display="inline">Студенческий режим отображения</Typography>
                                </div>}
                            </Grid>
                            <Grid item style={{width: '187px'}}>
                                <Grid container alignItems="flex-end" direction="column" xs={12}>
                                    {!isSignedInCourse && !isLecturer && !isAcceptedStudent && (
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
                                    {isSignedInCourse && !isAcceptedStudent &&
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
                        value={tabValue == "homeworks" ? 0 : tabValue === "stats" ? 1 : 2}
                        style={{marginTop: 15}}
                        indicatorColor="primary"
                        onChange={(event, value) => {
                            if (value === 0) navigate(`/courses/${courseId}/homeworks`)
                            if (value === 1) navigate(`/courses/${courseId}/stats`)
                            if (value === 2) navigate(`/courses/${courseId}/applications`)
                        }}
                    >
                        <Tab label="Домашние задания"/>
                        {showStatsTab && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Решения</div>
                                <Chip size={"small"} color={"default"}
                                      label={unratedSolutionsCount}/>
                            </Stack>
                        }/>}
                        {showApplicationsTab && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Заявки</div>
                                <Chip size={"small"} color={"default"}
                                      label={newStudents.length}/>
                            </Stack>}/>}
                    </Tabs>
                    <br/>
                    {tabValue === "homeworks" && <div>
                        {
                            isStudentViewMode
                                ?
                                <CourseExperimental homeworks={courseHomeworks}
                                                    isMentor={isCourseMentor}
                                                    studentSolutions={studentSolutions}
                                                    isStudentAccepted={isAcceptedStudent}
                                                    selectedHomeworkId={searchedHomeworkId == null ? undefined : +searchedHomeworkId}
                                                    userId={userId!}/>
                                :
                                <div>
                                    {createHomework && (
                                        <div>
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <AddHomework
                                                        id={+courseId!}
                                                        onCancel={() => setCurrentState()}
                                                        onSubmit={() => setCurrentState()}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <CourseHomework
                                                        onDelete={() => setCurrentState()}
                                                        isStudent={isAcceptedStudent}
                                                        isMentor={isCourseMentor}
                                                        isReadingMode={isReadingMode}
                                                        homework={courseHomeworks}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </div>
                                    )}
                                    {isCourseMentor && !createHomework && (
                                        <div>
                                            <Grid container>
                                                {!isReadingMode! &&
                                                    <Button
                                                        style={{marginBottom: 15}}
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
                                                }
                                                <CourseHomework
                                                    onDelete={() => setCurrentState()}
                                                    isStudent={isAcceptedStudent}
                                                    isMentor={isCourseMentor}
                                                    isReadingMode={isReadingMode}
                                                    homework={courseHomeworks}
                                                />
                                            </Grid>
                                        </div>
                                    )}
                                    {!isCourseMentor && (
                                        <CourseHomework
                                            onDelete={() => setCurrentState()}
                                            homework={courseHomeworks}
                                            isStudent={isAcceptedStudent}
                                            isMentor={isCourseMentor}
                                            isReadingMode={isReadingMode}
                                        />
                                    )}
                                </div>
                        }
                    </div>}
                    {tabValue === "stats" &&
                        <Grid container style={{marginBottom: "15px"}}>
                            <Grid item xs={12}>
                                <StudentStats
                                    homeworks={courseHomeworks}
                                    userId={userId as string}
                                    isMentor={isCourseMentor}
                                    course={courseState.course}
                                    //solutions={studentSolutions}
                                    solutions={solutions}
                                />
                            </Grid>
                        </Grid>}
                    {tabValue === "applications" && showApplicationsTab &&
                        <NewCourseStudents
                            onUpdate={() => setCurrentState()}
                            course={courseState.course}
                            students={courseState.newStudents}
                            courseId={courseId!}
                        />
                    }
                </Grid>
            </div>
        );
    }
    return <div className="container">
        <p>Загрузка...</p>
        <CircularProgress/>
    </div>
}

export default Course
