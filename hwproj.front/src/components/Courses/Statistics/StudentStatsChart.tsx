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
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const { courseId } = useParams();
    const isLoggedIn = ApiSingleton.authService.isLoggedIn();
    const [state, setState] = useState<IStudentStatsChartState>({
        isFound: false,
        isSelectionMode: false,
        course: {},
        homeworks: [],
        solutions: [],
        bestStudent: [],
        averageStudent: []
    })
    
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
    
    const nameById = (id : string) => {
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
    
    if (state.isFound) {
        return (
            <div className="container">
                <Grid container spacing={3} style={{marginTop: 15, marginBottom: 20}}>
                    <Grid item container xs={11} direction='column'>
                        <Grid item container direction='row'>
                            <Typography style={{fontSize: '22px'}}>
                                {`${state.course.name} / ${state.course.groupName}`} &nbsp;
                            </Typography>
                        </Grid>
                        {isLoggedIn && renderGoBackToCoursesStatsLink()}
                    </Grid>
                    {state.isSelectionMode &&
                        <Grid item xs={12} sm={4} style={{paddingBottom: 0}}>
                            <Box mb={2}>
                                <StudentCheckboxList
                                    mates={[...state.solutions.map(s => ({id: s.id!, name: s.name!, surname: s.surname!}))]}
                                    onStudentsChange = {setSelectedStudents}/>
                            </Box>
                        </Grid>
                    }
                    <Grid item xs={12} style={{paddingTop: 0}}>
                        <Box mb={8}>
                            <Paper elevation={2} style={{paddingTop: 15, paddingBottom: 15}}>
                                <Typography variant="h6" align="center" color="textSecondary">
                                    Анализ прогресса студентов
                                    <HelpPopoverChartInfo chartName='progress'/>
                                </Typography>
                                <StudentProgressChart
                                    selectedStudents = {selectedStudents}
                                    homeworks = {state.homeworks}
                                    course = {state.course}
                                    solutions = {state.solutions}
                                    bestStudentSolutions={state.bestStudent}
                                    averageStudentSolutions={state.averageStudent}
                                />
                            </Paper>
                        </Box>
                        <Box mb={5}>
                            <Typography variant="h5" align="center" color="textSecondary">
                                Анализ соблюдения сроков выполнения задач
                                <HelpPopoverChartInfo chartName='punctuality'/>
                            </Typography>
                        </Box>
                        {selectedStudents.map((studentId, index) => {
                            return<Box key={studentId} mb={3}>
                                <Paper elevation={2} style={{padding: 15}}>
                                    <Typography variant="h6" style={{marginBottom: 7}} color="textSecondary">
                                        {nameById(studentId)}
                                    </Typography>
                                    <StudentPunctualityChart
                                        index={index+1}
                                        homeworks={state.homeworks}
                                        solutions={state.solutions.find
                                        (solution => solution.id === studentId)!}
                                    />
                                </Paper>
                            </Box>
                        })}
                    </Grid>
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
