import * as React from 'react';
import { SolutionsApi } from '../api/solutions/api'
import SolutionComponent from './Solution'
import Typography from '@material-ui/core/Typography'

interface ITaskSolutionsProps {
    taskId: number,
    studentId: string,
    forMentor: boolean
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
                <SolutionComponent forMentor={this.props.forMentor} id={id} />
            </li>)

            return (
                <div>
                    {solutionList.length > 0 &&
                        <div>
                            <Typography variant='h6'>Решения: </Typography>
                            <ol reversed>{solutionList.reverse()}</ol>
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
            .then(solutions => this.setState({
                isLoaded: true,
                solutions: solutions.map(s => s.id!)
            }));
    }
}