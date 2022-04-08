import * as React from "react";
import TableCell from "@material-ui/core/TableCell";
import {Redirect} from "react-router-dom";
import {Solution, StatisticsCourseSolutionsModel} from "api";

interface IGroupTaskStudentCellProps {
    groupId: number;
    taskId: number;
    forMentor: boolean;
    userId: string;
    solutions?: StatisticsCourseSolutionsModel;
}

interface IGroupTaskStudentCellState {
    isLoaded: boolean;
    solution?: StatisticsCourseSolutionsModel;
    redirectForMentor: boolean;
    color: string;
}

export default class GroupTaskStudentCell extends React.Component<IGroupTaskStudentCellProps,
    IGroupTaskStudentCellState> {
    constructor(props: IGroupTaskStudentCellProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solution: {},
            redirectForMentor: false,
            color: "",
        };
    }

    public render() {
        if (this.state.redirectForMentor) {
            return (
                <Redirect
                    to={
                        "/groupTask/" +
                        this.props.taskId.toString() +
                        "/" +
                        this.props.groupId.toString() +
                        "/" +
                        this.props.userId.toString()
                    }
                />
            );
        }

        if (this.state.isLoaded) {
            let onClick = () => this.onMentorCellClick();
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
                    style={{backgroundColor: this.state.color}}
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

    getCellBackgroundColor = (state: Solution.StateEnum | undefined): string => {
        if (state == Solution.StateEnum.NUMBER_0)
            return "#d0fcc7"
        if (state == Solution.StateEnum.NUMBER_1)
            return "#ffc346"
        if (state == Solution.StateEnum.NUMBER_2)
            return "#7ad67a"
        return "#ffffff"
    }

    async componentDidMount() {
        const solution = this.props.solutions
        if (solution === undefined) {
            this.setState({
                color: "",
                isLoaded: true,
                solution: undefined
            })
            return
        }
        this.setState({
            color: this.getCellBackgroundColor(solution.state),
            isLoaded: true,
            solution: solution
        })
    }
}

