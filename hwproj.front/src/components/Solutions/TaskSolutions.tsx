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
import {Box, Grid, Tab, Tabs} from "@mui/material";
import {Chip, Stack, Tooltip} from "@mui/material";
import Utils from "../../services/Utils";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {QuestionMark} from "@mui/icons-material";
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TaskQuestions from "../Tasks/TaskQuestions";
import ApiSingleton from "../../api/ApiSingleton";
import {DotLottieReact} from '@lottiefiles/dotlottie-react';
import {PanelConnector} from "@/components/Common/PanelConnector";

// Вкладки — segmented control вместо подчёркивания: страница и так набрана карточками, поэтому
// переключатель не заводит свою панель, а занимает ровно свою ширину на скруглённой дорожке
const tabsTrackSx = {
    alignSelf: "flex-start",
    // Тот же зазор, что между решением и оценкой: условие задачи, вкладки и содержимое стоят
    // в одном ритме, а вкладки больше не приклеены к карточке задачи
    mt: 2.5,
    maxWidth: "100%",
    p: 0.5,
    borderRadius: "999px",
    backgroundColor: "#f1f3fb",
    border: "1px solid #e3e6f3",
}

const tabsSx = {
    minHeight: 0,
    "& .MuiTabs-indicator": {display: "none"},
    "& .MuiTabs-scrollButtons": {width: 26},
    // Скроллер режет содержимое по своим краям, иначе тень активной «таблетки» обрезается
    "& .MuiTabs-scroller": {py: "3px", my: "-3px"},
    "& .MuiTab-root": {
        minHeight: 34,
        minWidth: 0,
        mx: 0.25,
        px: 1.75,
        py: 0,
        borderRadius: "999px",
        textTransform: "none",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "text.secondary",
        transition: "background-color .15s, color .15s, box-shadow .15s",
        "& .MuiTab-iconWrapper": {fontSize: 17, mr: 0.75},
        "&:hover": {color: "#3f51b5", backgroundColor: "rgba(63,81,181,0.07)"},
        // Активная вкладка — приподнятая белая «таблетка»: видно даже боковым зрением
        "&.Mui-selected": {
            color: "#3f51b5",
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px rgba(20,28,58,0.12)",
        },
    },
}

const tabLabelSx = {
    display: "inline-flex",
    alignItems: "center",
}

// Счётчик внутри вкладки: акцентный, когда есть что разобрать, зелёный — когда всё разобрано,
// и спокойный для обычного количества
const countPillSx = (tone: "accent" | "success" | "muted") => ({
    height: 18,
    minWidth: 18,
    px: 0.5,
    ml: 0.875,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    fontSize: "0.6875rem",
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums" as const,
    ...(tone === "accent" && {backgroundColor: "#3f51b5", color: "#fff"}),
    ...(tone === "success" && {backgroundColor: "#dcefe0", color: "#2e7d32"}),
    ...(tone === "muted" && {backgroundColor: "#dfe3f0", color: "#5b6472"}),
})

interface ITaskSolutionsProps {
    courseId: number
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
    const sortedSolutions = [...solutions].sort((a, b) => {
        const da = new Date(a.ratingDate || a.publicationDate!).getTime();
        const db = new Date(b.ratingDate || b.publicationDate!).getTime();
        return da - db;
    });
    const lastSolution = sortedSolutions[sortedSolutions.length - 1]
    const arrayOfRatedSolutions = sortedSolutions.slice(0, solutions.length - 1)
    const previousSolution = arrayOfRatedSolutions && arrayOfRatedSolutions[arrayOfRatedSolutions.length - 1]
    const lastRating = previousSolution && previousSolution.state !== SolutionState.NUMBER_0 // != Posted
        ? previousSolution.rating
        : undefined

    const newQuestions = questionsState.filter(x => x.answer === null).length

