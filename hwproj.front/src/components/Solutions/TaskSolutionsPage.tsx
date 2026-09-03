import * as React from "react";
import {FC, useEffect, useState} from "react";
import Task from "../Tasks/Task";
import Typography from "@mui/material/Typography";
import AddOrEditSolution from "./AddOrEditSolution";
import Button from "@mui/material/Button";
import TaskSolutions from "./TaskSolutions";
import {AccountDataDto, HomeworksGroupUserTaskSolutions, HomeworkTaskViewModel, SolutionDto, SolutionState} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import {Box, Divider, Paper, Tab, Tabs} from "@mui/material";
import {Checkbox, Chip, FormControlLabel, SelectChangeEvent, Stack, Tooltip} from "@mui/material";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {Link, useNavigate, useParams} from "react-router-dom";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {getTip} from "../Common/HomeworkTags";
import Lodash from "lodash";
import {appBarStateManager} from "../AppBar";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";
import {CourseUnitType} from "@/components/Files/CourseUnitType";

interface ITaskSolutionsState {
    isLoaded: boolean
    addSolution: boolean
    courseId: number
    homeworkGroupedSolutions: HomeworksGroupUserTaskSolutions[]
    courseMates: AccountDataDto[]
}

type Filter = "Только нерешенные"
const FilterStorageKey = "TaskSolutionsPage"

// Оформление согласовано с редизайном страницы решений студента: та же рамка, радиусы и мягкие шапки
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

// Цвет оценки приходит из ведомости инлайном, поэтому чипу задаём только рамку и ровные цифры
const ratingChipSx = {
    height: 22,
    minWidth: 26,
    flexShrink: 0,
    border: "1px solid #d5d9e6",
    fontVariantNumeric: "tabular-nums",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.8125rem", fontWeight: 500},
}

const filterBarSx = {
    px: 1.5,
    py: 1.25,
    backgroundColor: "#fafbfe",
}

