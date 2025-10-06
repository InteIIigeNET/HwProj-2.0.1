import * as React from "react";
import {FC, useEffect, useState} from "react";
import {
    GetSolutionModel, HomeworksGroupSolutionStats,
    HomeworkTaskViewModel,
    Solution,
    TaskSolutionsStats,
    SolutionState, StudentDataDto, AccountDataDto, FileInfoDTO
} from "@/api";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {Grid, Tabs, Tab} from "@material-ui/core";
import {Link, useNavigate, useParams} from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EditIcon from '@mui/icons-material/Edit';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {
    Alert,
    Chip,
    List,
    ListItemButton,
    ListItemText,
    SelectChangeEvent,
    Stack,
    Tooltip,
    Checkbox,
    Autocomplete,
    AutocompleteRenderInputParams,
    TextField
} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";

import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import {RatingStorage} from "../Storages/RatingStorage";
import {getTip} from "../Common/HomeworkTags";
import {appBarStateManager} from "../AppBar";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {RemovedFromCourseTag} from "@/components/Common/StudentTags";
import AuthService from "@/services/AuthService";
import {ICourseFilesState} from "@/components/Courses/Course";
import {enqueueSnackbar} from "notistack";
import ErrorsHandler from "@/components/Utils/ErrorsHandler";

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
            lastRatedSolution: Solution,
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

    const [courseFilesState, setCourseFilesState] = useState<ICourseFilesState>({
        processingFilesState: {},
        courseFiles: []
    })

    const getCourseFilesInfo = async () => {
        let courseFilesInfo = [] as FileInfoDTO[]
        try {
            courseFilesInfo = await ApiSingleton.filesApi.filesGetFilesInfo(+courseId!)
        } catch (e) {
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 1990});
        }
        setCourseFilesState(prevState => ({
            ...prevState,
            courseFiles: courseFilesInfo
        }))
    }
    useEffect(() => {
        getCourseFilesInfo()
    })

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
        const task = await ApiSingleton.tasksApi.tasksGetTask(+taskId!)

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
            ? <Chip size={"small"} color={isSelected ? "primary" : "default"}
                    label={t.countUnratedSolutions}/>
            : <TaskAltIcon color={isSelected ? "primary" : "success"}/>
    }

    const renderStudentListItem = (student: StudentDataDto, hasDifferentReviewer: boolean) => {
        const tags = student.characteristics?.tags || []

        const hasGoodCharacteristics = tags.some(x => x.startsWith("+"))
        const hasBadCharacteristics = tags.some(x => x.startsWith("-"))

        const studentFio = tags.some(x => x === RemovedFromCourseTag)
            ? <s>{student.surname + " " + student.name}</s>
            : student.surname + " " + student.name

        return <div>{studentFio}
            <sup style={{paddingLeft: 5}}>
                {hasGoodCharacteristics && <ThumbUpIcon color={"success"} style={{fontSize: 14}}/>}
                {hasBadCharacteristics && <ThumbDownIcon color={"error"} style={{fontSize: 14}}/>}
            </sup>
            {hasDifferentReviewer && secondMentor && <Typography
                style={{
                    color: "GrayText",
                    fontSize: "12px",
                    lineHeight: '1.2'
                }}
            >
                {secondMentor.name} {secondMentor.surname}
            </Typography>}
        </div>
    }

    if (isLoaded) {
        return (
            <div className={"container"} style={{marginBottom: '50px', marginTop: '15px'}}>
                <Grid container direction={"column"} justifyContent="center" alignContent={"stretch"} spacing={2}>
                    <Grid item container>
                        <Stack direction={"row"} spacing={1} minWidth={"100%"}
                               style={{overflowY: "hidden", overflowX: "auto", minHeight: 80}}>
                            {taskSolutionsStats!.map((t, index) => {
                                const isCurrent = versionsOfCurrentTask.includes(t.taskId!)
                                const color = isCurrent ? "primary" : "default"
                                return <Stack key={index} direction={"row"} spacing={1} alignItems={"center"}>
                                    {index > 0 && <hr style={{width: 100}}/>}
                                    <Step active={isCurrent}>
                                        <Link to={`/task/${t.taskId}/${currentStudentId}`}
                                              style={{color: "black", textDecoration: "none"}}>
                                            <StepButton
                                                ref={ref => {
                                                    if (isCurrent) ref?.scrollIntoView({inline: "nearest"})
                                                }}
                                                color={color}
                                                icon={renderUnratedSolutionsCountChip(t, isCurrent)}>
                                                {t.title}{getTip(t)}
                                            </StepButton>
                                        </Link>
                                    </Step>
                                </Stack>;
                            })}
                        </Stack>
                        {allSolutionsRated &&
                            <Grid item xs={12}>
                                <Alert severity="success">
                                    Все решения на данный момент
                                    проверены!
                                </Alert>
                            </Grid>}
                    </Grid>
                </Grid>
                <Grid container spacing={3} style={{marginTop: '1px'}} direction={"row"}>
                    <Grid item xs={12} sm={12} md={4} lg={3}>
                        {courseMentors.length > 0 && <Autocomplete
                            fullWidth
                            freeSolo={false}
                            size={"medium"}
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
                        <Stack direction={"row"} alignItems={"center"}>
                            <Checkbox
                                onChange={handleFilterChange}
                                checked={filterState.includes("Только непроверенные")}/>
                            <Typography>Только непроверенные</Typography>
                        </Stack>
                        <List>
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
                                             style={{color: "black", textDecoration: "none"}}>
                                    <ListItemButton key={idx} disableGutters divider
                                                    disableTouchRipple={currentStudentId === userId}
                                                    selected={currentStudentId === userId || currentStudent?.lastSolution?.groupMates?.some(x => x.userId === userId)}>
                                        <Stack direction={"row"} spacing={1} sx={{paddingLeft: 1}}>
                                            {versionsOfCurrentTask.length > 1 &&
                                                <Tooltip arrow disableInteractive
                                                         title={<span style={{whiteSpace: 'pre-line'}}>Максимальная последняя оценка студента среди всех версий задачи</span>}
                                                >
                                                    <Chip
                                                        color={undefined}
                                                        size={"small"}
                                                        label={maxStudentRating === -1 ? "?" : maxStudentRating}/>
                                                </Tooltip>}
                                            {ratingStorageValue
                                                ? <Tooltip arrow disableInteractive enterDelay={1000}
                                                           title={"Решение частично проверено"}>
                                                    <EditIcon fontSize={"small"} color={"primary"}/>
                                                </Tooltip>
                                                : <Tooltip arrow disableInteractive enterDelay={1000} title={<span
                                                    style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>

                                                    <Chip style={{backgroundColor: color}}
                                                          size={"small"}
                                                          label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating}/>
                                                </Tooltip>}
                                            <ListItemText
                                                key={student.userId}
                                                primary={renderStudentListItem(student, hasDifferentReviewer)}/>
                                        </Stack>
                                    </ListItemButton>
                                </Link>
                            })}
                        </List>
                    </Grid>
                    <Grid item xs={12} sm={12} md={8} lg={9} spacing={2}>
                        {currentHomeworksGroup && taskIndexInHomework !== -1 && currentHomeworksGroup.statsForHomeworks!.length > 1 &&
                            <Tabs
                                onChange={(_, value) => navigate(`/task/${currentHomeworksGroup!.statsForHomeworks![value].statsForTasks![taskIndexInHomework]!.taskId!}/${currentStudentId}`)}
                                defaultValue={currentHomeworksGroup!.statsForHomeworks!.length - 1}
                                variant="scrollable"
                                scrollButtons={"auto"}
                                value={versionOfTask}
                                indicatorColor="primary"
                            >
                                {currentHomeworksGroup.statsForHomeworks?.map((h, i) => <Tab
                                    style={{textTransform: "none"}}
                                    label={<Stack direction={"row"} spacing={1} alignItems={"center"}>
                                        {renderUnratedSolutionsCountChip(h.statsForTasks![taskIndexInHomework], i === versionOfTask)}
                                        <div>{h.homeworkTitle}</div>
                                    </Stack>}/>)}
                            </Tabs>
                        }
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
                        />
                    </Grid>
                </Grid>
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
