import * as React from "react";
import {FC, useEffect, useState} from "react";
import {
    AccountDataDto,
    GetSolutionModel,
    GetTaskQuestionDto,
    HomeworkTaskViewModel,
    SolutionState,
} from "@/api";
import {Box, Button, Collapse, Stack, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ApiSingleton from "../../api/ApiSingleton";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";
import TaskSolutionComponent from "./TaskSolutionComponent";
import AddOrEditSolution from "./AddOrEditSolution";
import TaskQuestions from "../Tasks/TaskQuestions";

// Заголовок раздела — в один ряд с «Условием задачи» из шапки: тот же индиго, тот же вес.
// Никаких дополнительных рамок и «шапок»: карточку решения рисует сам TaskSolutionComponent,
// а лишний внешний контейнер и аккордеон только множили вложенность и повторяли слово «решение».
const sectionHeadingSx = {
    color: "#3f51b5",
    fontWeight: 600,
}

const actionButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    fontWeight: 500,
    flexShrink: 0,
}

const toggleButtonSx = {
    textTransform: "none" as const,
    borderRadius: "8px",
    fontWeight: 500,
    color: "text.secondary",
    px: 1,
}

const emptyStateSx = {
    py: 2,
    color: "text.secondary",
}

interface ITaskInlineSolutionsProps {
    courseId: number
    task: HomeworkTaskViewModel
    userId: string
    courseMates: AccountDataDto[]
    // Решение отправляется/меняется прямо здесь, но баллы за задачу в шапке и в превью слева
    // считаются из статистики курса на уровне Course — просим её перечитать данные.
    onSolutionsChanged: () => void
}

const TaskInlineSolutions: FC<ITaskInlineSolutionsProps> = (props) => {
    const {courseId, task, userId, courseMates} = props
    const student = courseMates.find(x => x.userId === userId)

    const [solutions, setSolutions] = useState<GetSolutionModel[]>([])
    const [questions, setQuestions] = useState<GetTaskQuestionDto[]>([])
    const [addSolution, setAddSolution] = useState(false)
    const [showPrevious, setShowPrevious] = useState(false)

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
        setShowPrevious(false)
        setAddSolution(false)
    }

    // Вызывается после успешной отправки/изменения решения: обновляем и локальный список,
    // и данные курса, чтобы перерисовались баллы за задачу (шапка задачи, превью в ленте слева)
    const handleSolutionSaved = async () => {
        await getSolutions()
        props.onSolutionsChanged()
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
    const previousSolutions = solutions.slice(0, -1)
    const isEdit = lastSolution?.state === SolutionState.NUMBER_0

    const renderSolution = (solution: GetSolutionModel, isLast: boolean) => (
        <TaskSolutionComponent
            key={solution.id}
            task={task}
            forMentor={false}
            solution={solution}
            student={student!}
            isLastSolution={isLast}
            courseId={courseId}
            courseFilesInfo={courseFilesState.courseFiles}
            isProcessing={courseFilesState.processingFilesState[solution.id!]?.isLoading || false}
        />
    )

    return <Stack direction={"column"} spacing={2.5}>
        <Box>
            <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{mb: 1.5}}>
                <Typography variant={"subtitle2"} sx={sectionHeadingSx}>Решения</Typography>
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

            {solutions.length === 0
                ? <Typography variant={"body2"} sx={emptyStateSx}>
                    Вы ещё не отправляли решения по этой задаче.
                </Typography>
                : <Stack direction={"column"} spacing={2}>
                    {previousSolutions.length > 0 && <Box>
                        <Button
                            size={"small"}
                            onClick={() => setShowPrevious(v => !v)}
                            startIcon={<ExpandMoreIcon sx={{
                                transition: "transform .2s",
                                transform: showPrevious ? "rotate(180deg)" : "none",
                            }}/>}
                            sx={toggleButtonSx}
                        >
                            {showPrevious
                                ? "Скрыть предыдущие"
                                : `Предыдущие решения (${previousSolutions.length})`}
                        </Button>
                        <Collapse in={showPrevious} unmountOnExit>
                            <Stack direction={"column"} spacing={2} sx={{mt: 1.5}}>
                                {previousSolutions.map(s => renderSolution(s, false))}
                            </Stack>
                        </Collapse>
                    </Box>}
                    {lastSolution && renderSolution(lastSolution, true)}
                </Stack>}
        </Box>

        <TaskQuestions
            forMentor={false}
            taskId={task.id!}
            courseStudents={courseMates}
            questions={questions}
            onChange={getQuestions}
        />

        {addSolution && <AddOrEditSolution
            courseId={courseId}
            userId={userId}
            task={task}
            onAdd={handleSolutionSaved}
            onCancel={() => setAddSolution(false)}
            lastSolution={lastSolution}
            students={courseMates}
            supportsGroup={task.isGroupWork!}
            courseFilesInfo={courseFilesState.courseFiles}
            onStartProcessing={updateCourseUnitFiles}
        />}
    </Stack>
}

export default TaskInlineSolutions
