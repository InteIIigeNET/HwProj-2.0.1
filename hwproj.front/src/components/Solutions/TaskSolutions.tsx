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
        const startTime = startDate.getTime()
        const deadline = props.task.deadlineDate && new Date(props.task.deadlineDate)
        const deadlineTime = deadline && new Date(deadline).getTime()
        const endTime = lastSolution.publicationTime.getTime()
        const total = endTime - startTime
        const totalPercent = deadlineTime && deadlineTime < endTime ? 99 : 100

        const tooltip = <div style={{fontSize: 13}}>
            {Utils.renderReadableDate(startDate)} — Задача опубликована
            <br/>
            <br/>
            <Stack direction={"column"} spacing={1}>
                {ratedSolutions.map(({color, publicationTime, rating}, i) => {
                    const previousTime = i === 0
                        ? startTime
                        : ratedSolutions[i - 1].publicationTime.getTime()
                    const currentTime = publicationTime.getTime()
                    const element = <Stack direction={"row"} alignItems={"center"}>
                        <Chip
                            label={rating}
                            size={"small"}
                            style={{backgroundColor: color, marginRight: 3, color: "white"}}
                        />
                        {" — " + Utils.renderReadableDate(publicationTime)}
                    </Stack>
                    return deadlineTime && deadlineTime >= previousTime && deadlineTime <= currentTime
                        ? [<div>{Utils.renderReadableDate(deadline!)} — Дедлайн</div>, element]
                        : element;
                })}
            </Stack>
        </div>

        return <Tooltip arrow title={tooltip}>
            <Stack direction={"row"}>
                {ratedSolutions
                    .map(({publicationTime, rating, color}, i) => {
                        const previousTime = i === 0
                            ? startTime
                            : ratedSolutions[i - 1].publicationTime.getTime()
                        const currentTime = publicationTime.getTime()

                        return deadlineTime && deadlineTime > previousTime && deadlineTime < currentTime
                            ? [<div style={{
                                height: 10,
                                width: `${(deadlineTime - previousTime) * totalPercent / total}%`,
                                backgroundColor: color
                            }}/>,
                                <div style={{height: 10, width: `${100 - totalPercent}%`, backgroundColor: "black"}}/>,
                                <div style={{
                                    height: 10,
                                    width: `${(currentTime - deadlineTime) * totalPercent / total}%`,
                                    backgroundColor: color
                                }}/>]
                            : <div style={{
                                height: 10,
                                width: `${(currentTime - previousTime) * totalPercent / total}%`,
                                backgroundColor: color
                            }}/>;
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
