import * as React from "react";
import TableCell from "@material-ui/core/TableCell";
import {Navigate} from "react-router-dom";
import {Solution} from "api";
import {Chip, Stack, Tooltip} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";

interface ITaskStudentCellProps {
    studentId: string;
    taskId: number;
    forMentor: boolean;
    userId: string;
    taskMaxRating: number;
    solutions?: Solution[];
}

interface ITaskStudentCellState {
    isLoaded: boolean;
    lastRatedSolution?: Solution;
    redirectForMentor: boolean;
    redirectForStudent: boolean;
    color: string;
    ratedSolutionsCount: number;
    solutionsDescription: string;
}

export default class StudentStatsCell extends React.Component<ITaskStudentCellProps, ITaskStudentCellState> {
    constructor(props: ITaskStudentCellProps) {
        super(props);
        const {solutions, taskMaxRating} = this.props
        this.state = {
            ...StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating),
            isLoaded: true,
            redirectForMentor: false,
            redirectForStudent: false,
        };
    }

    public render() {
        const {ratedSolutionsCount, solutionsDescription} = this.state

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
            const tootltipTitle = ratedSolutionsCount === 0
                ? solutionsDescription
                : solutionsDescription + `\n\n${Utils.pluralizeHelper(["Проверена", "Проверены", "Проверено"], ratedSolutionsCount)} ${ratedSolutionsCount} ${Utils.pluralizeHelper(["попытка", "попытки", "попыток"], ratedSolutionsCount)}`
            const result = this.state.lastRatedSolution === undefined
                ? ""
                : <Stack direction="row" spacing={0.3} justifyContent={"center"} alignItems={"center"}>
                    <div>{this.state.lastRatedSolution.rating!}</div>
                    <Chip color={"default"} size={"small"} label={ratedSolutionsCount}/>
                </Stack>
            return <Tooltip arrow disableInteractive enterDelay={2000}
                            title={<span style={{whiteSpace: 'pre-line'}}>{tootltipTitle}</span>}>
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
            </Tooltip>
        }

        return "";
    }

    onMentorCellClick() {
        this.setState({redirectForMentor: true});
    }

    onStudentCellClick() {
        this.setState({redirectForStudent: true});
    }
}
