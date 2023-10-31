import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import TaskSolutionComponent from "./TaskSolutionComponent";
import {AccountDataDto, GetSolutionModel, HomeworkTaskViewModel, Solution} from '../../api';
import {Grid, Tab, Tabs} from "@material-ui/core";
import {Chip, Divider, Stack, Tooltip} from "@mui/material";
import Utils from "../../services/Utils";
import StudentStatsUtils from "../../services/StudentStatsUtils";

interface ITaskSolutionsProps {
    task: HomeworkTaskViewModel
    solutions: GetSolutionModel[]
    student: AccountDataDto
    forMentor: boolean
    onSolutionRateClick?: () => void
}

interface ITaskSolutionsState {
    tabValue: number
}

const TaskSolutions: FC<ITaskSolutionsProps> = (props) => {
    const [state, setState] = useState<ITaskSolutionsState>({
        tabValue: 0
    })

    const onSolutionRateClick = async () => {
        props.onSolutionRateClick?.()
    }

    useEffect(() => setState({tabValue: 0}), [props.student.userId, props.task.id])

    const {tabValue} = state
    const {solutions, student, forMentor, task} = props
    const lastSolution = solutions[solutions.length - 1]
    const arrayOfRatedSolutions = solutions.slice(0, solutions.length - 1)
    const previousSolution = arrayOfRatedSolutions && arrayOfRatedSolutions[arrayOfRatedSolutions.length - 1]
    const lastRating = previousSolution && previousSolution.state !== Solution.StateEnum.NUMBER_0 // != Posted
        ? previousSolution.rating
        : undefined

    const renderSolutionsRate = () => {
        const ratedSolutions = solutions
            .filter(x => x.state !== Solution.StateEnum.NUMBER_0)
            .map(x => ({
                publicationTime: new Date(x.publicationDate!),
                rating: x.rating,
                color: StudentStatsUtils.getRatingColor(x.rating!, task.maxRating!)
            }))

        if (ratedSolutions.length === 0) return null
        const lastSolution = ratedSolutions[ratedSolutions.length - 1]

        const startDate = new Date(props.task.publicationDate!)
        const total = lastSolution.publicationTime.getTime() - startDate.getTime()

        const tooltip = <div>
            {Utils.renderReadableDate(startDate)} — Задача опубликована
            <br/>
            <br/>
            <Stack direction={"column"} spacing={1}>
                {ratedSolutions.map(x =>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Chip
                            label={x.rating}
                            size={"small"}
                            style={{backgroundColor: x.color, marginRight: 3}}
                        />
                        {" — " + Utils.renderReadableDate(x.publicationTime)}
                    </Stack>)}
            </Stack>
        </div>

        return <Tooltip arrow title={tooltip}>
            <Stack direction={"row"}>
                {ratedSolutions
                    .map(({publicationTime, rating, color}, i) => {
                        let offset = i === 0
                            ? publicationTime.getTime() - startDate.getTime()
                            : publicationTime.getTime() - ratedSolutions[i - 1].publicationTime.getTime()
                        return <div style={{height: 10, width: `${offset * 100 / total}%`, backgroundColor: color}}/>
                    })}
            </Stack>
        </Tooltip>
    }

    return <Grid container alignItems="stretch" direction="column">
        {renderSolutionsRate()}
        <Tabs
            value={tabValue}
            style={{marginTop: 3}}
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
            {lastSolution || forMentor
                ? <TaskSolutionComponent
                    task={props.task}
                    forMentor={forMentor}
                    solution={lastSolution!}
                    student={student!}
                    isExpanded={true}
                    lastRating={lastRating}
                    onRateSolutionClick={onSolutionRateClick}
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
                        onRateSolutionClick={onSolutionRateClick}
                    />
                    {i < arrayOfRatedSolutions.length - 1 ?
                        <Divider style={{marginTop: 10, marginBottom: 4}}/> : null}
                </Grid>)}
    </Grid>
}

export default TaskSolutions
