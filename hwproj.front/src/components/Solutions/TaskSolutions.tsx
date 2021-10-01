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
    homeworkId: number,
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

        if (isLoaded) {
            let solutionList = solutions.map(s => <li key={s.id}>
                <SolutionComponent forMentor={this.props.forMentor} solution={s} />
            </li>)

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
        const courseId = (await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(this.props.homeworkId)).courseId
        const groupId = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetStudentGroupGet(courseId!)
        if (groupId == -1) {
            const solutions = await ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(
                this.props.taskId,
                this.props.studentId,
            )

            this.setState({
                isLoaded: true,
                solutions: solutions
            })
        }
        else {
            const groupSolutions = await ApiSingleton.solutionsApi.apiSolutionsByGroupIdTaskSolutionsByTaskIdGet(
                groupId,
                this.props.taskId,
            )
            this.setState({
                isLoaded: true,
                solutions: groupSolutions.filter(s => s.taskId == this.props.taskId)
            })
        }
    }
}