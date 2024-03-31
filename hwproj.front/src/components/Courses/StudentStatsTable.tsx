import React, {useEffect, useState} from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import {Alert} from "@mui/material";

export interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface IStudentStatsState {
    searched: string
}

const StudentStatsTable: React.FC<IStudentStatsProps> = (props) => {
    const [state, setSearched] = useState<IStudentStatsState>({
        searched: ""
    });

    const {searched} = state

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.altKey) return
            if (searched && event.key === "Escape") {
                setSearched({searched: ""});
            } else if (searched && event.key === "Backspace") {
                setSearched({searched: searched.slice(0, -1)})
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Zа-яА-Я\s]/i)
            ) {
                setSearched({searched: searched + event.key})
            }
        };

        document.addEventListener('keydown', keyDownHandler);
        return () => document.removeEventListener('keydown', keyDownHandler);
    }, [searched]);

    const homeworks = props.homeworks.filter(h => h.tasks && h.tasks.length > 0)
    const solutions = searched
        ? props.solutions.filter(cm => (cm.surname + " " + cm.name).toLowerCase().includes(searched.toLowerCase()))
        : props.solutions
    const fixedColumnStyles: React.CSSProperties = {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black"
    }

    return (
        <div>
            {searched &&
                <Alert style={{marginBottom: 5}} severity="info"><b>Поиск: </b>
                    {searched.replaceAll(" ", "·")}
                </Alert>}
            <TableContainer style={{maxHeight: "100vh"}}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{...fixedColumnStyles, zIndex: -4, color: ""}} align="center"
                                       padding="none"
                                       component="td">
                            </TableCell>
                            {homeworks.map((homework) => (
                                <TableCell
                                    padding="checkbox"
                                    component="td"
                                    align="center"
                                    style={{zIndex: -5}}
                                    colSpan={homework.tasks!.length}
                                >
                                    {homework.title}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell style={{...fixedColumnStyles, zIndex: 10}}
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
                        {solutions.map((cm, index) => (
                            <TableRow key={index} hover style={{height: 35}}>
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
                                    homework.tasks!.map((task) => {
                                        console.log(cm.id);
                                        console.log(homework.id);
                                        console.log(solutions
                                            .find(s => s.id == cm.id)!.homeworks!
                                            .find(h => h.id == homework.id)!.tasks!);
                                        return <StudentStatsCell
                                            solutions={solutions
                                                .find(s => s.id == cm.id)!.homeworks!
                                                .find(h => h.id == homework.id)!.tasks!
                                                .find(t => t.id == task.id)!.solution!}
                                            userId={props.userId}
                                            forMentor={props.isMentor}
                                            studentId={String(cm.id)}
                                            taskId={task.id!}
                                            taskMaxRating={task.maxRating!}/>
                        })
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default StudentStatsTable;
