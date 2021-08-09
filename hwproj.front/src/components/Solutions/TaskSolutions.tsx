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
    solutions: Solution[]
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
            let solutionList = solutions.map(s => <li key={s.id}>
                <SolutionComponent forMentor={this.props.forMentor} solution={s} />
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
        ApiSingleton.solutionsApi.apiSolutionsGet()
            .then(solutions => solutions.filter(s => s.taskId == this.props.taskId && s.studentId == this.props.studentId))
            .then(solutions => this.setState({
                isLoaded: true,
                solutions: solutions
            }));
    }
}