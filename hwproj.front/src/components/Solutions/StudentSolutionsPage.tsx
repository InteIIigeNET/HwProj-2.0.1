import * as React from "react";
import {FC, useEffect, useState} from "react";
import {
    AccountDataDto,
    GetSolutionModel,
    HomeworksGroupSolutionStats,
    HomeworkTaskViewModel,
    SolutionDto,
    SolutionState,
    StudentDataDto,
    TaskSolutionsStats
} from "@/api";
import Typography from "@mui/material/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {Box, Divider, Paper, Tab, Tabs} from "@mui/material";
import {Link, useNavigate, useParams} from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EditIcon from '@mui/icons-material/Edit';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";
import {
    Alert,
    Autocomplete,
    Checkbox,
    Chip,
    FormControlLabel,
    ListItemButton,
    SelectChangeEvent,
    Stack,
    TextField,
    Tooltip
} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";

import {RatingStorage} from "../Storages/RatingStorage";
import {getTip} from "../Common/HomeworkTags";
import {appBarStateManager} from "../AppBar";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {RemovedFromCourseTag} from "@/components/Common/StudentTags";
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";
import {CourseUnitType} from "@/components/Files/CourseUnitType";

interface IStudentSolutionsPageState {
    currentTaskId: string
    task: HomeworkTaskViewModel
    isLoaded: boolean
    courseId: number,
    courseMentors: AccountDataDto[],
    homeworkSolutionsStats: HomeworksGroupSolutionStats[],
    taskStudentsSolutionsPreview: {
        taskId: number,
        studentSolutionsPreview: {
            hasDifferentReviewer: boolean,
            student: StudentDataDto,
            solutions: GetSolutionModel[]
            lastSolution: GetSolutionModel,
            lastRatedSolution: SolutionDto,
            color: string,
            ratedSolutionsCount: number,
            solutionsDescription: string
        }[]
    }[]
}

type Filter = "Только непроверенные"
const FilterStorageKey = "StudentSolutionsPage"

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const FilterProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
        },
    },
}

// Оформление согласовано с редизайном страницы курса и ведомости: та же рамка, радиусы и мягкие шапки
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

const filterChipSx = {
    height: 22,
    flexShrink: 0,
    backgroundColor: "#fff4d6",
    color: "#8a6d00",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.5, mr: -0.25, fontSize: 14, color: "inherit"},
}

// Тонкая полоса прокрутки: системная поверх панели выглядит чужеродно и съедает высоту
const scrollbarSx = {
    "&::-webkit-scrollbar": {width: "8px", height: "8px"},
    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
    "&::-webkit-scrollbar-thumb": {backgroundColor: "#c4cad2", borderRadius: "4px"},
    "&::-webkit-scrollbar-thumb:hover": {backgroundColor: "#a8b0d8"},
}

const taskStripSx = {
    px: 1.5,
    pt: 1.5,
    pb: 1,
    overflowX: "auto" as const,
    overflowY: "hidden" as const,
    ...scrollbarSx,
}

// Короткая перемычка вместо hr на 100px: лента читается как цепочка задач и не растягивается
const taskStripConnectorSx = {
    width: 20,
    height: "2px",
    flexShrink: 0,
    backgroundColor: "#e3e6ee",
    borderRadius: "1px",
}

const taskPillSx = (isCurrent: boolean) => ({
    px: 1.25,
    py: 0.875,
    borderRadius: "12px",
    border: "1px solid",
    borderColor: isCurrent ? "#3f51b5" : "#e0e3e7",
    backgroundColor: isCurrent ? "#f0f2fc" : "#fff",
    transition: "border-color .15s, background-color .15s",
    whiteSpace: "nowrap" as const,
    "&:hover": {borderColor: isCurrent ? "#3f51b5" : "#a8b0d8"},
})

const taskPillLabelSx = (isCurrent: boolean) => ({
    fontSize: "0.875rem",
    fontWeight: isCurrent ? 600 : 500,
    lineHeight: 1.3,
    color: isCurrent ? "#3f51b5" : "text.primary",
    whiteSpace: "nowrap" as const,
})

