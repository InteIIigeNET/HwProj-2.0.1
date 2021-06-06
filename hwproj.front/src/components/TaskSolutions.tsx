import * as React from 'react';
import SolutionComponent from './Solution'
import Typography from '@material-ui/core/Typography'
import ApiSingleton from "../api/ApiSingleton";

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

    // componentDidMount() {
    //     ApiSingleton.solutionsApi.getTaskSolutionsFromStudent(this.props.taskId, this.props.studentId)
    //         .then(solutions => this.setState({
    //             isLoaded: true,
    //             solutions: solutions.map(s => s.id!)
    //         }));
    // }

    async componentDidMount() {
        const solutions = await ApiSingleton.solutionService.getSolutionsByTaskIdAndStudentId(this.props.taskId, +this.props.studentId)
        this.setState({ 
            isLoaded: true,
            solutions: solutions.map((s: any) => s.id!)
        })
        console.log(solutions)
    }
}