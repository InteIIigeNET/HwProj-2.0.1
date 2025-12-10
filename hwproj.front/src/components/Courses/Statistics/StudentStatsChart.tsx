import React, {useEffect, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import {Grid, Box, Typography, Paper} from "@mui/material";
import {
    CourseViewModel, HomeworkTaskViewModel,
    HomeworkViewModel, StatisticsCourseHomeworksModel,
    StatisticsCourseMatesModel,
    StatisticsCourseMeasureSolutionModel
} from "@/api";
import ApiSingleton from "../../../api/ApiSingleton";
import HelpPopoverChartInfo from './HelpPopoverChartInfo';
import StudentCheckboxList from "./StudentCheckboxList";
import StudentProgressChart from "./StudentProgressChart";
import StudentPunctualityChart from './StudentPunctualityChart';
import NameBuilder from "../../Utils/NameBuilder";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import { StudentsRadarChart } from "./StudentsRadarChart";
import {appBarStateManager} from "@/components/AppBar";

interface IStudentStatsChartState {
    isFound: boolean;
    isSelectionMode: boolean;
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    tasksWithDeadline: HomeworkTaskViewModel[];
    solutions: StatisticsCourseMatesModel[];
    bestStudent: StatisticsCourseMeasureSolutionModel[];
    averageStudent: StatisticsCourseMeasureSolutionModel[];
}

const StudentStatsChart: React.FC = () => {
    const {courseId} = useParams();
    const isLoggedIn = ApiSingleton.authService.loggedIn();
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [state, setState] = useState<IStudentStatsChartState>({
        isFound: false,
        isSelectionMode: false,
        course: {},
        homeworks: [],
        tasksWithDeadline: [],
        solutions: [],
        bestStudent: [],
        averageStudent: []
    })
    const [sectorSizes, setSectorSizes] = useState<number[]>([]);
    const tasksSolutionLength = (hw: StatisticsCourseHomeworksModel[], tasksWithDeadline: HomeworkTaskViewModel[]) =>
        hw.flatMap(h => h.tasks!
            .filter(task => tasksWithDeadline.find(t => t.id === task.id))
            .map(t => t.solution!.length))
    const handleStudentSelection = (studentIds: string[]) => {
        const newSectorSizes = sectorSizes.map((_, i) => {
            const taskSectorSizes = studentIds.map(id => {
                const studentHomeworks = state.solutions
                    .find(s => s.id === id)!.homeworks!;

                return tasksSolutionLength(studentHomeworks, state.tasksWithDeadline)[i];
            })

            return Math.max(...taskSectorSizes);
        })

        setSectorSizes(newSectorSizes);
        setSelectedStudents(studentIds);
    }

    const setCurrentState = async () => {
        const params =
            await ApiSingleton.statisticsApi.statisticsGetChartStatistics(+courseId!);

        const homeworks = params.homeworks!.filter(hw => hw.tasks && hw.tasks.length > 0)
        const tasksWithDeadline = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
            .filter(t => t.hasDeadline && new Date(t.publicationDate!).getTime() < Date.now())

        if (params.studentStatistics && params.studentStatistics.length > 0) {
            setSectorSizes(tasksSolutionLength(params.studentStatistics[0].homeworks!, tasksWithDeadline))
        }
        setState({
            isFound: true,
            isSelectionMode: params.studentStatistics!.length > 1,
            course: params.course!,
            homeworks: homeworks,
            tasksWithDeadline: tasksWithDeadline,
            solutions: params.studentStatistics!,
            bestStudent: params.bestStudentSolutions!,
            averageStudent: params.averageStudentSolutions!
        })
    }

    useEffect(() => {
        setCurrentState()
        appBarStateManager.setContextAction({actionName: "К курсу", link: `/courses/${courseId}/stats`})
        return () => appBarStateManager.reset()
    }, [])

    useEffect(() => {
        if (state.isFound && !state.isSelectionMode) {
            setSelectedStudents((_) => [state.solutions[0].id!])
        }
    }, [state.isFound])

    const nameById = (id: string) => {
        const student = state.solutions.find(solution => solution.id === id)!
        return student.name + ' ' + student.surname;
    }

    const tasks = state.homeworks.flatMap(h => h.tasks ?? [])
    const tasksAmount = tasks.length
    const tasksWithDeadlineAmount = state.tasksWithDeadline.length

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
                            <Grid item>
                                <Typography component="div" style={{fontSize: '22px'}}>
                                    {NameBuilder.getCourseFullName(state.course.name!, state.course.groupName)}
                                    <sup style={{color: "#2979ff"}}> бета</sup>
                                </Typography>
                            </Grid>
                        </Grid>
                        {state.isSelectionMode &&
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
                    {selectedStudents.length > 0 && <Grid xs={12} item>
                        <StudentsRadarChart
                            selectedStudents={selectedStudents}
                            homeworks={state.homeworks}
                            solutions={state.solutions}
                            averageStudent={state.averageStudent}

                        />
                    </Grid>}
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
                                            tasks={state.tasksWithDeadline}
                                            solutions={state.solutions.find(solution => solution.id === studentId)!}
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
        <DotLottieReact
            src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
            loop
            autoplay
        />
    </div>
}

export default StudentStatsChart;