const unratedChipSx = {
    height: 20,
    minWidth: 20,
    flexShrink: 0,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.625, fontSize: "0.75rem", fontWeight: 600},
}

const unratedChipSelectedSx = {
    ...unratedChipSx,
    backgroundColor: "#3f51b5",
    color: "#fff",
}

const filterBarSx = {
    px: 1.5,
    py: 1.25,
    backgroundColor: "#fafbfe",
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const listScrollSx = {
    p: 1,
    overflowY: "auto" as const,
    maxHeight: {xs: "none", md: "70vh"},
    ...scrollbarSx,
}

const studentRowSx = {
    px: 1,
    py: 0.75,
    borderRadius: "10px",
    transition: "background-color .15s",
    "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.06)"},
    "&.Mui-selected": {
        backgroundColor: "rgba(63, 81, 181, 0.14)",
        "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.18)"},
    },
}

const studentNameSx = {
    fontSize: "0.9375rem",
    fontWeight: 500,
    lineHeight: 1.25,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
}

// Цвет оценки приходит из ведомости инлайном, поэтому чипу задаём только рамку и ровные цифры
const ratingChipSx = {
    height: 24,
    minWidth: 32,
    flexShrink: 0,
    border: "1px solid #d5d9e6",
    fontVariantNumeric: "tabular-nums",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.8125rem", fontWeight: 500},
}

const maxRatingChipSx = {
    height: 24,
    minWidth: 32,
    flexShrink: 0,
    backgroundColor: "transparent",
    border: "1px dashed #c9cedb",
    color: "text.secondary",
    fontVariantNumeric: "tabular-nums",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.8125rem", fontWeight: 500},
}

const tabsSx = {
    minHeight: 44,
    px: 0.5,
    backgroundColor: "#f7f8fd",
    "& .MuiTabs-indicator": {height: 3, borderRadius: "3px 3px 0 0"},
}

const tabSx = {
    minHeight: 44,
    textTransform: "none" as const,
    fontSize: "0.875rem",
    fontWeight: 500,
}

const alertSx = {borderRadius: "12px"}

// Колонки раскладки: Grid container со spacing нельзя вкладывать в Stack со spacing —
// Stack ставит детям margin: 0 и стирает отрицательные отступы Grid
const columnSx = (mdShare: number, lgShare: number) => ({
    width: "100%",
    minWidth: 0,
    flex: {md: `${mdShare} 1 0`, lg: `${lgShare} 1 0`},
})


