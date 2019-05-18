import * as React from 'react';
import {SolutionsApi} from '../api/solutions/api'
import SolutionComponent from './Solution'
import {RouteComponentProps, Link} from "react-router-dom"
import Task from './Task'
import Typography from '@material-ui/core/Typography'
import AddSolution from './AddSolution'
import Button from '@material-ui/core/Button'
import TaskSolutions from './TaskSolutions'
import { TasksApi, HomeworksApi } from '../api/homeworks';

interface ITaskSolutionsProps {
    taskId: string,
    studentId: string
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solutions: number[],
    addSolution: boolean,
    courseId: number
}

export default class TaskSolutionsPage extends React.Component<RouteComponentProps<ITaskSolutionsProps>, ITaskSolutionsState> {
    constructor(props: RouteComponentProps<ITaskSolutionsProps>) {
        super(props);
        this.state = {
            isLoaded: false,
            solutions: [],
            addSolution: false,
            courseId: 0
        };
    }

    public render() {
        const { isLoaded, solutions } = this.state;


        if (isLoaded) {
            return (
                <div>
                    &nbsp; <Link to={'/courses/' + this.state.courseId.toString()}>Назад к курсу</Link>
                    <br />
                    <br />
                    <div className="container">
                        <Task forStudent={false} id={+this.props.match.params.taskId} forMentor={false} onDeleteClick={() => 3} />
                        {(!this.state.addSolution) && 
                            <div>
                                <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => { this.setState({addSolution: true })}}>Добавить решение</Button>
                                <br />
                                <TaskSolutions taskId={+this.props.match.params.taskId} studentId={this.props.match.params.studentId} />
                            </div>
                        }
                        {this.state.addSolution && 
                            <div>
                                <AddSolution
                                id={+this.props.match.params.taskId}
                                onAdding={() => this.setState({addSolution: false})}
                                onCancel={() => this.setState({addSolution: false})} />
                                <br />
                                <TaskSolutions taskId={+this.props.match.params.taskId} studentId={this.props.match.params.studentId} />
                            </div>
                        }
                        <br />
                        
                    </div>
                </div>
            )
        }

        return ""
    }

    componentDidMount() {
        let solutionsApi = new SolutionsApi();
        let tasksApi = new TasksApi();
        let homeworksApi = new HomeworksApi();

        solutionsApi.getTaskSolutionsFromStudent(+this.props.match.params.taskId, this.props.match.params.studentId)
            .then(ids => tasksApi.getTask(+this.props.match.params.taskId)
                .then(res => res.json())
                .then(task => homeworksApi.getHomework(task.homeworkId)
                    .then(res => res.json())
                    .then(homework => this.setState({
                        isLoaded: true,
                        solutions: ids,
                        courseId: homework.courseId
                    }))));
    }
}