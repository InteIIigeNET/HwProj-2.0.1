import * as React from 'react';
import {FC, useLayoutEffect, useMemo, useRef, useState} from "react";
import {AccountDataDto, CourseViewModel} from '../../api/';
import ApiSingleton from "../../api/ApiSingleton";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Link,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";
import Utils from "../../services/Utils";

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: AccountDataDto[],
    onUpdate: () => void,
    courseId: string,
}

const applicationPlurals = ["заявку", "заявки", "заявок"]
const studentPlurals = ["студент", "студента", "студентов"]

// Оформление панели согласовано с редизайном страницы курса и списка преподавателей
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
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const rowSx = {
    px: 1.5,
    py: 1.25,
    alignItems: "center",
    transition: "background-color .15s",
    "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.04)"},
}

const namesHeaderSx = {
    px: 1.5,
    py: 0.75,
    display: "flex",
    alignItems: "center",
    color: "text.secondary",
}

const namesGridSx = {
    display: "grid",
    gridTemplateColumns: "var(--surname-width, max-content) minmax(0, 1fr)",
    columnGap: 0.5,
    minWidth: 0,
}

// Геометрия у всех кнопок панели общая: одинаковая форма, вес и ширина читаются как один набор
const actionButtonSx = {
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.8125rem",
    fontWeight: 500,
    flexShrink: 0,
    // на узких экранах у кнопок остаётся только иконка, чтобы строка не разъезжалась
    minWidth: {xs: 36, sm: 112},
    px: {xs: 1, sm: 1.5},
    transition: "background-color .15s, border-color .15s, color .15s",
    "& .MuiButton-startIcon": {mr: {xs: 0, sm: 0.75}, ml: 0},
}

const disabledButtonSx = {color: "#aeb4c2", backgroundColor: "#f4f5f7", border: "1px solid #e6e8ec"}

// Заявки чаще принимают, чем отклоняют, поэтому «Принять» тонирована акцентом панели,
// а «Отклонить» остаётся нейтральной и краснеет только под курсором: решение видно,
// но кнопки не спорят за внимание с содержимым строки
const acceptButtonSx = {
    ...actionButtonSx,
    color: "#3f51b5",
    backgroundColor: "#eef0fa",
    border: "1px solid rgba(63, 81, 181, 0.16)",
    "&:hover": {backgroundColor: "#e2e6f7", borderColor: "rgba(63, 81, 181, 0.32)"},
    "&.Mui-disabled": disabledButtonSx,
}

const rejectButtonSx = {
    ...actionButtonSx,
    color: "#6b7280",
    backgroundColor: "#f4f5f7",
    border: "1px solid #e2e5ea",
    "&:hover": {color: "#c62828", backgroundColor: "#fdecec", borderColor: "#f3c9c9"},
    "&.Mui-disabled": disabledButtonSx,
}

// Пока запрос в полёте, кнопки заблокированы, но нажатая сохраняет свой цвет и показывает
// спиннер на месте иконки — так видно, что именно происходит со строкой, и она не меняет ширину
const acceptButtonPendingSx = {
    ...acceptButtonSx,
    "&.Mui-disabled": {color: "#3f51b5", backgroundColor: "#eef0fa", border: "1px solid rgba(63, 81, 181, 0.16)"},
}

const rejectButtonPendingSx = {
    ...rejectButtonSx,
    "&.Mui-disabled": {color: "#c62828", backgroundColor: "#fdecec", border: "1px solid #f3c9c9"},
}

// В шапке форма та же, но кнопка светлая: тонировка акцентом слилась бы с её заливкой
const headerButtonSx = {
    ...actionButtonSx,
    color: "#3f51b5",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(63, 81, 181, 0.16)",
    "&:hover": {backgroundColor: "#fff", borderColor: "rgba(63, 81, 181, 0.32)"},
    "&.Mui-disabled": {...disabledButtonSx, backgroundColor: "rgba(255, 255, 255, 0.5)"},
}

const actionLabelSx = {display: {xs: "none", sm: "inline"}}

type PendingAction = "accept" | "reject"

