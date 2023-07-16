import React from "react";
import { CourseViewModel, HomeworkViewModel, Solution, StatisticsCourseMatesModel } from "../../api/";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
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
}

class StudentStats extends React.Component<IStudentStatsProps, IStudentStatsState> {
    constructor(props: IStudentStatsProps) {
        super(props);
        this.state = {
            searched: "",
            filterWorking: false,
            ableSolutions: props.solutions
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
        const isMentor = this.props.isMentor;
        const fixedColumnStyles: React.CSSProperties = {
            position: "sticky",
            left: 0,
            background: "white",
            borderRight: "1px solid black"
        }

        const setCurrentState = (prevState: IStudentStatsState) => {
            prevState.filterWorking = !prevState.filterWorking;
            prevState.ableSolutions = prevState.searched
                ? this.props.solutions
                    .filter(cm => (cm.surname + " " + cm.name)
                    .toLowerCase()
                    .includes(prevState.searched.toLowerCase()))
                : this.props.solutions
            prevState.ableSolutions = prevState.filterWorking
                ? prevState.ableSolutions
                    .filter(s => course.courseMates
                        ?.find(cm => cm.studentId === s.id)?.mentorId == userId)
                : prevState.ableSolutions
            return prevState;
        }

        return (
            <div>
                {this.state.searched &&
                    <Alert style={{ marginBottom: 5 }} severity="info"><b>Студенты:</b> {this.state.searched.replaceAll(" ", "·")}
                    </Alert>}
                {isMentor &&
                    <Checkbox onClick={() => this.setState(prevState => setCurrentState(prevState))} />
                }

                Закрепленные студенты

                <TableContainer style={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ ...fixedColumnStyles, zIndex: -4, color: "" }} align="center" padding="none"
                                    component="td">
                                </TableCell>
                                {homeworks.map((homework, index) => (
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
                            {this.state.ableSolutions.map((cm, index) => (
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
                                                solutions={this.state.ableSolutions
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
