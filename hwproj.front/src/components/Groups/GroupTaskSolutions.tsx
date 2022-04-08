import * as React from 'react';
import Typography from '@material-ui/core/Typography'
import ApiSingleton from "../../api/ApiSingleton";
import {Solution} from '../../api';
import {ListItem, Grid, Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core";
import List from "@material-ui/core/List";
import {FC, useEffect, useState} from "react";
import RatedSolutionComponent from "../Solutions/RatedSolutions";
import NonRatedSolutionComponent from "../Solutions/NonRatedSolutions";

interface IGroupTaskSolutionsProps {
    taskId: number,
    groupId: number,
    userId: string,
    forMentor: boolean,
    maxRating: number,
}

interface IGroupTaskSolutionsState {
    isLoaded: boolean,
    solutions: Solution[]
}

const GroupTaskSolutions: FC<IGroupTaskSolutionsProps> = (props) => {

    const [taskSolutions, setTaskSolutions] = useState<IGroupTaskSolutionsState>({
        isLoaded: false,
        solutions:[],
    });

    useEffect(() => {
        getSolutions()
    }, []);

    const getSolutions = async () => {
        const solutions = await ApiSingleton.solutionsApi.apiSolutionsByGroupIdTaskSolutionsByTaskIdGet(
            props.groupId,
            props.taskId
        );

        setTaskSolutions({
            isLoaded: true,
            solutions: solutions
        });
    };

    const {isLoaded, solutions} = taskSolutions
    const arrayOfNonRatedSolutions = solutions.filter(solution => solution.state!.toString() === 'Posted')
    const arrayOfRatedSolutions = solutions.filter(solution => solution.state!.toString() !== 'Posted')
    const componentsOfNonRatedSolutions = arrayOfNonRatedSolutions.map((sol) => (
            <Grid item style={{marginTop: '16px'}}>
                <NonRatedSolutionComponent
                    forMentor={props.forMentor}
                    solution={sol}
                    isExpanded={true}
                    maxRating={props.maxRating}
                />
            </Grid>
        )
    ).reverse();

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

export default GroupTaskSolutions