import React, {useEffect, useState} from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import {Alert} from "@mui/material";
import {grey} from "@material-ui/core/colors";
import HomeworkTags from "../Common/HomeworkTags";

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface IStudentStatsState {
    searched: string
}

const greyBorder = grey[300]

const StudentStats: React.FC<IStudentStatsProps> = (props) => {
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

    const borderStyle = `1px solid ${greyBorder}`
    const testHomeworkStyle = {
        backgroundColor: "#3f51b5",
        borderLeftColor: "#3f51b5",
        color: "white",
    }

    const homeworkStyles = (homeworks: HomeworkViewModel[], idx: number): React.CSSProperties | undefined => {
        if (homeworks[idx].tags?.includes(HomeworkTags.TestTag))
            return testHomeworkStyle
        if (idx !== 0 && homeworks[idx - 1].tags?.includes(HomeworkTags.TestTag))
            return {borderLeftColor: testHomeworkStyle.borderLeftColor}
        return undefined
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
                            <TableCell style={{zIndex: -4, color: ""}} align="center"
                                       padding="none"
                                       component="td">
                            </TableCell>
                            {homeworks.map((homework, idx) =>
                                <TableCell
                                    padding="checkbox"
                                    component="td"
                                    align="center"
                                    style={{
                                        zIndex: -5,
                                        borderLeft: borderStyle,
                                        ...homeworkStyles(homeworks, idx)
                                    }}
                                    colSpan={homework.tasks!.length}
                                >
                                    {homework.title}
                                </TableCell>)}
                        </TableRow>
                        <TableRow>
                            <TableCell style={{zIndex: 10}}
                                       component="td"></TableCell>
                            {homeworks.map((homework, idx) =>
                                homework.tasks!.map((task, i) => (
                                    <TableCell padding="checkbox" component="td" align="center"
                                               style={{
                                                   minWidth: "75px",
                                                   paddingLeft: 10,
                                                   paddingRight: 10,
                                                   borderLeft: i === 0 ? borderStyle : "",
                                                   ...homeworkStyles(homeworks, idx)
                                               }}
                                               key={task.id}>
                                        {task.title}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions.map((cm, index) => (
                            <TableRow key={index} hover style={{height: 50}}>
                                <TableCell
                                    align="left"
                                    padding="checkbox"
                                    style={{paddingRight: 15}}
                                    component="td"
                                    scope="row"
                                    variant={"head"}
                                >
                                    {cm.surname} {cm.name}
                                </TableCell>
                                {homeworks.map((homework, idx) =>
                                    homework.tasks!.map((task, i) => {
                                        const additionalStyles = i === 0 && homeworkStyles(homeworks, idx)
                                        return <StudentStatsCell
                                            solutions={solutions
                                                .find(s => s.id == cm.id)!.homeworks!
                                                .find(h => h.id == homework.id)!.tasks!
                                                .find(t => t.id == task.id)!.solution!}
                                            userId={props.userId}
                                            forMentor={props.isMentor}
                                            studentId={String(cm.id)}
                                            taskId={task.id!}
                                            taskMaxRating={task.maxRating!}
                                            {...additionalStyles}/>;
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

export default StudentStats;
