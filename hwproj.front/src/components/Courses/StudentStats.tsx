import React, {useEffect, useRef, useState} from "react";
import {CourseViewModel, GroupViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "@/api";
import {useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import {BonusTag, BonusTip, DefaultTags, TestTag} from "../Common/HomeworkTags";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";
import Lodash from "lodash"
import ApiSingleton from "@/api/ApiSingleton";

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[] | undefined;
    groups: GroupViewModel[];
}

interface IStudentStatsState {
    searched: string
}

const studentPlurals = ["студент", "студента", "студентов"]

// Оформление панели согласовано с редизайном страницы курса и списка заданий
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
    // В полноэкранном режиме тулбар должен остаться видимым, поэтому разворачиваем всю панель, а не только таблицу
    "&:fullscreen": {
        border: "none",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
    },
}

const toolbarSx = {
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

const lightBorder = "1px solid #eceef3"
const groupBorder = "1px solid #d5d9e6"

// Высота первой строки шапки фиксирована, чтобы вторая строка липла ровно под неё
const HEAD_ROW_HEIGHT = 46
const NAME_COLUMN_WIDTH = 224

const headCellSx = {
    px: 1,
    py: 0.5,
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.25,
    color: "#3f51b5",
    backgroundColor: "#f3f4fb",
    borderBottom: groupBorder,
}

const subHeadCellSx = {
    top: HEAD_ROW_HEIGHT,
    minWidth: 76,
}

// Колонка со студентом закреплена слева: при горизонтальной прокрутке широкой ведомости строка не теряется
const stickyNameCellSx = {
    position: "sticky" as const,
    left: 0,
    minWidth: NAME_COLUMN_WIDTH,
    width: NAME_COLUMN_WIDTH,
    maxWidth: NAME_COLUMN_WIDTH,
    backgroundColor: "#fff",
    // Тень вместо границы: не даёт двойной линии со следующей колонкой и показывает, что колонка "плавает" над прокруткой
    boxShadow: "1px 0 0 #d5d9e6, 4px 0 8px -4px rgba(0, 0, 0, 0.08)",
}

const clampSx = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
}

const bodyCellSx = {
    px: 1,
    py: 0.5,
    borderBottom: lightBorder,
}

const summaryCellSx = {
    ...bodyCellSx,
    backgroundColor: "#fff",
    borderLeft: groupBorder,
}

const sumChipSx = {
    height: 24,
    fontSize: "0.875rem",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    "& .MuiChip-label": {px: 1},
}

const captionSx = {
    display: "block",
    fontSize: "0.6875rem",
    lineHeight: 1.3,
    color: "text.secondary",
}

