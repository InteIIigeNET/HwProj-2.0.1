import * as React from 'react';
import {SolutionsApi} from '../api/solutions/api'
import SolutionComponent from './Solution'
import {RouteComponentProps} from "react-router-dom"
import Task from './Task'
import Typography from '@material-ui/core/Typography'
import AddSolution from './AddSolution'
import Button from '@material-ui/core/Button'
import TaskSolutions from './TaskSolutions'

interface ITaskSolutionsProps {
    taskId: string,
    studentId: string
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solutions: number[],
    addSolution: boolean
}

export default class TaskSolutionsPage extends React.Component<RouteComponentProps<ITaskSolutionsProps>, ITaskSolutionsState> {
    constructor(props: RouteComponentProps<ITaskSolutionsProps>) {
        super(props);
        this.state = {
            isLoaded: false,
            solutions: [],
            addSolution: false
        };
    }

    public render() {
        const { isLoaded, solutions } = this.state;

        if (isLoaded) {
            let solutionList = solutions.map(id => <li key={id}>
                <SolutionComponent id={id} />
            </li>)

            return (
                <div className="container">
                    <Task id={+this.props.match.params.taskId} forMentor={false} onDeleteClick={() => 3} />
                    {(!this.state.addSolution) && 
                        <div>
                            <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => { this.setState({addSolution: true })}}>Добавить решение</Button>
                            <br />
                            <TaskSolutions taskId={+this.props.match.params.taskId} studentId={+this.props.match.params.studentId} />
                        </div>
                    }
                    {this.state.addSolution && 
                        <div>
                            <AddSolution
                            id={+this.props.match.params.taskId}
                            onAdding={() => this.setState({addSolution: false})}
                            onCancel={() => this.setState({addSolution: false})} />
                            <br />
                            <TaskSolutions taskId={+this.props.match.params.taskId} studentId={+this.props.match.params.studentId} />
                        </div>
                    }
                    <br />
                    
                </div>
            )
        }

        return ""
    }

    componentDidMount() {
        let api = new SolutionsApi();
        api.getTaskSolutionsFromStudent(+this.props.match.params.taskId, +this.props.match.params.studentId)
            .then(ids => this.setState({
                isLoaded: true,
                solutions: ids
            }));
    }
}