import React from "react";
import { AssignmentsViewModel, CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel } from "../../api/";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from "@material-ui/core";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import Checkbox from '@mui/material/Checkbox';
import { useEffect, useState } from "react";

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface IStudentStatsState {
    studentsFiltered: boolean
    ableSolutions: StatisticsCourseMatesModel[]
}

const StudentStats: React.FC<IStudentStatsProps> = (props) => {

    const isMentorWithStudents = props.isMentor && props.course.assignments!.some(a => a.mentorId === props.userId)
    const mentorStudentsIds = isMentorWithStudents
        ? props.course.assignments!.find(a => a.mentorId === props.userId)?.studentIds
        : []
    const mentorStudentSolutions =  isMentorWithStudents
        ? props.solutions.filter(solution => mentorStudentsIds!.some(studentId => solution.id === studentId))
        : []

    const homeworks = props.homeworks.filter(h => h.tasks && h.tasks.length > 0)
    const fixedColumnStyles: React.CSSProperties = {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black"
    }

    const [state, setState] = useState<IStudentStatsState>({
        studentsFiltered: true,
        ableSolutions: isMentorWithStudents ? mentorStudentSolutions : props.solutions
    });
    
    const setStatsState = () => {
        const filter = !state.studentsFiltered
        setState(prevState => ({
            ...prevState,
            studentsFiltered: filter,
            ableSolutions: filter ? mentorStudentSolutions : props.solutions
        }))

    }

    const { ableSolutions } = state;

    return (
        <div>
            {isMentorWithStudents &&
                <Grid>
                    <Checkbox defaultChecked onClick={() => setStatsState()} />
                    Закреплённые студенты
                </Grid>
            }
            <TableContainer style={{ maxHeight: "100vh" }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ ...fixedColumnStyles, zIndex: -4, color: "" }} align="center"
                                padding="none"
                                component="td">
                            </TableCell>
                            {homeworks.map((homework) => (
                                <TableCell
                                    padding="checkbox"
                                    component="td"
                                    align="center"
                                    style={{ zIndex: -5 }}
                                    colSpan={homework.tasks!.length}
                                >
                                    {homework.title}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ ...fixedColumnStyles, zIndex: 10 }}
                                component="td"></TableCell>
                            {homeworks.map((homework) =>
                                homework.tasks!.map((task) => (
                                    <TableCell padding="checkbox" component="td" align="center">
                                        {task.title}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ableSolutions.map((cm, index) => (
                            <TableRow key={index} hover style={{ height: 35 }}>
                                <TableCell
                                    style={fixedColumnStyles}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row"
                                >
                                    {cm.surname} {cm.name}
                                </TableCell>
                                {homeworks.map((homework) =>
                                    homework.tasks!.map((task) => (
                                        <StudentStatsCell
                                            solutions={ableSolutions
                                                .find(s => s.id == cm.id)!.homeworks!
                                                .find(h => h.id == homework.id)!.tasks!
                                                .find(t => t.id == task.id)!.solution!}
                                            userId={props.userId}
                                            forMentor={props.isMentor}
                                            studentId={String(cm.id)}
                                            taskId={task.id!}
                                            taskMaxRating={task.maxRating!} />
                                    ))
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default StudentStats;