const actionButtonSx = {
    textTransform: "none",
    borderRadius: "10px",
    fontWeight: 500,
    px: 2,
    flexShrink: 0,
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

const TaskSolutionsPage: FC = () => {
    const {taskId} = useParams()
    const navigate = useNavigate()

    const userId = ApiSingleton.authService.getUserId()
    const [task, setTask] = useState<HomeworkTaskViewModel>({})
    const [taskSolutionPage, setTaskSolutionPage] = useState<ITaskSolutionsState>({
        isLoaded: false,
        courseId: 0,
        addSolution: false,
        homeworkGroupedSolutions: [],
        courseMates: []
    })

    const [filterState, setFilterState] = React.useState<Filter[]>(
        localStorage.getItem(FilterStorageKey)?.split(", ").filter(x => x !== "").map(x => x as Filter) || []
    )
    const handleFilterChange = (event: SelectChangeEvent<typeof filterState>) => {
        const filters = filterState.length > 0 ? [] : ["Только нерешенные" as Filter]
        localStorage.setItem(FilterStorageKey, filters.join(", "))
        setFilterState(filters)
    }

    const showOnlyNotSolved = filterState.some(x => x === "Только нерешенные")

    useEffect(() => {
        getSolutions()
    }, [])

    useEffect(() => {
        getTask()
    }, [taskId])

    const getTask = async () => {
        const task = await ApiSingleton.tasksApi.tasksGetTask(+taskId!)
        setTask(task)
    }

    const getSolutions = async () => {
        const pageData = await ApiSingleton.solutionsApi.solutionsGetStudentSolution(+taskId!, userId);
        setTaskSolutionPage({
            isLoaded: true,
            addSolution: false,
            courseId: pageData.courseId!,
            homeworkGroupedSolutions: pageData.taskSolutions!,
            courseMates: pageData.courseMates!,
        })
    }

    const {homeworkGroupedSolutions, courseId, courseMates} = taskSolutionPage
    const student = courseMates.find(x => x.userId === userId)!

    useEffect(() => {
        appBarStateManager.setContextAction({actionName: "К курсу", link: `/courses/${courseId}`})
        return () => appBarStateManager.reset()
    }, [courseId])

    //TODO: unify
    const taskSolutionsWithPreview = homeworkGroupedSolutions
        .map(x => ({
            ...x,
            homeworkSolutions: x.homeworkSolutions!.map(t =>
                ({
                    homeworkTitle: t.homeworkTitle,
                    previews: t.studentSolutions!.map(y =>
                        ({...y, ...StudentStatsUtils.calculateLastRatedSolutionInfo(y.solutions!, y.maxRating!)}))
                }))
        }))

    const taskSolutionsPreview = taskSolutionsWithPreview.flatMap(x => {
        if (!x.homeworkSolutions) return []
        const firstHomeworkTasks = x.homeworkSolutions[0]?.previews || []
        return firstHomeworkTasks.map((t, i) => {
            const solutions = Lodash(x.homeworkSolutions).maxBy(h => h.previews![i].lastRatedSolution?.rating || -1)
            const preview = solutions!.previews[i]
            return ({
                lastRatedSolution: preview.lastRatedSolution,
                color: preview.color,
                taskId: preview.taskId,
                lastSolution: preview.lastSolution,
                solutionsDescription: preview.solutionsDescription,
                tags: preview.tags,
                title: x.homeworkSolutions.length === 1 ? preview.title : "(" + x.groupTitle! + ") " + `Задача ${i + 1}`,
            });
        });
    })

    const {
        courseFilesState,
        updateCourseUnitFiles,
    } = FilesUploadWaiter(courseId, CourseUnitType.Solution, false);

    const currentHomeworksGroup = taskSolutionsWithPreview
        .find(x => x.homeworkSolutions!
            .some(h => h.previews!
                .some(t => t.taskId === taskId)))

    const homeworkSolutions = currentHomeworksGroup?.homeworkSolutions || []

    const versionOfTask = homeworkSolutions.findIndex(x => x.previews!.some(t => t.taskId === taskId))

    const taskIndexInHomework = versionOfTask === -1
        ? -1
        : homeworkSolutions[versionOfTask].previews!.findIndex(t => t.taskId === taskId)

    const versionsOfCurrentTask = taskIndexInHomework === -1
        ? []
        : homeworkSolutions.map(h => h.previews![taskIndexInHomework].taskId!)

    const currentTaskSolutions = taskIndexInHomework === -1 ? [] : homeworkSolutions[versionOfTask].previews[taskIndexInHomework].solutions!
    const lastSolution = currentTaskSolutions[currentTaskSolutions.length - 1]

    const taskSolutionsPreviewFiltered = showOnlyNotSolved
        ? taskSolutionsPreview.filter(x => x.lastSolution === undefined)
        : taskSolutionsPreview

    const onCancelAddSolution = () => {
        setTaskSolutionPage((prevState) => ({
            ...prevState,
            addSolution: false,
        }))
    }

    const renderRatingChip = (solutionsDescription: string, color: string, lastRatedSolution: SolutionDto) => {
        return <Tooltip arrow disableInteractive enterDelay={1000} title={<span
            style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>
            <Chip style={{backgroundColor: color}}
                  size={"small"}
                  sx={ratingChipSx}
                  label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating}/>
        </Tooltip>
    }

    const isEdit = lastSolution?.state === SolutionState.NUMBER_0

    return taskSolutionPage.isLoaded ? <div className={"container"}
                                            style={{marginBottom: '50px', marginTop: '15px'}}>
        <Stack direction={"column"} spacing={2}>
            <Paper variant={"outlined"} sx={panelSx}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={panelHeaderSx}>
                    <AssignmentOutlinedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Задачи</Typography>
                    <Chip size={"small"} label={taskSolutionsPreviewFiltered.length} sx={headerChipSx}/>
                </Stack>
                <Divider/>
                <Box sx={taskStripSx}>
                    {taskSolutionsPreviewFiltered.length === 0
                        ? <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                            Нерешённых задач нет.
                        </Typography>
                        : <Stack direction={"row"} alignItems={"center"} spacing={0}>
                            {taskSolutionsPreviewFiltered.map((t, index) => {
                                const isCurrent = versionsOfCurrentTask.includes(t.taskId!)
                                const {color, lastRatedSolution, solutionsDescription} = t
                                return <Stack key={t.taskId} direction={"row"} alignItems={"center"} spacing={0}>
                                    {index > 0 && <Box sx={taskStripConnectorSx}/>}
                                    <Link to={`/task/${t.taskId}`} style={{textDecoration: "none"}}>
                                        <Stack
                                            ref={ref => {
                                                if (isCurrent) ref?.scrollIntoView({inline: "nearest"})
                                            }}
                                            direction={"row"}
                                            alignItems={"center"}
                                            spacing={1}
                                            sx={taskPillSx(isCurrent)}>
                                            {renderRatingChip(solutionsDescription, color, lastRatedSolution)}
                                            <Typography sx={taskPillLabelSx(isCurrent)}>
                                                {t.title}{getTip(t)}
                                            </Typography>
                                        </Stack>
                                    </Link>
                                </Stack>;
                            })}
                        </Stack>}
                </Box>
                <Divider/>
                <Stack
                    direction={{xs: "column", sm: "row"}}
                    spacing={1}
                    alignItems={{xs: "stretch", sm: "center"}}
                    justifyContent={"space-between"}
                    sx={filterBarSx}
                >
                    <FormControlLabel
                        sx={{m: 0, alignSelf: "flex-start"}}
                        control={
                            <Checkbox
                                size={"small"}
                                onChange={handleFilterChange}
                                checked={filterState.includes("Только нерешенные")}/>
                        }
                        label={<Typography variant={"body2"}>Только нерешенные</Typography>}
                    />
                    {task.canSendSolution && <Button
                        variant="contained"
                        color="primary"
                        disableElevation
                        startIcon={isEdit ? <EditOutlinedIcon/> : <AddCircleOutlineIcon/>}
                        sx={actionButtonSx}
                        onClick={(e) => {
                            e.persist()
                            setTaskSolutionPage((prevState) => ({
                                ...prevState,
                                addSolution: true,
                            }))
                        }}
                    >
                        {isEdit ? "Изменить решение" : "Добавить решение"}
                    </Button>}
                </Stack>
            </Paper>
            {currentHomeworksGroup && taskIndexInHomework !== -1 && currentHomeworksGroup.homeworkSolutions!.length > 1 &&
                <Paper variant={"outlined"} sx={panelSx}>
                    <Tabs
                        onChange={(_, value) => navigate(`/task/${currentHomeworksGroup!.homeworkSolutions![value].previews[taskIndexInHomework]!.taskId!}`)}
                        variant="scrollable"
                        scrollButtons={"auto"}
                        value={versionOfTask}
                        indicatorColor="primary"
                        sx={tabsSx}
                    >
                        {currentHomeworksGroup.homeworkSolutions?.map((h, i) => {
                            const {
                                color,
                                lastRatedSolution,
                                solutionsDescription
                            } = h.previews[taskIndexInHomework]!
                            return <Tab
                                key={i}
                                sx={tabSx}
                                label={<Stack direction={"row"} spacing={1} alignItems={"center"}>
                                    {renderRatingChip(solutionsDescription, color, lastRatedSolution)}
                                    <div>{h.homeworkTitle}</div>
                                </Stack>}/>;
                        })}
                    </Tabs>
                </Paper>
            }
            <Box>
                <Task
                    task={task}
                    forStudent={true}
                    forMentor={false}
                    isReadingMode={true}
                    onDeleteClick={() => 3}
                    isExpanded={false}
                    showForCourse={false}
                />
                {!taskSolutionPage.addSolution &&
                    <TaskSolutions
                        courseId={courseId}
                        task={task}
                        forMentor={false}
                        student={student}
                        courseStudents={[student]}
                        solutions={currentTaskSolutions}
                        courseFiles={courseFilesState.courseFiles}
                        processingFiles={courseFilesState.processingFilesState}
                    />}
            </Box>
        </Stack>
        {taskSolutionPage.addSolution && <AddOrEditSolution
            courseId={courseId}
            userId={userId}
            task={task}
            onAdd={getSolutions}
            onCancel={onCancelAddSolution}
            lastSolution={lastSolution}
            students={courseMates}
            supportsGroup={task.isGroupWork!}
            courseFilesInfo={courseFilesState.courseFiles}
            onStartProcessing={updateCourseUnitFiles}
        />}
    </div> : (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    );
}

export default TaskSolutionsPage
