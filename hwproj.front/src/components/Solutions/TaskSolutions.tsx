import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import TaskSolutionComponent from "./TaskSolutionComponent";
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto, HomeworkTaskViewModel, Solution} from '../../api';
import {Grid, Tab, Tabs} from "@material-ui/core";
import {Divider} from "@mui/material";

interface ITaskSolutionsProps {
    task: HomeworkTaskViewModel,
    studentId: string,
    forMentor: boolean,
    onSolutionRateClick?: () => void
}

interface ITaskSolutionsState {
    isLoaded: boolean,
    tabValue: number
    solutions: Solution[],
    student: AccountDataDto | undefined,
}

const TaskSolutions: FC<ITaskSolutionsProps> = (props) => {

    const [state, setState] = useState<ITaskSolutionsState>({
        isLoaded: false,
        tabValue: 0,
        solutions: [],
        student: undefined
    })

    useEffect(() => {
        getSolutions()
    }, [])

    const getSolutions = async () => {
        const userTaskSolutions = await ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(
            props.task.id!,
            props.studentId
        )
        setState(prevState => ({
            isLoaded: true,
            solutions: userTaskSolutions.solutions!,
            student: userTaskSolutions.user!,
            tabValue: prevState.tabValue
        }))
    }

    const {isLoaded, solutions, tabValue, student} = state
    const lastSolution = solutions[solutions.length - 1]
    const arrayOfRatedSolutions = solutions.slice(0, solutions.length - 1)
    const lastRating = arrayOfRatedSolutions
        ? arrayOfRatedSolutions[arrayOfRatedSolutions.length - 1]?.rating
        : undefined

    if (!isLoaded) return <div></div>
    return <Grid container alignItems="stretch" direction="column">
        <Tabs
            value={tabValue}
            style={{marginTop: 15}}
            indicatorColor="primary"
            onChange={(event, value) => {
                setState(prevState => ({
                    ...prevState,
                    tabValue: value
                }));
            }}
        >
            <Tab label="Последнее решение"/>
            {arrayOfRatedSolutions.length > 0 && <Tab label="Предыдущие попытки"/>}
        </Tabs>
        {tabValue === 0 && <Grid item style={{marginTop: '16px'}}>
            {lastSolution
                ? <TaskSolutionComponent
                    task={props.task}
                    forMentor={props.forMentor}
                    solution={lastSolution!}
                    student={student!}
                    isExpanded={true}
                    lastRating={lastRating}
                    onRateSolutionClick={props.onSolutionRateClick}
                />
                : "Студент не отправил ни одного решения."}
        </Grid>}
        {tabValue === 1 &&
            arrayOfRatedSolutions.reverse().map((x, i) =>
                <Grid item style={{marginTop: '16px'}}>
                    <TaskSolutionComponent
                        task={props.task}
                        forMentor={false}
                        solution={x}
                        student={student!}
                        isExpanded={true}
                        onRateSolutionClick={props.onSolutionRateClick}
                    />
                    {i < arrayOfRatedSolutions.length - 1 ?
                        <Divider style={{marginTop: 10, marginBottom: 4}}/> : null}
                </Grid>)}
    </Grid>
}

export default TaskSolutions
