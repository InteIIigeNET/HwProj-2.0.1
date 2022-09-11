import * as React from "react";
import TableCell from "@material-ui/core/TableCell";
import {Redirect} from "react-router-dom";
import {Solution, StatisticsCourseSolutionsModel} from "api";

interface ITaskStudentCellProps {
    studentId: string;
    taskId: number;
    forMentor: boolean;
    userId: string;
    solutions?: StatisticsCourseSolutionsModel[];
}

interface ITaskStudentCellState {
    isLoaded: boolean;
    solution?: StatisticsCourseSolutionsModel;
    redirectForMentor: boolean;
    redirectForStudent: boolean;
    color: string;
}

export default class TaskStudentCell extends React.Component<ITaskStudentCellProps,
    ITaskStudentCellState> {
    constructor(props: ITaskStudentCellProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solution: {},
            redirectForMentor: false,
            redirectForStudent: false,
            color: "",
        };
    }

    public render() {
        if (this.state.redirectForMentor) {
            return (
                <Redirect
                    to={
                        "/task/" +
                        this.props.taskId.toString() +
                        "/" +
                        this.props.studentId.toString()
                    }
                />
            );
        }

        if (this.state.redirectForStudent) {
            return <Redirect to={"/task/" + this.props.taskId.toString()}/>;
        }

        if (this.state.isLoaded) {
            let onClick = this.props.forMentor
                ? () => this.onMentorCellClick()
                : this.props.userId === this.props.studentId
                    ? () => this.onStudentCellClick()
                    : () => 0;
            const result = this.state.solution === undefined || this.state.solution.state! === Solution.StateEnum.NUMBER_0
                ? ""
                : this.state.solution.rating!.toString()
            return (
                <TableCell
                    onClick={onClick}
                    component="td"
                    padding="none"
                    scope="row"
                    align="center"
                    style={{backgroundColor: this.state.color, borderStyle: "none none ridge ridge"}}
                >
                    {result}
                </TableCell>
            );
        }

        return "";
    }

    onMentorCellClick() {
        this.setState({redirectForMentor: true});
    }

    onStudentCellClick() {
        this.setState({redirectForStudent: true});
    }

    getCellBackgroundColor = (state: Solution.StateEnum | undefined, isFirstTry: boolean): string => {
        if (state == Solution.StateEnum.NUMBER_0)
            return isFirstTry ? "#d0fcc7" : "#ffeb99"
        if (state == Solution.StateEnum.NUMBER_1)
            return "#ffc346"
        if (state == Solution.StateEnum.NUMBER_2)
            return "#7ad67a"
        return "#ffffff"
    }

    async componentDidMount() {
        const solutions = this.props.solutions
        const lastSolution = solutions!.slice(-1)[0]
        if (lastSolution === undefined) {
            this.setState({
                color: "",
                isLoaded: true,
                solution: undefined
            })
            return
        }
        this.setState({
            color: this.getCellBackgroundColor(lastSolution.state, solutions!.length > 1),
            isLoaded: true,
            solution: lastSolution
        })
    }
}

