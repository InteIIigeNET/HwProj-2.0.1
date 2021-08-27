import * as React from 'react';
import SolutionComponent from './Solution'
import Typography from '@material-ui/core/Typography'
import ApiSingleton from "../../api/ApiSingleton";
import { Solution } from '../../api';

interface ITaskSolutionsProps {
    taskId: number,
    studentId: string,
    forMentor: boolean
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solution: Solution,
}

export default class TaskSolutions extends React.Component<ITaskSolutionsProps, ITaskSolutionsState> {
    constructor(props : ITaskSolutionsProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solution: {},
        }
    }

    public render() {
        const { isLoaded, solution } = this.state;

        if (isLoaded) {
            return (
                <div>
                    {solution &&
                        <div>
                            <Typography variant='h6'>Решение: </Typography>
                            <SolutionComponent forMentor={this.props.forMentor} solution={solution} />
                        </div>
                    }
                </div>
            )
        }

        return "";
    }

    componentDidMount() {
        ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(
            this.props.taskId, 
            this.props.studentId,
        )
            .then(solution => this.setState({
                isLoaded: true,
                solution: solution
            }));
    }
}