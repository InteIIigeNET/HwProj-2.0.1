import React, { useState } from "react";
import {Link, useLocation} from 'react-router-dom';
import {Grid, Box, Typography, Paper} from "@mui/material";
import {makeStyles} from "@material-ui/styles";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import HelpPopoverChartInfo from './HelpPopoverChartInfo';
import StudentCheckboxList from "./StudentCheckboxList";
import StudentProgressChart from "./StudentProgressChart";
import StudentPunctualityChart from './StudentPunctualityChart';

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

const styles = makeStyles(() => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

const StudentStatsChart: React.FC = () => {
    const classes = styles();
    const location = useLocation();
    const props: IStudentStatsProps = location.state;
    
    const [selectedStudents, setSelectedStudents] = 
        useState<string[]>(props.isMentor ? [] : [props.userId]);
    const handleStudentSelection = (studentId : string) => {
        setSelectedStudents((prevSelectedStudents) => {
            if (prevSelectedStudents.includes(studentId)) {
                return (prevSelectedStudents.filter(id => id !== studentId))
            } else {
                return [...prevSelectedStudents, studentId];
            }
        })
    }
    
    const nameById = (id : string) => {
        const student = props.solutions.find(solution => solution.id === id)!
        return student.name + ' ' + student.surname;
    }

    const renderGoBackToCoursesStatsLink = () => {
        return <Link
            to={`/courses/${props.course.id}/stats`}
            style={{color: '#212529'}}
        >
            <Typography>
                Назад к курсу
            </Typography>
        </Link>
    }
    
    return (
        <div className="container">
            <Grid container spacing={3} style={{marginTop: 15, marginBottom: 20, paddingLeft: 40, paddingRight: 40}}>
                <Grid item container xs={11} className={classes.info} direction='column'>
                    <Typography style={{fontSize: '22px'}}>
                        {`${props.course.name} / ${props.course.groupName}`} &nbsp;
                    </Typography>
                    {renderGoBackToCoursesStatsLink()}
                </Grid>
                {props.isMentor && 
                    <Grid item xs={12} sm={4} style={{paddingBottom: 0}}>
                        <Box mb={2}>
                            <StudentCheckboxList
                                mates={[...props.solutions.map(s => ({id: s.id!, name: s.name!, surname: s.surname!}))]}
                                onStudentSelection = {handleStudentSelection}/>
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
                                homeworks = {props.homeworks}
                                course = {props.course}
                                isMentor = {props.isMentor}
                                userId = {props.userId}
                                solutions = {props.solutions}
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
                                    homeworks={props.homeworks}
                                    solutions={props.solutions.find
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

export default StudentStatsChart;