    // Значения вкладок заданы явно, поэтому набор вкладок можно менять, не сдвигая нумерацию.
    // Если выбранной вкладки в этом наборе нет (решений не осталось), падаем на вопросы
    const hasLastSolutionTab = student !== undefined
    const hasPreviousAttemptsTab = arrayOfRatedSolutions.length > 0
    const activeTab = (tabValue === 1 && !hasLastSolutionTab) || (tabValue === 2 && !hasPreviousAttemptsTab)
        ? 0
        : tabValue

    const renderSolutionsRate = () => {
        const ratedSolutions = sortedSolutions
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
        {/*{renderSolutionsRate()}*/}
        <Box sx={tabsTrackSx}>
            <Tabs
                variant="scrollable"
                scrollButtons={"auto"}
                value={activeTab}
                sx={tabsSx}
                onChange={(event, value) => {
                    setState(prevState => ({
                        ...prevState,
                        tabValue: value
                    }));
                }}
            >
                {/* Вкладка вопросов раньше была безымянной иконкой с точкой — теперь у неё
                    подпись и число: сразу видно, сколько вопросов ждёт ответа */}
                <Tab
                    value={0}
                    icon={<QuestionMark/>}
                    iconPosition={"start"}
                    title={newQuestions > 0
                        ? `${newQuestions} без ответа`
                        : questionsState.length > 0 ? "Все вопросы разобраны" : "Вопросов пока нет"}
                    label={<Box component={"span"} sx={tabLabelSx}>
                        Вопросы
                        {questionsState.length > 0 &&
                            <Box component={"span"} sx={countPillSx(newQuestions > 0 ? "accent" : "success")}>
                                {newQuestions > 0 ? newQuestions : questionsState.length}
                            </Box>}
                    </Box>}/>
                {hasLastSolutionTab &&
                    <Tab
                        value={1}
                        icon={<AssignmentTurnedInOutlinedIcon/>}
                        iconPosition={"start"}
                        label={"Последнее решение"}/>}
                {hasPreviousAttemptsTab &&
                    <Tab
                        value={2}
                        icon={<HistoryRoundedIcon/>}
                        iconPosition={"start"}
                        label={<Box component={"span"} sx={tabLabelSx}>
                            Предыдущие попытки
                            <Box component={"span"} sx={countPillSx("muted")}>
                                {arrayOfRatedSolutions.length}
                            </Box>
                        </Box>}/>}
            </Tabs>
        </Box>
        {/* Содержимое вкладки — продолжение переключателя, поэтому та же перемычка, что между
            решением и оценкой: она же задаёт зазор, своих отступов панелям не нужно */}
        <PanelConnector from={"#dfe3f2"}/>
        {activeTab === 0 && <Grid item>
            <TaskQuestions forMentor={forMentor}
                           taskId={task.id!}
                           courseStudents={props.courseStudents}
                           questions={questionsState} onChange={getQuestions}/>
        </Grid>}
        {activeTab === 1 && <Grid item>
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
                    isProcessing={lastSolution && (props.processingFiles[lastSolution.id!]?.isLoading || false)}
                />
                : <div>
                    Студент не отправил ни одного решения.
                    <DotLottieReact
                        src="https://lottie.host/cb0117df-e436-4d54-9d0b-aa2289732d29/enJE7uM1Dw.lottie"
                        loop
                        autoplay
                    />
                </div>}
        </Grid>}
        {activeTab === 2 &&
            <Grid item>
                {/* Карточки решений сами обведены рамкой, поэтому разделители между ними не нужны */}
                <Stack direction={"column"} spacing={2}>
                    {[...arrayOfRatedSolutions].reverse().map(x =>
                        <TaskSolutionComponent
                            key={x.id}
                            task={props.task}
                            forMentor={false}
                            solution={x}
                            student={student!}
                            onRateSolutionClick={onSolutionRateClick}
                            isLastSolution={false}
                            courseId={props.courseId}
                            courseFilesInfo={props.courseFiles}
                            isProcessing={props.processingFiles[x.id!]?.isLoading || false}
                        />)}
                </Stack>
            </Grid>}
    </Grid>
}

export default TaskSolutions
