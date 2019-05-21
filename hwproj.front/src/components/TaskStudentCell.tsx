import * as React from 'react';
import { SolutionsApi, StateEnum } from '../api/solutions/api'
import TableCell from '@material-ui/core/TableCell'

interface ITaskStudentCellProps {
    studentId: string,
    taskId: number
}

interface ITaskStudentCellState {
    isLoaded: boolean,
    result: number
}

export default class TaskStudentCell extends React.Component<ITaskStudentCellProps, ITaskStudentCellState> {
    solutionsApi = new SolutionsApi();
    constructor(props: ITaskStudentCellProps) {
        super(props);
        this.state = {
            isLoaded: false,
            result: -1
        }
    }

    public render() {
        if (this.state.isLoaded) {
            return <TableCell component="td" padding="none" scope="row">
                {this.state.result === 2 ? '+' : (this.state.result === 1 ? '-' : '0')}
            </TableCell>
        }

        return ""
    }

    componentDidMount() {
        this.solutionsApi.getTaskSolutionsFromStudent(this.props.taskId, this.props.studentId)
            .then(solutions => this.setState({
                isLoaded: true,
                result: solutions.some(s => s.state === StateEnum.NUMBER_2)
                    ? 2
                    : solutions.some(s => s.state == StateEnum.NUMBER_1) ? 1 : 0
            }))
    }
}