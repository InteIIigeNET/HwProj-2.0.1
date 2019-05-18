import * as React from 'react';
import { SolutionsApi } from '../api/solutions/api'
import SolutionComponent from './Solution'
import Typography from '@material-ui/core/Typography'

interface ITaskSolutionsProps {
    taskId: number,
    studentId: string
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solutions: number[]
}

export default class TaskSolutions extends React.Component<ITaskSolutionsProps, ITaskSolutionsState> {
    constructor(props : ITaskSolutionsProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solutions: []
        }
    }

    public render() {
        const { isLoaded, solutions } = this.state;

        if (isLoaded) {
            let solutionList = solutions.map(id => <li key={id}>
                <SolutionComponent id={id} />
            </li>)

            return (
                <div>
                    {solutionList.length > 0 &&
                        <div>
                            <Typography variant='h6'>Решения: </Typography>
                            <ol>{solutionList}</ol>
                        </div>
                    }
                </div>
            )
        }

        return "";
    }

    componentDidMount() {
        let api = new SolutionsApi();
        api.getTaskSolutionsFromStudent(this.props.taskId, this.props.studentId)
            .then(ids => this.setState({
                isLoaded: true,
                solutions: ids
            }));
    }
}