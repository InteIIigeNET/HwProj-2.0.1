import {FC, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import * as React from "react";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {MarkdownEditor, MarkdownPreview} from "../Common/MarkdownEditor";
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto, AddAnswerForQuestionDto, AddTaskQuestionDto, GetTaskQuestionDto} from "@/api";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";
import {Link as ReactLink} from "react-router-dom";

interface ITaskQuestionsProps {
    forMentor: boolean
    courseStudents: AccountDataDto[]
    taskId: number
    questions: GetTaskQuestionDto[]
    onChange: () => void
}

// Оформление согласовано с карточками решений: те же радиусы, границы и мягкие шапки
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const headerSx = {
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
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 600},
}

// На заливке шапки кнопка светлая, иначе тонировка акцентом слилась бы с фоном
const headerButtonSx = {
    flexShrink: 0,
    borderRadius: "10px",
    textTransform: "none" as const,
    fontSize: "0.8125rem",
    fontWeight: 500,
    px: {xs: 1, sm: 1.5},
    minWidth: 0,
    color: "#3f51b5",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(63, 81, 181, 0.16)",
    transition: "background-color .15s, border-color .15s",
    "& .MuiButton-startIcon": {mr: {xs: 0, sm: 0.75}, ml: 0},
    "&:hover": {backgroundColor: "#fff", borderColor: "rgba(63, 81, 181, 0.32)"},
}

const rowSx = {
    px: {xs: 1.5, sm: 2},
    py: 1.75,
    alignItems: "flex-start" as const,
}

// Вопрос без ответа отмечен полосой у края и лёгкой заливкой: в длинной ветке видно,
// что ещё ждёт преподавателя. У отвеченных полоса прозрачная, чтобы текст не съезжал
const openRowSx = {
    borderLeft: "3px solid #3f51b5",
    backgroundColor: "#fbfcff",
}

const answeredRowSx = {
    borderLeft: "3px solid transparent",
}

const authorLinkSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    color: "#212529",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    "&:hover": {color: "#3f51b5", textDecoration: "underline"},
}

const metaChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.625, mr: -0.375, fontSize: 13, color: "inherit"},
}

const openChipSx = {
    ...metaChipSx,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 600},
}

const answeredChipSx = {
    ...metaChipSx,
    backgroundColor: "#e8f5ec",
    color: "#2e7d32",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 600},
    "& .MuiChip-icon": {ml: 0.625, mr: -0.375, fontSize: 14, color: "inherit"},
}

// Плашка вместо аватарки, когда автор вопроса неизвестен: приватный вопрос — один человек,
// публичный — вся группа
const fallbackAvatarSx = {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef0f5",
    color: "#5a6472",
}

// Markdown-превью держит собственный нижний отступ инлайном, поэтому гасим его через !important
const markdownTextSx = {
    "& .markdown-preview": {paddingBottom: "0 !important", fontSize: "0.9375rem"},
}

// Редактор задаёт себе внешние отступы инлайном — убираем, отступы задаёт раскладка
const markdownEditorSx = {
    "& > div": {marginTop: "0 !important", marginBottom: "0 !important"},
}

// Ответ — вложенная в вопрос карточка с акцентной полосой: видно, что это часть той же ветки,
// а не отдельное сообщение
const answerSx = {
    mt: 1.25,
    px: 1.5,
    py: 1.25,
    borderRadius: "12px",
    border: "1px solid #e6e8f0",
    borderLeft: "3px solid #3f51b5",
    backgroundColor: "#f7f8fd",
}

const answerLabelSx = {
    display: "flex",
    alignItems: "center",
    gap: 0.625,
    mb: 0.5,
    color: "#3f51b5",
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
}

const primaryButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    fontWeight: 500,
    px: 2,
}

const quietButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    fontWeight: 500,
    color: "text.secondary",
}

// Настройка видимости — не просто галочка: от неё зависит, увидит ли вопрос вся группа,
// поэтому у неё рамка и пояснение под подписью
const visibilityBoxSx = {
    mt: 2,
    px: 1.5,
    py: 1,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
}

const emptyStateSx = {
    px: 2,
    py: 3,
    textAlign: "center" as const,
    color: "text.secondary",
}

