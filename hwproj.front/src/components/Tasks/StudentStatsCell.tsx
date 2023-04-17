import * as React from "react";
import TableCell from "@material-ui/core/TableCell";
import {Navigate} from "react-router-dom";
import {Solution, StatisticsCourseSolutionsModel} from "api";
import {Chip, Stack} from "@mui/material";
import {colorBetween} from "../../services/JsUtils";

interface ITaskStudentCellProps {
    studentId: string;
    taskId: number;
    forMentor: boolean;
    userId: string;
    taskMaxRating: number;
    solutions?: StatisticsCourseSolutionsModel[];
}

interface ITaskStudentCellState {
    isLoaded: boolean;
    lastRatedSolution?: StatisticsCourseSolutionsModel;
    redirectForMentor: boolean;
    redirectForStudent: boolean;
    color: string;
    ratedSolutionsCount: number;
}

export default class StudentStatsCell extends React.Component<ITaskStudentCellProps, ITaskStudentCellState> {
    constructor(props: ITaskStudentCellProps) {
        super(props);
        this.state = {
            isLoaded: false,
            lastRatedSolution: {},
            redirectForMentor: false,
            redirectForStudent: false,
            color: "",
            ratedSolutionsCount: 0
        };
    }

    public render() {
        if (this.state.redirectForMentor) {
            return (
                <Navigate
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
            return <Navigate to={"/task/" + this.props.taskId.toString()}/>;
        }

        if (this.state.isLoaded) {
            let onClick = this.props.forMentor
                ? () => this.onMentorCellClick()
                : this.props.userId === this.props.studentId
                    ? () => this.onStudentCellClick()
                    : () => 0;
            const result = this.state.lastRatedSolution === undefined
                ? ""
                : <Stack direction="row" spacing={0.3} justifyContent={"center"} alignItems={"center"}>
                    <div>{this.state.lastRatedSolution.rating!}</div>
                    <Chip color={"default"} size={"small"} label={this.state.ratedSolutionsCount}/>
                </Stack>
            return (
                <TableCell
                    onClick={onClick}
                    component="td"
                    padding="none"
                    scope="row"
                    align="center"
                    style={{backgroundColor: this.state.color, borderStyle: "none none ridge ridge", cursor: "pointer"}}
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


    getCellBackgroundColor = (state: Solution.StateEnum | undefined,
                              rating: number | undefined, maxRating: number,
                              isFirstTry: boolean): string => {
        if (state == Solution.StateEnum.NUMBER_0)
            return isFirstTry ? "#d0fcc7" : "#afeeee"
        return rating !== undefined
            ? colorBetween(0xff0000, 0x2cba00, rating / maxRating * 100)
            : "#ffffff"
    }

    async componentDidMount() {
        const {solutions, taskMaxRating} = this.props
        const ratedSolutions = solutions!.filter(x => x.state != Solution.StateEnum.NUMBER_0)
        const ratedSolutionsCount = ratedSolutions.length
        const isFirstUnratedTry = ratedSolutionsCount === 0
        const lastSolution = solutions!.slice(-1)[0]
        const lastRatedSolution = ratedSolutions.slice(-1)[0]

        if (lastSolution === undefined) {
            this.setState({
                color: "#ffffff",
                isLoaded: true,
                lastRatedSolution: undefined
            })
            return
        }
        this.setState({
            color: this.getCellBackgroundColor(lastSolution.state, lastSolution.rating, taskMaxRating, isFirstUnratedTry),
            isLoaded: true,
            lastRatedSolution: lastRatedSolution,
            ratedSolutionsCount: ratedSolutions.length
        })
    }
}

