import * as React from 'react';
import {SolutionsApi} from '../api/solutions/api'
import SolutionComponent from './Solution'
import {RouteComponentProps} from "react-router-dom"

interface ITaskSolutionsProps {
    taskId: string,
    studentId: string
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solutions: number[]
}

export default class TaskSolutions extends React.Component<RouteComponentProps<ITaskSolutionsProps>, ITaskSolutionsState> {
    constructor(props: RouteComponentProps<ITaskSolutionsProps>) {
        super(props);
        this.state = {
            isLoaded: false,
            solutions: []
        };
    }

    public render() {
        const { isLoaded, solutions } = this.state;

        if (isLoaded) {
            let solutionList = solutions.map(id => <li key={id}>
                <SolutionComponent id={id} />
            </li>)

            return (<ol>{solutionList}</ol>)
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