const StudentStats: React.FC<IStudentStatsProps> = (props) => {
    const [state, setSearched] = useState<IStudentStatsState>({
        searched: ""
    });
    const {courseId} = useParams();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/statistics/${courseId}/charts`)
    }

    const [isFullscreen, setIsFullscreen] = useState(false)

    const panelRef = useRef<HTMLDivElement | null>(null)

    const toggleFullscreen = () => {
        const target = panelRef.current
        if (!target) return
        if (!document.fullscreenElement) {
            if (target.requestFullscreen) {
                target.requestFullscreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onFsChange)
        return () => document.removeEventListener('fullscreenchange', onFsChange)
    }, [])

    const {searched} = state
    const isMentor = ApiSingleton.authService.isMentor()

    // Поиск студента можно начать, просто начав печатать в любом месте страницы
    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.altKey || event.metaKey) return

            // Если пользователь печатает в поле поиска (или любом другом), ввод обрабатывает сам инпут
            const target = event.target as HTMLElement | null
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable))
                return

            if (searched && event.key === "Escape") {
                setSearched({searched: ""});
            } else if (searched && event.key === "Backspace") {
                setSearched({searched: searched.slice(0, -1)})
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Zа-яА-Я\s]/i)
            ) {
                setSearched({searched: searched + event.key})
            }
        };

        document.addEventListener('keydown', keyDownHandler);
        return () => document.removeEventListener('keydown', keyDownHandler);
    }, [searched]);

    const homeworks = props.homeworks.filter(h => h.tasks && h.tasks.length > 0)
    const solutions = searched
        ? props.solutions?.filter(cm => (cm.surname + " " + cm.name).toLowerCase().includes(searched.toLowerCase()))
        : props.solutions

    const testHomeworkStyle = {
        backgroundColor: "#3f51b5",
        borderLeftColor: "#3f51b5",
        color: "white",
    }

    const homeworkStyles = (homeworks: HomeworkViewModel[], idx: number): React.CSSProperties | undefined => {
        if (homeworks[idx].tags?.includes(TestTag))
            return testHomeworkStyle
        if (idx !== 0 && homeworks[idx - 1].tags?.includes(TestTag))
            return {borderLeftColor: testHomeworkStyle.borderLeftColor}
        return undefined
    }

    // Цветовое кодирование контрольных работ и усиленная граница на стыке заданий
    const headTaskCellSx = (homeworks: HomeworkViewModel[], idx: number, isFirstTask: boolean) => {
        const styles = homeworkStyles(homeworks, idx)
        return {
            ...headCellSx,
            ...subHeadCellSx,
            ...(styles?.backgroundColor
                ? {backgroundColor: styles.backgroundColor, color: styles.color}
                : {}),
            borderLeft: isFirstTask ? `1px solid ${styles?.borderLeftColor ?? "#d5d9e6"}` : lightBorder,
        }
    }

    const notTests = homeworks.filter(h => !h.tags!.includes(TestTag))

    const testGroups = Lodash(homeworks.filter(h => h.tags!.includes(TestTag)))
        .groupBy((h: HomeworkViewModel) => {
            const key = h.tags!.find(t => !DefaultTags.includes(t))
            return key || h.id!.toString();
        })
        .values()
        .value();

    const testHomeworks = testGroups.map(x => x[0])

    const homeworksWithGroups = notTests.filter(h => h.groupId)
    const testsWithGroups = testHomeworks.filter(t => t.groupId != undefined)

    const getMaxSum = (studentId: string, isTests: boolean = false) => {
        const works = isTests ? testHomeworks : notTests;
        return works
            .filter(h => (isTests || !h.tags!.includes(BonusTag)) &&
                (h.groupId == undefined || (props.groups.find(g => g.id === h.groupId)?.studentsIds?.includes(studentId))))
            .flatMap(homework => homework.tasks)
            .reduce((sum, task) => {
                return sum + (task!.tags!.includes(BonusTag) ? 0 : (task!.maxRating || 0));
            }, 0)
    }

    const hasHomeworks = notTests.length > 0
    const hasTests = testHomeworks.length > 0
    const showBestSolutions = isMentor && (hasHomeworks || hasTests)

    const bestTaskSolutions = new Map<number, string>()
    if (props.solutions && isMentor) {
        Lodash(homeworks)
            .flatMap(h => h.tasks!)
            .map(t => props.solutions!
                .map(s => s.homeworks!
                    .flatMap(h1 => h1.tasks!)
                    .find(t1 => t1.id === t.id)?.solutions || [])
                .map(s => StudentStatsUtils.calculateLastRatedSolution(s))
                .filter(x => x != undefined && x.rating! > 0))
            .filter(x => x.length > 0)
            .map(x => Lodash(x).orderBy([
                    (x) => x.rating,
                    (x) => new Date(x.publicationDate!).getTime()
                ], ["desc", "asc"]).value()[0]
            )
            .forEach(x => bestTaskSolutions.set(x.taskId!, x.studentId!))
    }

    const renderTitle = (x: { title?: string, tags?: string[] }) => {
        return <>
            {x.title}{x.tags?.includes(BonusTag) && <BonusTip/>}
        </>
    }

    const totalStudents = props.solutions?.length ?? 0
    const shownStudents = solutions?.length ?? 0
    const hasStudents = totalStudents > 0

    return (
        <Paper variant={"outlined"} ref={panelRef} sx={panelSx}>
            <Stack
                direction={{xs: "column", sm: "row"}}
                alignItems={{xs: "stretch", sm: "center"}}
                spacing={1}
                sx={toolbarSx}
            >
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{minWidth: 0}}>
                    <AssessmentOutlinedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Успеваемость</Typography>
                    {hasStudents && <Tooltip
                        arrow
                        title={searched
                            ? `Найдено ${shownStudents} из ${totalStudents}`
                            : `${totalStudents} ${Utils.pluralizeHelper(studentPlurals, totalStudents)} на курсе`}>
                        <Chip
                            size={"small"}
                            sx={headerChipSx}
                            label={searched ? `${shownStudents} / ${totalStudents}` : totalStudents}/>
                    </Tooltip>}
                </Stack>
                <Box sx={{flexGrow: 1}}/>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{flexShrink: 0}}>
                    {hasStudents && <TextField
                        size={"small"}
                        value={searched}
                        placeholder={"Поиск студента"}
                        onChange={event => setSearched({searched: event.target.value})}
                        sx={{width: {xs: "100%", sm: 200}, backgroundColor: "#fff", borderRadius: "10px"}}
                        InputProps={{
                            startAdornment: <SearchIcon fontSize={"small"} sx={{mr: 1, color: "text.secondary"}}/>,
                            endAdornment: searched
                                ? <IconButton size={"small"} onClick={() => setSearched({searched: ""})}>
                                    <ClearIcon sx={{fontSize: 16}}/>
                                </IconButton>
                                : undefined,
                            sx: {borderRadius: "10px", fontSize: "0.9375rem"},
                        }}
                    />}
                    {shownStudents > 0 && <Button
                        startIcon={<ShowChartIcon/>}
                        color={"primary"}
                        size={"small"}
                        onClick={handleClick}
                        sx={{textTransform: "none", borderRadius: "10px", flexShrink: 0}}
                    >
                        Графики
                    </Button>}
                    <Tooltip arrow title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}>
                        <IconButton size={"small"} color={"primary"} onClick={toggleFullscreen}>
                            {isFullscreen
                                ? <FullscreenExitIcon fontSize={"small"}/>
                                : <FullscreenIcon fontSize={"small"}/>}
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
            <Divider/>
            {props.solutions === undefined && <LinearProgress/>}
            {props.solutions && props.solutions.length === 0 && <Alert severity="info" sx={{borderRadius: 0}}>
                На курс пока ещё никто не записался
            </Alert>}
            {hasStudents && shownStudents === 0 && <Alert severity="info" sx={{borderRadius: 0}}>
                {"Студенты не найдены по запросу «" + searched.replaceAll(" ", "·") + "»"}
            </Alert>}
            <TableContainer
                sx={{
                    maxHeight: isFullscreen ? "none" : {xs: "70vh", md: "80vh"},
                    flexGrow: isFullscreen ? 1 : 0,
                    minHeight: 0,
                    "&::-webkit-scrollbar": {width: "8px", height: "8px"},
                    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                    "&::-webkit-scrollbar-thumb": {backgroundColor: "#c4cad2", borderRadius: "4px"},
                    "&::-webkit-scrollbar-thumb:hover": {backgroundColor: "#a8b0d8"},
                }}>
                <Table stickyHeader size={"small"} aria-label="Ведомость успеваемости">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                rowSpan={2}
                                sx={{
                                    ...headCellSx,
                                    ...stickyNameCellSx,
                                    backgroundColor: "#f3f4fb",
                                    zIndex: 4,
                                    verticalAlign: "bottom",
                                }}>
                                Студент
                            </TableCell>
                            {(hasHomeworks || hasTests) && <TableCell
                                colSpan={(hasHomeworks ? 1 : 0) + (hasTests ? 1 : 0) + (showBestSolutions ? 1 : 0)}
                                align="center"
                                sx={{...headCellSx, height: HEAD_ROW_HEIGHT, borderLeft: groupBorder}}
                            >
                                Итоговые баллы
                            </TableCell>}
                            {homeworks.map((homework, idx) => {
                                const styles = homeworkStyles(homeworks, idx)
                                return <TableCell
                                    key={homework.id}
                                    align="center"
                                    colSpan={homework.tasks!.length}
                                    sx={{
                                        ...headCellSx,
                                        height: HEAD_ROW_HEIGHT,
                                        ...(styles?.backgroundColor
                                            ? {backgroundColor: styles.backgroundColor, color: styles.color}
                                            : {}),
                                        borderLeft: `1px solid ${styles?.borderLeftColor ?? "#d5d9e6"}`,
                                    }}
                                >
                                    <Tooltip arrow disableInteractive
                                             title={homework.isDeferred
                                                 ? `${homework.title ?? ""} — ещё не опубликовано`
                                                 : homework.title ?? ""}>
                                        <Box sx={{...clampSx, ...(homework.isDeferred ? {opacity: 0.6} : {})}}>
                                            {renderTitle(homework)}
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                            })}
                        </TableRow>
                        <TableRow>
                            {hasHomeworks && <TableCell
                                align="center"
                                sx={{...headCellSx, ...subHeadCellSx, borderLeft: groupBorder}}>
                                {"ДЗ " + (homeworksWithGroups.length === 0 ? `(${getMaxSum("", false)})` : "")}
                            </TableCell>}
                            {hasTests && <TableCell
                                align="center"
                                sx={{...headCellSx, ...subHeadCellSx, borderLeft: groupBorder}}>
                                {"КР " + (testsWithGroups.length === 0 ? `(${getMaxSum("", true)})` : "")}
                            </TableCell>}
                            {showBestSolutions && <TableCell
                                align="center"
                                sx={{...headCellSx, ...subHeadCellSx, minWidth: 52, borderLeft: groupBorder}}>
                                <Tooltip arrow title={"Задачи, где студент первым получил лучшую оценку"}>
                                    <Box component={"span"}>🥇</Box>
                                </Tooltip>
                            </TableCell>}
                            {homeworks.map((homework, idx) =>
                                homework.tasks!.map((task, i) => (
                                    <TableCell
                                        key={task.id}
                                        align="center"
                                        sx={headTaskCellSx(homeworks, idx, i === 0)}>
                                        <Tooltip arrow disableInteractive
                                                 title={task.isDeferred
                                                     ? `${task.title ?? ""} — ещё не опубликована`
                                                     : task.title ?? ""}>
                                            {/* Заголовок неопубликованной задачи приглушаем прозрачностью: она работает и на синей шапке КР */}
                                            <Box sx={{...clampSx, ...(task.isDeferred ? {opacity: 0.6} : {})}}>
                                                {renderTitle(task)}
                                            </Box>
                                        </Tooltip>
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions && solutions.map((cm, index) => {
                            const homeworksSum = notTests
                                .flatMap(homework =>
                                    solutions
                                        .find(s => s.id === cm.id)?.homeworks!
                                        .find(h => h.id === homework.id)?.tasks!
                                        .flatMap(t => StudentStatsUtils.calculateLastRatedSolution(t.solutions || [])?.rating || 0) || 0
                                )
                                .reduce((sum, rating) => sum + rating, 0)
                            const studentHomeworksMaxSum = getMaxSum(cm.id!, false)

                            const testsSum = testGroups
                                .map(group => {
                                    const testRatings = group
                                        .map(homework =>
                                            solutions
                                                .find(s => s.id === cm.id)?.homeworks!
                                                .find(h => h.id === homework.id)?.tasks!
                                                .flatMap(t => StudentStatsUtils.calculateLastRatedSolution(t.solutions || [])?.rating || 0)
                                            || []
                                        )
                                    return testRatings[0]!
                                        .map((_, columnId) => testRatings.map(row => row[columnId]))
                                        .map(taskRatings => Math.max(...taskRatings))
                                })
                                .flat()
                                .reduce((sum, rating) => sum + rating, 0)

                            const studentTestsMaxSum = getMaxSum(cm.id!, true)

                            const bestSolutionsCount = bestTaskSolutions.values()
                                .filter(x => x === cm.id)
                                .toArray().length

                            const studentGroups = props.groups.filter(x => x.studentsIds!.includes(cm.id!))
                            const groupNames = studentGroups
                                .filter(g => g.name?.trim())
                                .map(r => r.name)
                                .join(', ')
                            const reviewers = (cm.reviewers ?? [])
                                .filter(r => r.userId !== props.userId)
                                .map(r => `${r.name} ${r.surname}`)
                                .join(', ')

                            return (
                                <TableRow
                                    key={index}
                                    hover
                                    sx={{
                                        height: 52,
                                        // Закреплённая колонка имеет собственный фон, поэтому подсвечиваем её отдельно
                                        "&:hover .stats-sticky-name": {backgroundColor: "#f0f2f7"},
                                    }}>
                                    <TableCell
                                        className={"stats-sticky-name"}
                                        align="left"
                                        sx={{...bodyCellSx, ...stickyNameCellSx, zIndex: 1}}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1.25}
                                               sx={{minWidth: 0}}>
                                            <UserInitialsAvatar
                                                user={{name: cm.name, surname: cm.surname}}
                                                size={30}
                                                fontSize={"0.7rem"}/>
                                            <Box sx={{minWidth: 0}}>
                                                <Typography
                                                    sx={{fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.25}}>
                                                    {cm.surname} {cm.name}
                                                </Typography>
                                                {groupNames && <Tooltip arrow disableInteractive title={groupNames}>
                                                    <Stack direction={"row"} alignItems={"center"} spacing={0.5}
                                                           sx={{color: "text.secondary"}}>
                                                        <GroupIcon sx={{fontSize: 12, flexShrink: 0}}/>
                                                        <Typography noWrap sx={captionSx}>{groupNames}</Typography>
                                                    </Stack>
                                                </Tooltip>}
                                                {reviewers && <Tooltip arrow disableInteractive title={reviewers}>
                                                    <Typography noWrap sx={captionSx}>{reviewers}</Typography>
                                                </Tooltip>}
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    {hasHomeworks && <TableCell align="center" sx={summaryCellSx}>
                                        {studentHomeworksMaxSum > 0 && <Chip
                                            size={"small"}
                                            sx={{
                                                ...sumChipSx,
                                                backgroundColor: StudentStatsUtils.getRatingColor(homeworksSum, studentHomeworksMaxSum),
                                            }}
                                            label={homeworksWithGroups.length > 0
                                                ? `${homeworksSum} / ${studentHomeworksMaxSum}`
                                                : homeworksSum}/>}
                                    </TableCell>}
                                    {hasTests && <TableCell align="center" sx={summaryCellSx}>
                                        {studentTestsMaxSum > 0 && <Chip
                                            size={"small"}
                                            sx={{
                                                ...sumChipSx,
                                                backgroundColor: StudentStatsUtils.getRatingColor(testsSum, studentTestsMaxSum),
                                            }}
                                            label={testsWithGroups.length > 0
                                                ? `${testsSum} / ${studentTestsMaxSum}`
                                                : testsSum}/>}
                                    </TableCell>}
                                    {showBestSolutions && <TableCell align="center" sx={summaryCellSx}>
                                        {bestSolutionsCount > 0 && <Typography
                                            variant={"caption"}
                                            sx={{fontWeight: 500, color: "#a9791a"}}>
                                            {bestSolutionsCount}
                                        </Typography>}
                                    </TableCell>}
                                    {homeworks.map((homework, idx) =>
                                        homework.tasks!.map((task, i) => {
                                            const styles = homeworkStyles(homeworks, idx)
                                            const isDisabled = homework.groupId
                                                ? !props.groups.find(g => g.id === homework.groupId)?.studentsIds?.includes(cm.id!)
                                                : false
                                            return <StudentStatsCell
                                                key={`${cm.id}-${homework.id}-${task.id}`}
                                                solutions={cm.homeworks
                                                    ?.find(h => h.id === homework.id)?.tasks
                                                    ?.find(t => t.id === task.id)?.solutions || []}
                                                userId={props.userId}
                                                forMentor={props.isMentor}
                                                studentId={String(cm.id)}
                                                taskId={task.id!}
                                                taskMaxRating={task.maxRating!}
                                                isBestSolution={bestTaskSolutions.get(task.id!) === cm.id}
                                                disabled={isDisabled}
                                                isDeferred={task.isDeferred}
                                                borderLeftColor={i === 0
                                                    ? styles?.borderLeftColor ?? "#d5d9e6"
                                                    : "#eceef3"}/>;
                                        })
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default StudentStats;