const StudentSolutionsPage: FC = () => {
    const {taskId, studentId} = useParams()
    const navigate = useNavigate()

    const [currentStudentId, setCurrentStudentId] = useState<string>(studentId!)
    const [studentSolutionsState, setStudentSolutionsState] = useState<IStudentSolutionsPageState>({
        currentTaskId: "",
        task: {},
        courseMentors: [],
        isLoaded: false,
        courseId: -1,
        homeworkSolutionsStats: [],
        taskStudentsSolutionsPreview: [],
    })
    const [filterState, setFilterState] = useState<Filter[]>(
        localStorage.getItem(FilterStorageKey)?.split(", ").filter(x => x !== "").map(x => x as Filter) || []
    )

    const [secondMentorId, setSecondMentorId] = useState<string | undefined>(undefined)

    const handleFilterChange = (event: SelectChangeEvent<typeof filterState>) => {
        const filters = filterState.length > 0 ? [] : ["Только непроверенные" as Filter]
        localStorage.setItem(FilterStorageKey, filters.join(", "))
        setFilterState(filters)
    }

    const showOnlyUnrated = filterState.some(x => x === "Только непроверенные")

    const {
        isLoaded,
        currentTaskId,
        taskStudentsSolutionsPreview,
        courseId,
        homeworkSolutionsStats,
        courseMentors
    } = studentSolutionsState

    const secondMentor = courseMentors.find(x => x.userId == secondMentorId)

    const currentTaskSolutionsPreview = taskStudentsSolutionsPreview.find(x => x.taskId === +currentTaskId)
    const currentTaskSolutions = currentTaskSolutionsPreview?.studentSolutionsPreview || []

    const allTaskSolutionsStats = homeworkSolutionsStats.flatMap(x => {
        if (!x.statsForHomeworks) return []
        const firstHomeworkTasks = x.statsForHomeworks[0]?.statsForTasks || []
        return x.statsForHomeworks.length === 1
            ? firstHomeworkTasks
            : firstHomeworkTasks.map((t, i) => ({
                ...t,
                title: "(" + x.groupTitle! + ") " + `Задача ${i + 1}`,
                countUnratedSolutions:
                    x.statsForHomeworks!
                        .map(h => h.statsForTasks![i])
                        .reduce((acc, cur) => acc + cur.countUnratedSolutions!, 0)
            }));
    })

    const taskSolutionsStats = showOnlyUnrated
        ? allTaskSolutionsStats.filter(x => x.taskId == +currentTaskId || x.countUnratedSolutions && x.countUnratedSolutions > 0)
        : allTaskSolutionsStats

    const studentSolutionsPreviews =
        taskStudentsSolutionsPreview.map(x => showOnlyUnrated
            ? ({
                taskId: x.taskId,
                studentSolutionsPreview: x.studentSolutionsPreview.filter(((data, i) => {
                    if (data.student.userId === currentStudentId) return true
                    const lastSolution = currentTaskSolutions[i].lastSolution
                    return lastSolution && lastSolution.state === SolutionState.NUMBER_0
                }))
            })
            : x)

    const currentFilteredStudentSolutionPreviews = studentSolutionsPreviews.find(x => x.taskId === +currentTaskId)?.studentSolutionsPreview || []
    const allSolutionsRated = currentTaskSolutions.findIndex(x => x.lastSolution && x.lastSolution.state === SolutionState.NUMBER_0) === -1

    const currentHomeworksGroup = homeworkSolutionsStats
        .find(x => x.statsForHomeworks!
            .some(h => h.statsForTasks!
                .some(t => t.taskId === +currentTaskId)))

    const homeworks = currentHomeworksGroup?.statsForHomeworks || []

    const versionOfTask = homeworks.findIndex(x => x.statsForTasks!.some(t => t.taskId === +currentTaskId))

    const taskIndexInHomework = versionOfTask === -1
        ? -1
        : homeworks[versionOfTask].statsForTasks!.findIndex(t => t.taskId === +currentTaskId)

    const versionsOfCurrentTask = taskIndexInHomework === -1
        ? []
        : homeworks.map(h => h.statsForTasks![taskIndexInHomework].taskId!)

    const getTaskData = async (taskId: string, secondMentorId: string | undefined, fullUpdate: boolean) => {
        const task = await ApiSingleton.tasksApi.tasksGetTask(+taskId!, true)

        if (!fullUpdate && versionsOfCurrentTask.includes(+taskId)) {
            setStudentSolutionsState({
                ...studentSolutionsState,
                task: task,
                isLoaded: true,
                currentTaskId: taskId,
            })
            return
        }

        const {
            taskSolutions,
            courseId,
            statsForTasks,
            courseMentors
        } = await ApiSingleton.solutionsApi.solutionsGetTaskSolutionsPageData(+taskId!, secondMentorId)

        const studentSolutionsPreview = taskSolutions!.map(ts => ({
            taskId: ts.taskId!,
            studentSolutionsPreview: ts.studentSolutions!.map(studentSolutions => {
                const ratedSolutionInfo = StudentStatsUtils.calculateLastRatedSolutionInfo(studentSolutions.solutions!, task.maxRating!)
                return {
                    hasDifferentReviewer: studentSolutions.hasDifferentReviewer!,
                    student: studentSolutions.student!, ...ratedSolutionInfo,
                    solutions: studentSolutions.solutions!
                }
            })
        }))

        setStudentSolutionsState({
            ...studentSolutionsState,
            task: task,
            isLoaded: true,
            currentTaskId: taskId,
            homeworkSolutionsStats: statsForTasks!,
            taskStudentsSolutionsPreview: studentSolutionsPreview,
            courseMentors: courseMentors!.filter(x => x.userId !== ApiSingleton.authService.getUserId()),
            courseId: courseId!
        })
    }

    useEffect(() => {
        appBarStateManager.setContextAction({actionName: "К курсу", link: `/courses/${courseId}/stats`})
        return () => appBarStateManager.reset()
    }, [courseId])

    useEffect(() => {
        getTaskData(taskId!, secondMentorId, false)
    }, [taskId])

    useEffect(() => {
        setCurrentStudentId(studentId!)
    }, [studentId])

    const courseStudents = currentTaskSolutions.map(x => x.student)
    const currentStudent = currentTaskSolutions.find(x => x.student.userId === currentStudentId)

    const renderUnratedSolutionsCountChip = (t: TaskSolutionsStats, isSelected: boolean) => {
        return t.countUnratedSolutions
            ? <Chip
                size={"small"}
                label={t.countUnratedSolutions}
                sx={isSelected ? unratedChipSelectedSx : unratedChipSx}/>
            : <TaskAltIcon sx={{fontSize: 19, flexShrink: 0, color: isSelected ? "#3f51b5" : "#2e9e5b"}}/>
    }

    const renderStudentListItem = (student: StudentDataDto, hasDifferentReviewer: boolean) => {
        const tags = student.characteristics?.tags || []

        const hasGoodCharacteristics = tags.some(x => x.startsWith("+"))
        const hasBadCharacteristics = tags.some(x => x.startsWith("-"))

        const studentFio = tags.some(x => x === RemovedFromCourseTag)
            ? <s>{student.surname + " " + student.name}</s>
            : student.surname + " " + student.name

        return <Box sx={{minWidth: 0}}>
            <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                <Typography sx={studentNameSx}>{studentFio}</Typography>
                {hasGoodCharacteristics && <ThumbUpIcon color={"success"} sx={{fontSize: 13, flexShrink: 0}}/>}
                {hasBadCharacteristics && <ThumbDownIcon color={"error"} sx={{fontSize: 13, flexShrink: 0}}/>}
            </Stack>
            {hasDifferentReviewer && secondMentor &&
                <Typography variant={"caption"} sx={{display: "block", color: "text.secondary", lineHeight: 1.3}}>
                    {secondMentor.name} {secondMentor.surname}
                </Typography>}
        </Box>
    }

    const {courseFilesState} = FilesUploadWaiter(courseId, CourseUnitType.Solution, false);

    if (isLoaded) {
        return (
            <div className={"container"} style={{marginBottom: '50px', marginTop: '15px'}}>
                <Stack direction={"column"} spacing={2}>
                    <Paper variant={"outlined"} sx={panelSx}>
                        <Stack direction={"row"} alignItems={"center"} spacing={1} sx={panelHeaderSx}>
                            <AssignmentOutlinedIcon fontSize={"small"}/>
                            <Typography variant={"body2"} sx={{fontWeight: 500}}>Задачи</Typography>
                            <Chip size={"small"} label={taskSolutionsStats.length} sx={headerChipSx}/>
                            <Box sx={{flexGrow: 1}}/>
                            {showOnlyUnrated &&
                                <Chip size={"small"} icon={<FilterAltOutlinedIcon/>} label={"Только непроверенные"}
                                      sx={filterChipSx}/>}
                        </Stack>
                        <Divider/>
                        <Box sx={taskStripSx}>
                            <Stack direction={"row"} alignItems={"center"} spacing={0}>
                                {taskSolutionsStats!.map((t, index) => {
                                    const isCurrent = versionsOfCurrentTask.includes(t.taskId!)
                                    return <Stack key={index} direction={"row"} alignItems={"center"} spacing={0}>
                                        {index > 0 && <Box sx={taskStripConnectorSx}/>}
                                        <Link to={`/task/${t.taskId}/${currentStudentId}`}
                                              style={{textDecoration: "none"}}>
                                            <Stack
                                                ref={ref => {
                                                    if (isCurrent) ref?.scrollIntoView({inline: "nearest"})
                                                }}
                                                direction={"row"}
                                                alignItems={"center"}
                                                spacing={1}
                                                sx={taskPillSx(isCurrent)}>
                                                {renderUnratedSolutionsCountChip(t, isCurrent)}
                                                <Typography sx={taskPillLabelSx(isCurrent)}>
                                                    {t.title}{getTip(t)}
                                                </Typography>
                                            </Stack>
                                        </Link>
                                    </Stack>;
                                })}
                            </Stack>
                        </Box>
                    </Paper>
                    {allSolutionsRated &&
                        <Alert severity="success" icon={<TaskAltIcon fontSize={"small"}/>} sx={alertSx}>
                            Все решения на данный момент проверены!
                        </Alert>}
                    <Stack direction={{xs: "column", md: "row"}} spacing={2} alignItems={"flex-start"}>
                        <Box sx={columnSx(4, 3)}>
                            <Paper variant={"outlined"} sx={panelSx}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={panelHeaderSx}>
                                    <PeopleOutlineIcon fontSize={"small"}/>
                                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Студенты</Typography>
                                    <Chip size={"small"} label={currentFilteredStudentSolutionPreviews.length}
                                          sx={headerChipSx}/>
                                </Stack>
                                <Divider/>
                                <Stack direction={"column"} spacing={1} sx={filterBarSx}>
                                    {courseMentors.length > 0 && <Autocomplete
                                        fullWidth
                                        freeSolo={false}
                                        size={"small"}
                                        sx={inputSx}
                                        options={courseMentors}
                                        getOptionLabel={(option) => option.name! + ' ' + option.surname!}
                                        value={secondMentor}
                                        onChange={async (_, newValue) => {
                                            setSecondMentorId(newValue?.userId)
                                            await getTaskData(currentTaskId, newValue?.userId, true)
                                        }}
                                        renderInput={params => <TextField
                                            {...params}
                                            label="Другие решения"
                                            placeholder="Выберите преподавателя"
                                        />}
                                    />}
                                    <FormControlLabel
                                        sx={{m: 0, alignSelf: "flex-start"}}
                                        control={
                                            <Checkbox
                                                size={"small"}
                                                onChange={handleFilterChange}
                                                checked={filterState.includes("Только непроверенные")}/>
                                        }
                                        label={
                                            <Typography variant={"body2"}>Только непроверенные</Typography>
                                        }
                                    />
                                </Stack>
                                <Divider/>
                                <Box sx={listScrollSx}>
                                    <Stack direction={"column"} spacing={0.5}>
                                        {currentFilteredStudentSolutionPreviews!.map((
                                            {
                                                lastSolution,
                                                color,
                                                solutionsDescription,
                                                lastRatedSolution,
                                                student,
                                                hasDifferentReviewer
                                            }, idx) => {
                                            const {userId} = student
                                            const storageKey = {
                                                taskId: +currentTaskId,
                                                studentId: userId!,
                                                solutionId: lastSolution?.id
                                            }
                                            const taskVersionsSolutions = studentSolutionsPreviews.map(x => x.studentSolutionsPreview[idx])
                                            const maxStudentRating = Math.max(...taskVersionsSolutions.map(x => x.lastRatedSolution?.rating || -1))
                                            const ratingStorageValue = RatingStorage.tryGet(storageKey)
                                            return <Link key={idx} to={`/task/${currentTaskId}/${(userId)!}`}
                                                         style={{color: "inherit", textDecoration: "none"}}>
                                                <ListItemButton
                                                    key={idx}
                                                    disableGutters
                                                    disableTouchRipple={currentStudentId === userId}
                                                    selected={currentStudentId === userId || currentStudent?.lastSolution?.groupMates?.some(x => x.userId === userId)}
                                                    sx={studentRowSx}>
                                                    <Stack direction={"row"} alignItems={"center"} spacing={1}
                                                           sx={{width: "100%", minWidth: 0}}>
                                                        <UserInitialsAvatar
                                                            user={{
                                                                name: student.name,
                                                                surname: student.surname,
                                                                githubId: student.githubId
                                                            }}
                                                            size={30}
                                                            fontSize={"0.7rem"}/>
                                                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                                                            {renderStudentListItem(student, hasDifferentReviewer)}
                                                        </Box>
                                                        {versionsOfCurrentTask.length > 1 &&
                                                            <Tooltip arrow disableInteractive
                                                                     title={<span
                                                                         style={{whiteSpace: 'pre-line'}}>Максимальная последняя оценка студента среди всех версий задачи</span>}
                                                            >
                                                                <Chip
                                                                    color={undefined}
                                                                    size={"small"}
                                                                    sx={maxRatingChipSx}
                                                                    label={maxStudentRating === -1 ? "?" : maxStudentRating}/>
                                                            </Tooltip>}
                                                        {ratingStorageValue
                                                            ? <Tooltip arrow disableInteractive enterDelay={1000}
                                                                       title={"Решение частично проверено"}>
                                                                <EditIcon sx={{fontSize: 18, flexShrink: 0}}
                                                                          color={"primary"}/>
                                                            </Tooltip>
                                                            : <Tooltip arrow disableInteractive enterDelay={1000}
                                                                       title={<span
                                                                           style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>

                                                                <Chip style={{backgroundColor: color}}
                                                                      size={"small"}
                                                                      sx={ratingChipSx}
                                                                      label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating}/>
                                                            </Tooltip>}
                                                    </Stack>
                                                </ListItemButton>
                                            </Link>
                                        })}
                                    </Stack>
                                </Box>
                            </Paper>
                        </Box>
                        <Box sx={columnSx(8, 9)}>
                            <Stack direction={"column"} spacing={2}>
                                {currentHomeworksGroup && taskIndexInHomework !== -1 && currentHomeworksGroup.statsForHomeworks!.length > 1 &&
                                    <Paper variant={"outlined"} sx={panelSx}>
                                        <Tabs
                                            onChange={(_, value) => navigate(`/task/${currentHomeworksGroup!.statsForHomeworks![value].statsForTasks![taskIndexInHomework]!.taskId!}/${currentStudentId}`)}
                                            defaultValue={currentHomeworksGroup!.statsForHomeworks!.length - 1}
                                            variant="scrollable"
                                            scrollButtons={"auto"}
                                            value={versionOfTask}
                                            indicatorColor="primary"
                                            sx={tabsSx}
                                        >
                                            {currentHomeworksGroup.statsForHomeworks?.map((h, i) => <Tab
                                                key={i}
                                                sx={tabSx}
                                                label={<Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                    {renderUnratedSolutionsCountChip(h.statsForTasks![taskIndexInHomework], i === versionOfTask)}
                                                    <div>{h.homeworkTitle}</div>
                                                </Stack>}/>)}
                                        </Tabs>
                                    </Paper>
                                }
                                <Box>
                                    <Task
                                        task={studentSolutionsState.task}
                                        forStudent={false}
                                        forMentor={true}
                                        isReadingMode={true}
                                        onDeleteClick={() => 0}
                                        isExpanded={false}
                                        showForCourse={false}
                                    />
                                    <TaskSolutions
                                        courseId={courseId}
                                        forMentor={true}
                                        task={studentSolutionsState.task}
                                        solutions={currentStudent?.solutions || []}
                                        student={currentStudent?.student}
                                        courseStudents={courseStudents}
                                        onSolutionRateClick={async () => {
                                            //const nextStudentIndex = studentSolutionsPreview.findIndex(x => x.student.userId !== currentStudentId && x.lastSolution && x.lastSolution.state === Solution.StateEnum.NUMBER_0)
                                            await getTaskData(currentTaskId, secondMentorId, true)
                                            //else navigate(`/task/${currentTaskId}/${studentSolutionsPreview[nextStudentIndex].student.userId}`)
                                        }}
                                        courseFiles={courseFilesState.courseFiles}
                                        processingFiles={courseFilesState.processingFilesState}
                                    />
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>
            </div>
        )
    }

    return (
        <div className={"container"}>
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    )
}

export default StudentSolutionsPage
