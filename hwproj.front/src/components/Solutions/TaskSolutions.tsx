import * as React from 'react';
import SolutionComponent from './Solution'
import NonRatedSolutionComponent from "./NonRatedSolutions";
import  RatedSolutionComponent from "./RatedSolutions"
import Typography from '@material-ui/core/Typography'
import ApiSingleton from "../../api/ApiSingleton";
import {Solution} from '../../api';
import {ListItem, Grid, Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core";
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
            <Grid item>
                <NonRatedSolutionComponent
                    forMentor={this.props.forMentor}
                    solution={sol}
                    isExpanded={true}
                />
            </Grid>
            )
        ).reverse()
        const componentsOfRatedSolutions = arrayOfRatedSolutions.map((sol) => (
            <Grid item>
                <RatedSolutionComponent forMentor={this.props.forMentor} solution={sol}/>
            </Grid>
            )
        ).reverse()
        debugger
        if (isLoaded) {
            return (
                <Grid container alignItems="stretch" direction="column">
                    <Grid item>
                        <Accordion>
                            <AccordionSummary
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                style={{backgroundColor: "#c6cceb"}}
                            >
                                <Typography>
                                    Непроверенные решения
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container direction="column" alignItems="stretch">
                                    {componentsOfNonRatedSolutions}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid item>
                        <Accordion>
                            <AccordionSummary
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                style={{backgroundColor: "#c6cceb"}}
                            >
                                <Typography>
                                    Проверенные решения
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container direction="column" alignItems="stretch">
                                    {componentsOfRatedSolutions}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
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