const TaskQuestions: FC<ITaskQuestionsProps> = (props) => {
    const {forMentor, questions, courseStudents, taskId} = props

    const [newQuestion, setNewQuestion] = useState<AddTaskQuestionDto & { show: boolean }>({
        show: false,
        text: "",
        isPrivate: true
    })

    const [answerDraft, setAnswerDraft] = useState<{ questionId: number | undefined, answer: string }>({
        questionId: undefined,
        answer: ""
    })

    // Пока запрос в полёте, кнопки заблокированы, чтобы вопрос или ответ не ушёл дважды
    const [isSending, setIsSending] = useState(false)

    const openQuestionsCount = questions.filter(q => !q.answer).length

    const closeNewQuestion = () => setNewQuestion({show: false, text: "", isPrivate: true})
    const closeAnswerDraft = () => setAnswerDraft({questionId: undefined, answer: ""})

    const sendQuestion = async () => {
        setIsSending(true)
        try {
            await ApiSingleton.tasksApi.tasksAddQuestionForTask({
                taskId: taskId,
                text: newQuestion.text,
                isPrivate: newQuestion.isPrivate
            })
            closeNewQuestion()
            props.onChange()
        } finally {
            setIsSending(false)
        }
    }

    const sendAnswer = async (answer: AddAnswerForQuestionDto) => {
        setIsSending(true)
        try {
            await ApiSingleton.tasksApi.tasksAddAnswerForQuestion(answer)
            closeAnswerDraft()
            props.onChange()
        } finally {
            setIsSending(false)
        }
    }

    const renderAuthor = (question: GetTaskQuestionDto, student: AccountDataDto | undefined) => {
        if (student === undefined) return (
            <Typography sx={{fontSize: "0.9375rem", fontWeight: 500}}>
                {question.isPrivate ? "Вопрос преподавателю" : "Вопрос по задаче"}
            </Typography>
        )

        const fullName = `${student.surname ?? ""} ${student.name ?? ""}`.trim()

        // Преподавателю имя нужно как переход к решениям студента, студенту — просто как подпись
        return forMentor
            ? <Box component={ReactLink} to={`/task/${taskId}/${student.userId}`} sx={authorLinkSx}>
                {fullName}
                <ArrowOutwardIcon sx={{fontSize: 14}}/>
            </Box>
            : <Typography sx={{fontSize: "0.9375rem", fontWeight: 500}}>{fullName}</Typography>
    }

    const renderVisibilityChip = (question: GetTaskQuestionDto) => question.isPrivate
        ? <Tooltip arrow title={"Вопрос и ответ видят только преподаватели"}>
            <Chip
                size={"small"}
                icon={<LockOutlinedIcon/>}
                label={"Только преподавателям"}
                sx={metaChipSx}/>
        </Tooltip>
        : <Tooltip arrow title={"Вопрос и ответ видит вся группа"}>
            <Chip
                size={"small"}
                icon={<GroupsIcon/>}
                label={"Виден студентам"}
                sx={metaChipSx}/>
        </Tooltip>

    const renderQuestion = (question: GetTaskQuestionDto) => {
        const student = courseStudents.find(s => s.userId === question.studentId)
        const isAnswered = !!question.answer
        const isAnswering = question.id === answerDraft.questionId

        return (
            <Stack
                key={question.id}
                direction={"row"}
                spacing={1.5}
                sx={{...rowSx, ...(isAnswered ? answeredRowSx : openRowSx)}}
            >
                {student !== undefined
                    ? <UserInitialsAvatar user={student} size={38}/>
                    : <Box sx={fallbackAvatarSx}>
                        {question.isPrivate
                            ? <PersonIcon fontSize={"small"}/>
                            : <GroupsIcon fontSize={"small"}/>}
                    </Box>}
                <Box sx={{flexGrow: 1, minWidth: 0}}>
                    <Stack
                        direction={"row"}
                        spacing={0.75}
                        useFlexGap
                        flexWrap={"wrap"}
                        alignItems={"center"}
                        sx={{mb: 0.5}}
                    >
                        {renderAuthor(question, student)}
                        {renderVisibilityChip(question)}
                        {isAnswered
                            ? <Chip size={"small"} icon={<CheckRoundedIcon/>} label={"Отвечен"} sx={answeredChipSx}/>
                            : <Chip size={"small"} label={"Ждёт ответа"} sx={openChipSx}/>}
                        <Box sx={{flexGrow: 1}}/>
                        {forMentor && !isAnswered && !isAnswering &&
                            <Button
                                size={"small"}
                                startIcon={<QuestionAnswerOutlinedIcon fontSize={"small"}/>}
                                disabled={isSending}
                                onClick={() => setAnswerDraft({questionId: question.id, answer: ""})}
                                sx={{...primaryButtonSx, px: 1.5, fontSize: "0.8125rem"}}
                            >
                                Ответить
                            </Button>}
                    </Stack>

                    <Box sx={markdownTextSx}>
                        <MarkdownPreview value={question.text!} backgroundColor={"transparent"} textColor={"inherit"}/>
                    </Box>

                    {isAnswered &&
                        <Box sx={answerSx}>
                            <Typography component={"div"} sx={answerLabelSx}>
                                <SchoolOutlinedIcon sx={{fontSize: 15}}/>
                                Ответ преподавателя
                            </Typography>
                            <Box sx={markdownTextSx}>
                                <MarkdownPreview
                                    value={question.answer!}
                                    backgroundColor={"transparent"}
                                    textColor={"inherit"}/>
                            </Box>
                        </Box>}

                    {isAnswering &&
                        <Box sx={{mt: 1.25}}>
                            <Box sx={markdownEditorSx}>
                                <MarkdownEditor
                                    label={"Ответ преподавателя"}
                                    height={180}
                                    value={answerDraft.answer}
                                    onChange={value => setAnswerDraft(prevState => ({...prevState, answer: value}))}
                                />
                            </Box>
                            <Stack direction={"row"} spacing={1} sx={{mt: 1.25}}>
                                <Button
                                    size={"small"}
                                    variant={"contained"}
                                    disableElevation
                                    startIcon={<SendRoundedIcon fontSize={"small"}/>}
                                    disabled={isSending || answerDraft.answer.trim() === ""}
                                    onClick={() => sendAnswer({questionId: question.id, answer: answerDraft.answer})}
                                    sx={primaryButtonSx}
                                >
                                    Отправить ответ
                                </Button>
                                <Button size={"small"} disabled={isSending} onClick={closeAnswerDraft} sx={quietButtonSx}>
                                    Отменить
                                </Button>
                            </Stack>
                        </Box>}
                </Box>
            </Stack>
        )
    }

    return (
        <>
            <Paper variant={"outlined"} sx={panelSx}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={headerSx}>
                    <QuestionAnswerOutlinedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Вопросы по задаче</Typography>
                    {questions.length > 0 &&
                        <Chip
                            size={"small"}
                            label={openQuestionsCount > 0 ? `${openQuestionsCount} без ответа` : "Все разобраны"}
                            sx={headerChipSx}/>}
                    <Box sx={{flexGrow: 1}}/>
                    {!forMentor &&
                        <Button
                            size={"small"}
                            startIcon={<AddCommentOutlinedIcon fontSize={"small"}/>}
                            onClick={() => setNewQuestion(prevState => ({...prevState, show: true}))}
                            sx={headerButtonSx}
                        >
                            Задать вопрос
                        </Button>}
                </Stack>
                <Divider/>
                {questions.length === 0
                    ? <Box sx={emptyStateSx}>
                        <Typography variant={"body2"}>
                            {forMentor
                                ? "Вопросов по задаче пока нет"
                                : "Не разобрались с условием? Задайте вопрос преподавателю"}
                        </Typography>
                    </Box>
                    : <Stack divider={<Divider/>}>{questions.map(renderQuestion)}</Stack>}
            </Paper>

            <Dialog
                fullWidth
                maxWidth={"sm"}
                open={newQuestion.show}
                onClose={closeNewQuestion}
                PaperProps={{sx: {borderRadius: "16px"}}}
            >
                <DialogTitle sx={{pb: 1, fontSize: "1.1rem", fontWeight: 500}}>
                    Вопрос по задаче
                </DialogTitle>
                <DialogContent>
                    <Box sx={markdownEditorSx}>
                        <MarkdownEditor
                            label={"Что непонятно в условии?"}
                            height={200}
                            value={newQuestion.text ?? ""}
                            onChange={value => setNewQuestion(prevState => ({...prevState, text: value}))}
                        />
                    </Box>
                    <Box sx={visibilityBoxSx}>
                        <FormControlLabel
                            sx={{m: 0, alignItems: "flex-start"}}
                            control={
                                <Checkbox
                                    color={"primary"}
                                    size={"small"}
                                    sx={{mt: -0.25, mr: 0.5}}
                                    checked={!newQuestion.isPrivate}
                                    onChange={event => setNewQuestion(prevState => ({
                                        ...prevState,
                                        isPrivate: !event.target.checked,
                                    }))}
                                />
                            }
                            label={
                                <Box>
                                    <Typography sx={{fontSize: "0.9375rem", fontWeight: 500}}>
                                        Виден другим студентам
                                    </Typography>
                                    <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                        {newQuestion.isPrivate
                                            ? "Сейчас вопрос и ответ увидят только преподаватели"
                                            : "Вопрос и ответ на него увидит вся группа"}
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2}}>
                    <Button onClick={closeNewQuestion} disabled={isSending} sx={quietButtonSx}>
                        Отменить
                    </Button>
                    <Button
                        variant={"contained"}
                        disableElevation
                        startIcon={<SendRoundedIcon fontSize={"small"}/>}
                        disabled={isSending || (newQuestion.text ?? "").trim() === ""}
                        onClick={sendQuestion}
                        sx={primaryButtonSx}
                    >
                        Отправить вопрос
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TaskQuestions;
