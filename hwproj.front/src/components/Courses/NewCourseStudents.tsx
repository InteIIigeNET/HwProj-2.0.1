import * as React from 'react';
import {FC, useMemo, useState} from "react";
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

const actionButtonSx = {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 500,
    flexShrink: 0,
    // на узких экранах у кнопок остаётся только иконка, чтобы строка не разъезжалась
    minWidth: {xs: 36, sm: "auto"},
    px: {xs: 1, sm: 1.5},
    "& .MuiButton-startIcon": {mr: {xs: 0, sm: 0.75}, ml: 0},
}

const actionLabelSx = {display: {xs: "none", sm: "inline"}}

// Поиск нужен, только когда заявок много: на двух-трёх строках он лишний
const searchThreshold = 5

const NewCourseStudents: FC<INewCourseStudentsProps> = (props) => {
    const {students} = props

    const [pendingIds, setPendingIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isAcceptAllOpen, setIsAcceptAllOpen] = useState(false)

    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (query === "") return students
        return students.filter(student =>
            `${student.surname ?? ""} ${student.name ?? ""} ${student.middleName ?? ""} ${student.email ?? ""}`
                .toLowerCase()
                .includes(query))
    }, [students, searchQuery])

    // Пока запрос в полёте, показываем спиннер вместо кнопок и не даём нажать что-то ещё
    const withPending = async (studentIds: string[], action: (studentId: string) => Promise<Response>) => {
        setPendingIds(prevState => [...prevState, ...studentIds])
        try {
            for (const studentId of studentIds)
                await action(studentId)
            props.onUpdate()
        } finally {
            setPendingIds(prevState => prevState.filter(id => !studentIds.includes(id)))
        }
    }

    const acceptStudents = (studentIds: string[]) =>
        withPending(studentIds, studentId => ApiSingleton.coursesApi.coursesAcceptStudent(props.course.id!, studentId))

    const rejectStudent = (studentId: string) =>
        withPending([studentId], id => ApiSingleton.coursesApi.coursesRejectStudent(props.course.id!, id))

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

    const isBusy = pendingIds.length > 0
    const isSearching = searchQuery.trim() !== ""

    return (
        <>
            <Paper variant={"outlined"} sx={panelSx}>
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
                            sx={{...actionButtonSx, color: "#3f51b5"}}
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
                {filteredStudents.length === 0
                    ? <Typography
                        variant={"body2"}
                        sx={{py: 3, px: 2, textAlign: "center", color: "text.secondary"}}
                    >
                        По запросу никого не нашлось
                    </Typography>
                    : <Stack divider={<Divider/>}>
                        {filteredStudents.map(student => {
                            const isPending = pendingIds.includes(student.userId!)
                            return (
                                <Stack key={student.userId} direction={"row"} spacing={1.5} sx={rowSx}>
                                    <UserInitialsAvatar user={student} size={38}/>
                                    <Box sx={{flexGrow: 1, minWidth: 0}}>
                                        <Typography
                                            component={"div"}
                                            noWrap
                                            sx={{fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.3}}
                                        >
                                            {student.surname}&nbsp;{student.name}
                                        </Typography>
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
                                    {isPending
                                        ? <CircularProgress size={20} sx={{flexShrink: 0, mx: 1.5}}/>
                                        : <Stack direction={"row"} spacing={1} sx={{flexShrink: 0}}>
                                            <Button
                                                size={"small"}
                                                variant={"contained"}
                                                disableElevation
                                                startIcon={<CheckIcon fontSize={"small"}/>}
                                                onClick={() => acceptStudents([student.userId!])}
                                                disabled={isBusy}
                                                sx={actionButtonSx}
                                            >
                                                <Box component={"span"} sx={actionLabelSx}>Принять</Box>
                                            </Button>
                                            <Button
                                                size={"small"}
                                                variant={"outlined"}
                                                color={"error"}
                                                startIcon={<CloseIcon fontSize={"small"}/>}
                                                onClick={() => rejectStudent(student.userId!)}
                                                disabled={isBusy}
                                                sx={actionButtonSx}
                                            >
                                                <Box component={"span"} sx={actionLabelSx}>Отклонить</Box>
                                            </Button>
                                        </Stack>}
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
