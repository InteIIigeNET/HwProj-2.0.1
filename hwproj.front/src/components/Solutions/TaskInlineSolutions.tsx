import * as React from "react";
import {FC, useEffect, useState} from "react";
import {
    AccountDataDto,
    GetSolutionModel,
    GetTaskQuestionDto,
    HomeworkTaskViewModel,
    SolutionState,
} from "@/api";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ApiSingleton from "../../api/ApiSingleton";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";
import TaskSolutionComponent from "./TaskSolutionComponent";
import AddOrEditSolution from "./AddOrEditSolution";
import TaskQuestions from "../Tasks/TaskQuestions";

// Оформление согласовано с редизайном: те же скруглённые панели, мягкие шапки и рамки,
// что на странице курса и в блоке вопросов
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const panelHeaderSx = {
    px: 1.5,
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const headerChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const actionButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    fontWeight: 500,
    flexShrink: 0,
}

const accordionSx = {
    border: "1px solid #e0e3e7",
    borderRadius: "12px !important",
    overflow: "hidden",
    "&:before": {display: "none"},
    "&.Mui-expanded": {margin: 0, borderColor: "#a8b0d8"},
}

const accordionSummarySx = {
    backgroundColor: "#f7f8fd",
    minHeight: 48,
    "& .MuiAccordionSummary-content": {my: 1, alignItems: "center"},
}

const ratingChipSx = {
    height: 22,
    minWidth: 30,
    flexShrink: 0,
    fontWeight: 500,
    "& .MuiChip-label": {px: 0.75},
}

const emptyStateSx = {
    py: 2.5,
    px: 2,
    textAlign: "center" as const,
    color: "text.secondary",
}

interface ITaskInlineSolutionsProps {
    courseId: number
    task: HomeworkTaskViewModel
    userId: string
    courseMates: AccountDataDto[]
}

const renderDateTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleString("ru-RU", {day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"})
}

const TaskInlineSolutions: FC<ITaskInlineSolutionsProps> = (props) => {
    const {courseId, task, userId, courseMates} = props
    const student = courseMates.find(x => x.userId === userId)

    const [solutions, setSolutions] = useState<GetSolutionModel[]>([])
    const [questions, setQuestions] = useState<GetTaskQuestionDto[]>([])
    const [addSolution, setAddSolution] = useState(false)
    const [expandedPanel, setExpandedPanel] = useState<number | false>(false)

    const {
        courseFilesState,
        updateCourseUnitFiles,
    } = FilesUploadWaiter(courseId, CourseUnitType.Solution, false)

    const getSolutions = async () => {
        const pageData = await ApiSingleton.solutionsApi.solutionsGetStudentSolution(task.id!, userId)
        const taskSolutions = (pageData.taskSolutions ?? [])
            .flatMap(x => x.homeworkSolutions ?? [])
            .flatMap(x => x?.studentSolutions ?? [])
            .filter(x => Number(x?.taskId) === task.id)
            .flatMap(x => x?.solutions ?? [])
        taskSolutions.sort((a, b) =>
            new Date(a.publicationDate!).getTime() - new Date(b.publicationDate!).getTime())
        setSolutions(taskSolutions)
        // По умолчанию раскрыто последнее решение
        setExpandedPanel(taskSolutions.length > 0 ? taskSolutions.length - 1 : false)
        setAddSolution(false)
    }

    const getQuestions = async () => {
        const data = await ApiSingleton.tasksApi.tasksGetQuestionsForTask(task.id!)
        setQuestions(data.reverse())
    }

    useEffect(() => {
        setAddSolution(false)
        getSolutions()
        getQuestions()
    }, [task.id])

    const lastSolution = solutions[solutions.length - 1]
    const isEdit = lastSolution?.state === SolutionState.NUMBER_0

    const renderSolutionRating = (solution: GetSolutionModel) => {
        const rating = solution.ratingDate == null ? "?" : solution.rating
        const color = rating === "?"
            ? "#c0c3cf"
            : StudentStatsUtils.getCellBackgroundColor(solution.state, solution.rating, task.maxRating!, false)
        return <Chip size={"small"} label={rating} sx={{...ratingChipSx, backgroundColor: color}}/>
    }

    return <Stack direction={"column"} spacing={2}>
        <Paper variant={"outlined"} sx={panelSx}>
            <Stack direction={"row"} alignItems={"center"} spacing={1} sx={panelHeaderSx}>
                <AssignmentTurnedInOutlinedIcon fontSize={"small"}/>
                <Typography variant={"body2"} sx={{fontWeight: 500}}>Решения</Typography>
                <Chip size={"small"} label={solutions.length} sx={headerChipSx}/>
                <Box sx={{flexGrow: 1}}/>
                {task.canSendSolution && <Button
                    size={"small"}
                    variant={"contained"}
                    color={"primary"}
                    disableElevation
                    startIcon={isEdit ? <EditOutlinedIcon/> : <AddCircleOutlineIcon/>}
                    sx={actionButtonSx}
                    onClick={() => setAddSolution(true)}
                >
                    {isEdit ? "Изменить решение" : "Добавить решение"}
                </Button>}
            </Stack>
            <Divider/>
            <Box sx={{p: 1.5}}>
                {addSolution
                    ? <AddOrEditSolution
                        courseId={courseId}
                        userId={userId}
                        task={task}
                        onAdd={getSolutions}
                        onCancel={() => setAddSolution(false)}
                        lastSolution={lastSolution}
                        students={courseMates}
                        supportsGroup={task.isGroupWork!}
                        courseFilesInfo={courseFilesState.courseFiles}
                        onStartProcessing={updateCourseUnitFiles}
                    />
                    : solutions.length === 0
                        ? <Typography variant={"body2"} sx={emptyStateSx}>
                            Вы ещё не отправляли решения по этой задаче.
                        </Typography>
                        : <Stack direction={"column"} spacing={1}>
                            {solutions.map((solution, index) => (
                                <Accordion
                                    key={solution.id ?? index}
                                    disableGutters
                                    elevation={0}
                                    expanded={expandedPanel === index}
                                    onChange={(_, isExpanded) => setExpandedPanel(isExpanded ? index : false)}
                                    sx={accordionSx}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={accordionSummarySx}>
                                        <Typography variant={"body2"} sx={{fontWeight: 600, flexGrow: 1}}>
                                            Решение №{index + 1}
                                        </Typography>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1}
                                               sx={{mr: 1}}>
                                            <Typography variant={"caption"} color={"textSecondary"}
                                                        sx={{whiteSpace: "nowrap"}}>
                                                Сдано {renderDateTime(solution.publicationDate!)}
                                            </Typography>
                                            {renderSolutionRating(solution)}
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{p: {xs: 1, sm: 1.5}}}>
                                        <TaskSolutionComponent
                                            task={task}
                                            forMentor={false}
                                            solution={solution}
                                            student={student!}
                                            isLastSolution={index === solutions.length - 1}
                                            courseId={courseId}
                                            courseFilesInfo={courseFilesState.courseFiles}
                                            isProcessing={courseFilesState.processingFilesState[solution.id!]?.isLoading || false}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>}
            </Box>
        </Paper>

        <TaskQuestions
            forMentor={false}
            taskId={task.id!}
            courseStudents={courseMates}
            questions={questions}
            onChange={getQuestions}
        />
    </Stack>
}

export default TaskInlineSolutions
