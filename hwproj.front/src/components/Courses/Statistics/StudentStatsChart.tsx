import React, {useEffect, useState} from "react";
import {Link, useParams, useSearchParams } from 'react-router-dom';
import {Grid, Box, Typography, Paper, CircularProgress, IconButton, Snackbar } from "@mui/material";
import {
    CourseViewModel,
    HomeworkViewModel,
    StatisticsCourseMatesModel,
    StatisticsCourseMeasureSolutionModel
} from "../../../api/";
import ShareIcon from "@mui/icons-material/Share";
import ApiSingleton from "../../../api/ApiSingleton";
import HelpPopoverChartInfo from './HelpPopoverChartInfo';
import StudentCheckboxList from "./StudentCheckboxList";
import StudentProgressChart from "./StudentProgressChart";
import StudentPunctualityChart from './StudentPunctualityChart';

interface IStudentStatsChartState {
    isFound: boolean;
    isLecturer: boolean;
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel[];
    bestStudent: StatisticsCourseMeasureSolutionModel[];
    averageStudent: StatisticsCourseMeasureSolutionModel[];
}

const StudentStatsChart: React.FC = () => {
    const {courseId} = useParams();
    const [ searchParams ] = useSearchParams();
    const isLoggedIn = ApiSingleton.authService.isLoggedIn();
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const isGuestAccess = searchParams.get("token") != null;
    const [ copied, setCopied ] = useState(false);
    const [state, setState] = useState<IStudentStatsChartState>({
        isFound: false,
        isLecturer: false,
        course: {},
        homeworks: [],
        solutions: [],
        bestStudent: [],
        averageStudent: []
    })
    const [sectorSizes, setSectorSizes] = useState<number[]>([]);
    const handleStudentSelection = (studentIds: string[]) => {
        const newSectorSizes = sectorSizes.map((_, i) => {
            const taskSectorSizes = studentIds.map(id => {
                const task = state.solutions.filter(s => s.id === id)[0]
                    .homeworks!.flatMap(h => h.tasks ?? [])[i]
                return task.solution!.length;
            })

            return Math.max(...taskSectorSizes);
        })

        setSectorSizes(newSectorSizes);
        setSelectedStudents(studentIds);
    }

    const setCurrentState = async () => {
        const params =
            await ApiSingleton.statisticsApi.apiStatisticsByCourseIdChartsGet(+courseId!, searchParams.get("token")!);
        
        if (params.studentStatistics && params.studentStatistics.length > 0) {
            const sectorSizes = params.studentStatistics[0].homeworks!
                .flatMap(h => h.tasks!.map(t => t.solution!.length))
            setSectorSizes(sectorSizes)
        }

        const userId = isLoggedIn ? ApiSingleton.authService.getUserId() : undefined;
        const isLecturer = userId != undefined && ApiSingleton.authService.isLecturer()
            && !params.studentStatistics?.map(s => s.id).includes(userId);
        
        setState({
            isFound: true,
            isLecturer: isLecturer,
            course: params.course!,
            homeworks: params.homeworks!,
            solutions: params.studentStatistics!,
            bestStudent: params.bestStudentSolutions!,
            averageStudent: params.averageStudentSolutions!
        })
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    useEffect(() => {
        if (state.isFound && !state.isLecturer && !isGuestAccess) {
            setSelectedStudents((_) => [state.solutions[0].id!])
        }
    }, [state.isFound])

    const nameById = (id: string) => {
        const student = state.solutions.find(solution => solution.id === id)!
        return student.name + ' ' + student.surname;
    }

    const copyLink = async () => {
        if (copied) {
            setCopied(false);
            return;
        }
        const token = (await ApiSingleton.accountApi.apiAccountGetGuestTokenGet(courseId)).accessToken;
        const sharingLink = window.location.href.includes('?token=')
            ? window.location.href : window.location.href + '?token=' + token;
        navigator.clipboard.writeText(sharingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const renderGoBackToCoursesStatsLink = () => {
        return (
            <Link
                to={`/courses/${state.course.id}/stats`}
                style={{color: '#212529'}}
            >
                <Typography>
                    Назад к курсу
                </Typography>
            </Link>
        )
    }

    const tasks = state.homeworks.flatMap(h => h.tasks ?? [])
    const tasksAmount = tasks.length
    const tasksWithDeadlineAmount = tasks.filter(t => t.hasDeadline).length

    if (state.isFound && tasksAmount) {
        return (
            <div className="container">
                <Grid container spacing={1} style={{marginBottom: 10, marginTop: 20}}>
                    <Grid item container direction='row' spacing={1}
                          justifyContent={"space-between"}
                          alignContent={"center"}
                          alignItems={"baseline"}
                          position={"sticky"}
                          paddingTop={-24}
                          top={0}
                          style={{
                              backgroundColor: "white",
                              zIndex: 100
                          }}>
                        <Grid item container direction='column' xs={"auto"}>
                            <Grid item container direction='row'>
                                <Typography style={{fontSize: '22px'}}>
                                    {`${state.course.name} / ${state.course.groupName}`}
                                    <sup style={{color: "#2979ff"}}> бета</sup>
                                </Typography>
                                {state.isLecturer &&
                                    <>
                                        <IconButton onClick={copyLink}>
                                            <ShareIcon style={{color: "#2979ff"}}/>
                                        </IconButton>
                                        <Snackbar open={copied} message="Ссылка скопирована"/>
                                    </>}
                            </Grid>
                            <Grid item>
                                {isLoggedIn && renderGoBackToCoursesStatsLink()}
                            </Grid>
                        </Grid>
                        {(state.isLecturer || isGuestAccess) &&
                            <Grid item>
                                <StudentCheckboxList
                                    mates={[...state.solutions.map(s => ({
                                        id: s.id!,
                                        name: s.name!,
                                        surname: s.surname!
                                    }))]}
                                    onStudentsChange={handleStudentSelection}
                                />
                            </Grid>
                        }
                    </Grid>
                    <Grid xs={12} item>
                        <Box mt={3} mb={8}>
                            <Paper elevation={2}>
                                <Typography variant="h6" align="center" color="textSecondary">
                                    Анализ прогресса студентов
                                    <HelpPopoverChartInfo chartName='progress'/>
                                </Typography>
                                <StudentProgressChart
                                    selectedStudents={selectedStudents}
                                    homeworks={state.homeworks}
                                    course={state.course}
                                    solutions={state.solutions}
                                    bestStudentSolutions={state.bestStudent}
                                    averageStudentSolutions={state.averageStudent}
                                />
                            </Paper>
                        </Box>
                    </Grid>
                    {tasksWithDeadlineAmount > 0 && selectedStudents.length > 0 &&
                        <Grid item xs={12}>
                            <Box mb={5}>
                                <Typography variant="h6" align="center" color="textSecondary">
                                    Анализ соблюдения сроков выполнения задач
                                    <HelpPopoverChartInfo chartName='punctuality'/>
                                </Typography>
                            </Box>
                            {selectedStudents.map((studentId, index) =>
                                <Box key={studentId} mb={3}>
                                    <Paper elevation={2} style={{padding: 15}}>
                                        <Typography variant="h6" style={{marginBottom: 7}} color="textSecondary">
                                            {nameById(studentId)}
                                        </Typography>
                                        <StudentPunctualityChart
                                            index={index + 1}
                                            homeworks={state.homeworks}
                                            solutions={state.solutions.find
                                            (solution => solution.id === studentId)!}
                                            sectorSizes={sectorSizes}
                                        />
                                    </Paper>
                                </Box>
                            )}
                        </Grid>}
                </Grid>
            </div>
        )
    } else if (state.isFound && !tasksAmount) {
        return <div className="container">
            <p>На курсе нет задач</p>
        </div>
    }

    return <div className="container">
        <p>Загрузка...</p>
        <CircularProgress/>
    </div>
}

export default StudentStatsChart;