// Поиск нужен, только когда заявок много: на двух-трёх строках он лишний
const searchThreshold = 5

const NewCourseStudents: FC<INewCourseStudentsProps> = (props) => {
    const {students} = props

    const [pendingActions, setPendingActions] = useState<Record<string, PendingAction>>({})
    const [searchQuery, setSearchQuery] = useState("")
    const [isAcceptAllOpen, setIsAcceptAllOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (query === "") return students
        return students.filter(student =>
            `${student.surname ?? ""} ${student.name ?? ""} ${student.middleName ?? ""} ${student.email ?? ""}`
                .toLowerCase()
                .includes(query))
    }, [students, searchQuery])

    useLayoutEffect(() => {
        const panel = panelRef.current
        if (!panel) return

        let cancelled = false
        const updateSurnameWidth = () => {
            if (cancelled) return
            const surnames = panel.querySelectorAll<HTMLElement>("[data-student-surname]")
            const width = Math.max(0, ...Array.from(surnames, surname => surname.getBoundingClientRect().width))
            panel.style.setProperty("--surname-width", `${Math.ceil(width)}px`)
        }

        updateSurnameWidth()
        void document.fonts.ready.then(updateSurnameWidth)
        document.fonts.addEventListener("loadingdone", updateSurnameWidth)
        return () => {
            cancelled = true
            document.fonts.removeEventListener("loadingdone", updateSurnameWidth)
        }
    }, [filteredStudents])

    // Пока запрос в полёте, не даём нажать что-то ещё
    const withPending = async (
        studentIds: string[],
        action: PendingAction,
        request: (studentId: string) => Promise<Response>) => {
        setPendingActions(prevState =>
            ({...prevState, ...Object.fromEntries(studentIds.map(id => [id, action]))}))
        try {
            for (const studentId of studentIds)
                await request(studentId)
            props.onUpdate()
        } finally {
            setPendingActions(prevState =>
                Object.fromEntries(Object.entries(prevState).filter(([id]) => !studentIds.includes(id))))
        }
    }

    const acceptStudents = (studentIds: string[]) =>
        withPending(studentIds, "accept",
            studentId => ApiSingleton.coursesApi.coursesAcceptStudent(props.course.id!, studentId))

    const rejectStudent = (studentId: string) =>
        withPending([studentId], "reject",
            id => ApiSingleton.coursesApi.coursesRejectStudent(props.course.id!, id))

    const acceptAll = async () => {
        setIsAcceptAllOpen(false)
        await acceptStudents(filteredStudents.map(student => student.userId!))
    }

    if (students.length === 0) {
        return (
            <Alert>
                <AlertTitle>
                    На данный момент все заявки приняты!
                </AlertTitle>
                Уведомления о новых заявках на Ваших курсах так же будут отображены на главной странице сервиса
            </Alert>
        )
    }

    const isBusy = Object.keys(pendingActions).length > 0
    const isSearching = searchQuery.trim() !== ""

    return (
        <>
            <Paper variant={"outlined"} ref={panelRef} sx={panelSx}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={headerSx}>
                    <PersonAddIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Заявки на вступление</Typography>
                    <Chip size={"small"} label={students.length} sx={headerChipSx}/>
                    <Box sx={{flexGrow: 1}}/>
                    {filteredStudents.length > 1 &&
                        <Button
                            size={"small"}
                            startIcon={<DoneAllIcon fontSize={"small"}/>}
                            onClick={() => setIsAcceptAllOpen(true)}
                            disabled={isBusy}
                            sx={headerButtonSx}
                        >
                            <Box component={"span"} sx={actionLabelSx}>
                                {isSearching ? "Принять найденных" : "Принять всех"}
                            </Box>
                        </Button>}
                </Stack>
                <Divider/>
                {students.length >= searchThreshold &&
                    <>
                        <Box sx={{px: 1.5, py: 1}}>
                            <TextField
                                fullWidth
                                size={"small"}
                                variant={"outlined"}
                                placeholder={"Поиск по имени или почте"}
                                value={searchQuery}
                                onChange={event => setSearchQuery(event.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon fontSize={"small"} sx={{mr: 1, color: "GrayText"}}/>,
                                    sx: {borderRadius: "10px"},
                                }}
                            />
                        </Box>
                        <Divider/>
                    </>}
                <Box sx={namesHeaderSx}>
                    <Box sx={{width: 38, flexShrink: 0}}/>
                    <Box sx={{width: 12, flexShrink: 0}}/>
                    <Box sx={{...namesGridSx, flexGrow: 1}}>
                        <Typography variant={"caption"} noWrap sx={{fontWeight: 500}}>Фамилия</Typography>
                        <Typography variant={"caption"} noWrap sx={{fontWeight: 500}}>Имя</Typography>
                    </Box>
                    <Box sx={{width: {xs: 84, sm: 236}, flexShrink: 0}}/>
                </Box>
                <Divider/>
                {filteredStudents.length === 0
                    ? <Typography
                        variant={"body2"}
                        sx={{py: 3, px: 2, textAlign: "center", color: "text.secondary"}}
                    >
                        По запросу никого не нашлось
                    </Typography>
                    : <Stack divider={<Divider/>}>
                        {filteredStudents.map(student => {
                            const pendingAction = pendingActions[student.userId!]
                            return (
                                <Stack key={student.userId} direction={"row"} spacing={1.5} sx={rowSx}>
                                    <UserInitialsAvatar user={student} size={38}/>
                                    <Box sx={{flexGrow: 1, minWidth: 0}}>
                                        <Box sx={namesGridSx}>
                                            <Typography
                                                component={"div"}
                                                noWrap
                                                sx={{fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.3, flexShrink: 0}}
                                            >
                                                <span data-student-surname>{student.surname}</span>
                                            </Typography>
                                            <Typography
                                                component={"div"}
                                                noWrap
                                                sx={{fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.3, minWidth: 0, flex: 1}}
                                            >
                                                {student.name}
                                            </Typography>
                                        </Box>
                                        {student.email &&
                                            <Link
                                                href={`mailto:${student.email}`}
                                                underline={"hover"}
                                                variant={"caption"}
                                                noWrap
                                                sx={{display: "block", color: "text.secondary"}}
                                            >
                                                {student.email}
                                            </Link>}
                                    </Box>
                                    <Stack direction={"row"} spacing={1} sx={{flexShrink: 0}}>
                                        <Button
                                            size={"small"}
                                            startIcon={pendingAction === "accept"
                                                ? <CircularProgress size={16} color={"inherit"}/>
                                                : <CheckIcon fontSize={"small"}/>}
                                            onClick={() => acceptStudents([student.userId!])}
                                            disabled={isBusy}
                                            sx={pendingAction === "accept" ? acceptButtonPendingSx : acceptButtonSx}
                                        >
                                            <Box component={"span"} sx={actionLabelSx}>Принять</Box>
                                        </Button>
                                        <Button
                                            size={"small"}
                                            startIcon={pendingAction === "reject"
                                                ? <CircularProgress size={16} color={"inherit"}/>
                                                : <CloseIcon fontSize={"small"}/>}
                                            onClick={() => rejectStudent(student.userId!)}
                                            disabled={isBusy}
                                            sx={pendingAction === "reject" ? rejectButtonPendingSx : rejectButtonSx}
                                        >
                                            <Box component={"span"} sx={actionLabelSx}>Отклонить</Box>
                                        </Button>
                                    </Stack>
                                </Stack>
                            )
                        })}
                    </Stack>}
            </Paper>
            <Dialog open={isAcceptAllOpen} onClose={() => setIsAcceptAllOpen(false)}>
                <DialogTitle>
                    {`Принять ${filteredStudents.length} ${Utils.pluralizeHelper(applicationPlurals, filteredStudents.length)}?`}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {`${filteredStudents.length} ${Utils.pluralizeHelper(studentPlurals, filteredStudents.length)} будут добавлены на курс «${props.course.name}».`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAcceptAllOpen(false)} sx={{textTransform: "none"}}>
                        Отмена
                    </Button>
                    <Button onClick={acceptAll} variant={"contained"} disableElevation sx={{textTransform: "none"}}>
                        Принять
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default NewCourseStudents
