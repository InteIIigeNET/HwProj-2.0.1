import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import TaskSolutionComponent from "./TaskSolutionComponent";
import {
    FileInfoDTO,
    GetSolutionModel,
    GetTaskQuestionDto,
    HomeworkTaskViewModel,
    SolutionState, StudentDataDto
} from '@/api';
import {Grid, Tab, Tabs} from "@material-ui/core";
import {Chip, Divider, Stack, Tooltip, Badge} from "@mui/material";
import Utils from "../../services/Utils";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {QuestionMark} from "@mui/icons-material";
import TaskQuestions from "../Tasks/TaskQuestions";
import ApiSingleton from "../../api/ApiSingleton";
import {DotLottieReact} from '@lottiefiles/dotlottie-react';

interface ITaskSolutionsProps {
    courseId: number,
    task: HomeworkTaskViewModel
    solutions: GetSolutionModel[]
    student: StudentDataDto | undefined
    courseStudents: StudentDataDto[]
    forMentor: boolean
    onSolutionRateClick?: () => void
    courseFiles: FileInfoDTO[]
    processingFiles: {
        [solutionId: number]: {
            isLoading: boolean;
        }
    };
}

interface ITaskSolutionsState {
    tabValue: number
}

const TaskSolutions: FC<ITaskSolutionsProps> = (props) => {
    const [state, setState] = useState<ITaskSolutionsState>({
        tabValue: 1
    })

    const onSolutionRateClick = async () => {
        props.onSolutionRateClick?.()
    }

    const [questionsState, setQuestionsState] = useState<GetTaskQuestionDto[]>([])

    const getQuestions = async () => {
        const questions = await ApiSingleton.tasksApi.tasksGetQuestionsForTask(props.task.id!)
        setQuestionsState(questions.reverse())
    }

    useEffect(() => {
        setState({tabValue: props.student == null ? 0 : 1})
    }, [props.student?.userId, props.task.id])

    useEffect(() => {
        getQuestions()
    }, [props.task.id]);

    const {tabValue} = state
    const {solutions, student, forMentor, task} = props
    const lastSolution = solutions[solutions.length - 1]
    const arrayOfRatedSolutions = solutions.slice(0, solutions.length - 1)
    const previousSolution = arrayOfRatedSolutions && arrayOfRatedSolutions[arrayOfRatedSolutions.length - 1]
    const lastRating = previousSolution && previousSolution.state !== SolutionState.NUMBER_0 // != Posted
        ? previousSolution.rating
        : undefined

    const newQuestions = questionsState.filter(x => x.answer === null).length

    const renderSolutionsRate = () => {
        const ratedSolutions = solutions
            .filter(x => x.state !== SolutionState.NUMBER_0)
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
                    const element = <Stack key={i} direction={"row"} alignItems={"center"}>
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
            variant="scrollable"
            scrollButtons={"auto"}
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
            <Tab style={{minWidth: 3}} textColor={"primary"}
                 label={<Badge badgeContent={newQuestions} variant="dot" showZero={questionsState.length > 0}
                               color={newQuestions === 0 ? "success" : "primary"}>
                     <QuestionMark style={{fontSize: 15}}/>
                 </Badge>}/>
            {student !== undefined && <Tab label="Последнее решение"/>}
            {arrayOfRatedSolutions.length > 0 && <Tab label={
                <Stack direction="row" spacing={1}>
                    <div>Предыдущие попытки</div>
                    <Chip size={"small"}
                          color={"default"}
                          label={(arrayOfRatedSolutions.length)}/>
                </Stack>}/>}
        </Tabs>
        {tabValue === 0 && <Grid item style={{marginTop: '5px'}}>
            <TaskQuestions forMentor={forMentor}
                           taskId={task.id!}
                           courseStudents={props.courseStudents}
                           questions={questionsState} onChange={getQuestions}/>
        </Grid>}
        {tabValue === 1 && <Grid item style={{marginTop: '16px'}}>
            {(lastSolution || forMentor) && student !== undefined
                ? <TaskSolutionComponent
                    task={props.task}
                    forMentor={forMentor}
                    solution={lastSolution!}
                    student={student}
                    lastRating={lastRating}
                    onRateSolutionClick={onSolutionRateClick}
                    isLastSolution={true}
                    courseId={props.courseId}
                    courseFilesInfo={props.courseFiles}
                    isProcessing={props.processingFiles[lastSolution.id!]?.isLoading || false}/>
                : <div>
                    Студент не отправил ни одного решения.
                    <DotLottieReact
                        src="https://lottie.host/cb0117df-e436-4d54-9d0b-aa2289732d29/enJE7uM1Dw.lottie"
                        loop
                        autoplay
                    />
                </div>}
        </Grid>}
        {tabValue === 2 &&
            arrayOfRatedSolutions.reverse().map((x, i) =>
                <Grid key={x.id} item style={{marginTop: '16px'}}>
                    <TaskSolutionComponent
                        task={props.task}
                        forMentor={false}
                        solution={x}
                        student={student!}
                        onRateSolutionClick={onSolutionRateClick}
                        isLastSolution={false}
                        courseId={props.courseId}
                        courseFilesInfo={props.courseFiles}
                        isProcessing={props.processingFiles[x.id!]?.isLoading || false}/>
                    {i < arrayOfRatedSolutions.length - 1 ?
                        <Divider style={{marginTop: 10, marginBottom: 4}}/> : null}
                </Grid>)}
    </Grid>
}

export default TaskSolutions
