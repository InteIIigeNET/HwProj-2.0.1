import * as React from 'react';
import SolutionComponent from './Solution'
import NonRatedSolutionComponent from "./NonRatedSolutions";
import Typography from '@material-ui/core/Typography'
import ApiSingleton from "../../api/ApiSingleton";
import {Solution} from '../../api';
import {ListItem} from "@material-ui/core";
import List from "@material-ui/core/List";

interface ITaskSolutionsProps {
    taskId: number,
    studentId: string,
    forMentor: boolean
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solutions: Solution[],
}

export default class TaskSolutions extends React.Component<ITaskSolutionsProps, ITaskSolutionsState> {
    constructor(props : ITaskSolutionsProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solutions:[],
        }
    }

    public render() {
        const { isLoaded, solutions } = this.state;
        const arrayOfNonRatedSolutions = solutions.filter(solution => solution.state!.toString() == 'Posted');
        const arrayOfRatedSolutions = solutions.filter(solution => solution.state!.toString() != 'Posted');
        const componentsOfNonRatedSolutions = arrayOfNonRatedSolutions.map((sol) => (
            <ListItem key={sol.id}>
                <SolutionComponent forMentor={this.props.forMentor} solution={sol}/>
            </ListItem>
            )
        ).reverse()
        const componentsOfRatedSolutions = arrayOfRatedSolutions.map((sol) => (
                <ListItem key={sol.id}>
                    <SolutionComponent forMentor={this.props.forMentor} solution={sol}/>
                </ListItem>
            )
        ).reverse()
        debugger
        if (isLoaded) {
            return (
                <div>
                    <Typography variant="h6">
                        Непроверенные решения
                    </Typography>
                    <List>
                        {componentsOfNonRatedSolutions}
                    </List>
                    <Typography variant="h6">
                        Проверенные решения
                    </Typography>
                    <List>
                        {componentsOfRatedSolutions}
                    </List>
                </div>
            )
        }

        return "";
    }

    async componentDidMount() {
        const solutions = await ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(
            this.props.taskId,
            this.props.studentId,
        )
        this.setState({
            isLoaded: true,
            solutions: solutions
        })
        debugger
    }
}