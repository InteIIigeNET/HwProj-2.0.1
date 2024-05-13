import React, {useEffect, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import {Grid, Box, Typography, Paper, CircularProgress} from "@mui/material";
import {
    CourseViewModel,
    HomeworkViewModel,
    StatisticsCourseMatesModel,
    StatisticsCourseMeasureSolutionModel
} from "../../../api/";
import ApiSingleton from "../../../api/ApiSingleton";
import HelpPopoverChartInfo from './HelpPopoverChartInfo';
import StudentCheckboxList from "./StudentCheckboxList";
import StudentProgressChart from "./StudentProgressChart";
import StudentPunctualityChart from './StudentPunctualityChart';
import task from "../../Tasks/Task";

interface IStudentStatsChartState {
    isFound: boolean;
    isSelectionMode: boolean;
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel[];
    bestStudent: StatisticsCourseMeasureSolutionModel[];
    averageStudent: StatisticsCourseMeasureSolutionModel[];
}

const StudentStatsChart: React.FC = () => {
    const {courseId} = useParams();
    const isLoggedIn = ApiSingleton.authService.isLoggedIn();
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [state, setState] = useState<IStudentStatsChartState>({
        isFound: false,
        isSelectionMode: false,
        course: {},
        homeworks: [],
        solutions: [],
        bestStudent: [],
        averageStudent: []
    })
    const [sectorSizes, setSectorSizes] = useState<number[]>([]);
    useEffect(() => {
        const tasksWithDeadlineAmount = state.homeworks
            .flatMap(h => h.tasks ?? []).filter(t => t.hasDeadline).length;
        
        setSectorSizes(new Array(tasksWithDeadlineAmount).fill(0));
    }, [state]);
    const handleStudentSelection = (studentIds : string[]) => {
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
            await ApiSingleton.statisticsApi.apiStatisticsByCourseIdChartsGet(+courseId!);

        setState({
            isFound: true,
            isSelectionMode: params.studentStatistics!.length > 1,
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
        if (state.isFound && !state.isSelectionMode) {
            setSelectedStudents((_) => [state.solutions[0].id!])
        }
    }, [state.isFound])

    const nameById = (id: string) => {
        const student = state.solutions.find(solution => solution.id === id)!
        return student.name + ' ' + student.surname;
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
                            <Grid item>
                                <Typography style={{fontSize: '22px'}}>
                                    {`${state.course.name} / ${state.course.groupName}`}
                                    <sup style={{color: "#2979ff"}}> бета</sup>
                                </Typography>
                            </Grid>
                            <Grid item>
                                {isLoggedIn && renderGoBackToCoursesStatsLink()}
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
                        {selectedStudents.length > 0 && <Box mb={5}>
                            <Typography variant="h6" align="center" color="textSecondary">
                                Анализ соблюдения сроков выполнения задач
                                <HelpPopoverChartInfo chartName='punctuality'/>
                            </Typography>
                        </Box>}
                    </Grid>
                    {tasksWithDeadlineAmount > 0 
                        ? selectedStudents.map((studentId, index) =>
                            <Grid xs={12} item>
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
                            </Grid>)
                        
                        :   <Grid xs={12} item>
                                <Typography variant="subtitle1" color="textSecondary">
                                    На курсе еще нет задач с дедлайнами.
                                </Typography>
                            </Grid>}
                </Grid>
            </div>
        )
    }
    return <div className="container">
        <p>Загрузка...</p>
        <CircularProgress/>
    </div>
}

export default StudentStatsChart;
