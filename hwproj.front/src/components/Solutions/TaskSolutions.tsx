import * as React from 'react';
import SolutionComponent from './Solution'
import NonRatedSolutionComponent from "./NonRatedSolutions";
import RatedSolutionComponent from "./RatedSolutions"
import Typography from '@material-ui/core/Typography'
import ApiSingleton from "../../api/ApiSingleton";
import {Solution} from '../../api';
import {ListItem, Grid, Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core";
import List from "@material-ui/core/List";
import {FC, useEffect, useState} from "react";

interface ITaskSolutionsProps {
    taskId: number,
    studentId: string,
    forMentor: boolean
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    solutions: Solution[],
}

const TaskSolutions: FC<ITaskSolutionsProps> = (props) => {

    const [taskSolutions, setTaskSolutions] = useState<ITaskSolutionsState>({
        isLoaded: false,
        solutions:[],
    })

    useEffect(() => {
        getSolutions()
    }, [])

    const getSolutions = async () => {
        const solutions = await ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(
            props.taskId,
            props.studentId
        )
        debugger
        setTaskSolutions({
            isLoaded: true,
            solutions: solutions
        })
    }

    const {isLoaded, solutions} = taskSolutions
    const arrayOfNonRatedSolutions = solutions.filter(solution => solution.state!.toString() === 'Posted')
    const arrayOfRatedSolutions = solutions.filter(solution => solution.state!.toString() !== 'Posted')
    const componentsOfNonRatedSolutions = arrayOfNonRatedSolutions.map((sol) => (
            <Grid item style={{ marginTop: '16px' }}>
                <NonRatedSolutionComponent
                    forMentor={props.forMentor}
                    solution={sol}
                    isExpanded={true}
                />
            </Grid>
        )
    ).reverse()

    const componentsOfRatedSolutions = arrayOfRatedSolutions.map((sol) => (
            <Grid item style={{ marginTop: '16px' }}>
                <RatedSolutionComponent forMentor={props.forMentor} solution={sol}/>
            </Grid>
        )
    ).reverse()

    if (isLoaded) {
        return (
            <Grid container alignItems="stretch" direction="column">
                {arrayOfNonRatedSolutions.length > 0 &&
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
                }
                {arrayOfRatedSolutions.length > 0 &&
                <Grid item style={{ marginTop: '16px' }}>
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
                }
            </Grid>
        )
    }

    return (
        <div>

        </div>
    )
}

export default TaskSolutions