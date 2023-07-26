import React from "react";
import { CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel } from "../../api/";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from "@material-ui/core";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import { Alert } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface IStudentStatsState {
    searched: string
    filterWorking: boolean
    ableSolutions: StatisticsCourseMatesModel[]
    isMentorWithStudents : boolean
}

class StudentStats extends React.Component<IStudentStatsProps, IStudentStatsState> {
    constructor(props: IStudentStatsProps) {
        super(props);
        const isStudentful = props.isMentor && props.course.assignments!.some(a => a.mentorId === props.userId)
        this.state = {
            searched: "",
            filterWorking: true,
            ableSolutions: isStudentful
                ? props.solutions.filter(s => props.course.assignments?.find(a => a.studentId === s.id)?.mentorId == props.userId)
                : props.solutions,
            isMentorWithStudents: isStudentful
        }

        // document.addEventListener('keydown', (event: KeyboardEvent) => {
        //     const {searched} = this.state
        //
        //     if (searched && event.key === "Escape") {
        //         event.preventDefault();
        //         this.setState({searched: ""})
        //     } else if (searched && event.key === "Backspace") {
        //         event.preventDefault();
        //         this.setState({searched: searched.slice(0, -1)})
        //     } else if (event.key.length === 1 && event.key.match(/[a-zA-Zа-яА-Я\s]/i)
        //     ) {
        //         event.preventDefault();
        //         this.setState({searched: searched + event.key})
        //     }
        // })
    }

    public render() {
        const homeworks = this.props.homeworks.filter(h => h.tasks && h.tasks.length > 0)
        const course = this.props.course;
        const userId = this.props.userId;
        const fixedColumnStyles: React.CSSProperties = {
            position: "sticky",
            left: 0,
            background: "white",
            borderRight: "1px solid black",
            borderBottom: "1px solid black"
        }

        const filterSolutions = (solutions: StatisticsCourseMatesModel[], keyword: string, isFilter: boolean) => {
            if (keyword) {
                solutions = solutions
                    .filter(cm => (cm.surname + " " + cm.name)
                        .toLowerCase()
                        .includes(keyword.toLowerCase()))
            }
            if (isFilter) {
                solutions = solutions
                    .filter(s => course.assignments
                        ?.find(a => a.studentId === s.id)?.mentorId == userId)
            }
            return solutions;
        }

        const setCurrentState = (prevState: IStudentStatsState) => ({
            ...prevState,
            filterWorking: !prevState.filterWorking,
            ableSolutions: filterSolutions(this.props.solutions, prevState.searched, !prevState.filterWorking)
        })

        const { searched, ableSolutions, isMentorWithStudents } = this.state;

        return (
            <div>
                {searched &&
                    <Alert style={{ marginBottom: 5 }} severity="info"><b>Студенты:</b> {searched.replaceAll(" ", "·")}
                    </Alert>}
                {isMentorWithStudents &&
                    <Grid>
                        <Checkbox defaultChecked onClick={() => this.setState(prevState => setCurrentState(prevState))} />
                        Закреплённые студенты
                    </Grid>
                }
                <TableContainer style={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ 
                                    ...fixedColumnStyles,
                                    zIndex: -4,
                                    color: "",
                                    borderLeft: "1px solid black",
                                    borderTop: "1px solid black" }}
                                    align="center"
                                    padding="none"
                                    component="td">
                                </TableCell>
                                {homeworks.map((homework, index) => (
                                    <TableCell
                                        padding="checkbox"
                                        component="td"
                                        align="center"
                                        style={{
                                            ...fixedColumnStyles,
                                            zIndex: -5,
                                            borderTop: "1px solid black"}}
                                        colSpan={homework.tasks!.length}
                                    >
                                        {homework.title}

                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ ...fixedColumnStyles, zIndex: 10,  borderLeft: "1px solid black" }}
                                    component="td"></TableCell>
                                {homeworks.map((homework) =>
                                    homework.tasks!.map((task) => (
                                        <TableCell 
                                            padding="checkbox" 
                                            component="td"
                                            align="center"
                                            style = {{...fixedColumnStyles}}>

                                            {task.title}

                                        </TableCell>
                                    ))
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ableSolutions.map((cm, index) => (
                                <TableRow key={index} hover style={{height: 35}}>
                                    <TableCell
                                        style={{...fixedColumnStyles, borderLeft: "1px solid black" }}
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
                                                userId={this.props.userId}
                                                forMentor={this.props.isMentor}
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
}

export default StudentStats;
