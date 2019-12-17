import * as React from 'react';
import TableCell from '@material-ui/core/TableCell'
import { Redirect } from 'react-router-dom'
import ApiSingleton from "../api/ApiSingleton";

interface ITaskStudentCellProps {
    studentId: string,
    taskId: number,
    forMentor: boolean,
    userId: string
}

interface ITaskStudentCellState {
    isLoaded: boolean,
    result: number,
    redirectForMentor: boolean,
    redirectForStudent: boolean
}

export default class TaskStudentCell extends React.Component<ITaskStudentCellProps, ITaskStudentCellState> {
    constructor(props: ITaskStudentCellProps) {
        super(props);
        this.state = {
            isLoaded: false,
            result: -1,
            redirectForMentor: false,
            redirectForStudent: false
        }
    }

    public render() {
        if (this.state.redirectForMentor) {
            return <Redirect to={'/task/' + this.props.taskId.toString() + '/' + this.props.studentId.toString()} />
        }
        if( this.state.redirectForStudent) {
            return <Redirect to={'/task/' + this.props.taskId.toString()} />
        }

        if (this.state.isLoaded) {
            let classname = this.state.result === 2
                ? "accepted"
                : this.state.result === 1
                    ? "rejected"
                    : this.state.result === 0 ? "posted" : "td"
            let onClick = this.props.forMentor
                ? () => this.onMentorCellClick()
                : this.props.userId == this.props.studentId
                    ? () => this.onStudentCellClick()
                    : () => 0

            return (
                <TableCell onClick={onClick} className={classname} component="td" padding="none" scope="row">
                </TableCell>
            )
        }

        return ""
    }

    onMentorCellClick() {
        this.setState({redirectForMentor: true});
    }

    onStudentCellClick() {
        this.setState({redirectForStudent: true});
    }

    componentDidMount() {
        ApiSingleton.solutionsApi.getTaskSolutionsFromStudent(this.props.taskId, this.props.studentId)
            .then(solutions => this.setState({
                isLoaded: true,
                result: solutions.length > 0 
                    ? solutions.some(s => s.state!.toString() === "Accepted")
                        ? 2
                        : solutions.some(s => s.state!.toString() === "Rejected") ? 1 : 0
                    : -1
            }))
    }
}