import * as React from "react";
import {FC, useEffect, useState} from "react";
import {AccountDataDto, GetSolutionModel, HomeworkTaskViewModel, Solution, TaskSolutionsStats} from "../../api/";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {CircularProgress, Grid} from "@material-ui/core";
import {Link, useNavigate, useParams} from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
    Alert,
    Chip,
    FormControl,
    InputLabel,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Stack,
    Tooltip
} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";

import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';

interface IStudentSolutionsPageState {
    currentTaskId: string
    currentStudentId: string
    task: HomeworkTaskViewModel
    isLoaded: boolean
    allSolutionsRated: boolean,
    courseId: number,
    allTaskSolutionsStats: TaskSolutionsStats[],
    allStudentSolutionsPreview: {
        student: AccountDataDto,
        solutions: GetSolutionModel[]
        lastSolution: Solution,
        lastRatedSolution: Solution,
        color: string,
        ratedSolutionsCount: number,
        solutionsDescription: string
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

    const [studentSolutionsState, setStudentSolutionsState] = useState<IStudentSolutionsPageState>({
        currentTaskId: "",
        currentStudentId: studentId!,
        allSolutionsRated: false,
        task: {},
        isLoaded: false,
        courseId: -1,
        allTaskSolutionsStats: [],
        allStudentSolutionsPreview: [],
    })
    const [filterState, setFilterState] = React.useState<Filter[]>(
        localStorage.getItem(FilterStorageKey)?.split(", ").filter(x => x != "").map(x => x as Filter) || []
    )
    console.log(filterState)
    const handleFilterChange = (event: SelectChangeEvent<typeof filterState>) => {
        const {target: {value}} = event
        const filters = filterState.length > 0 ? [] : ["Только непроверенные" as Filter]
        localStorage.setItem(FilterStorageKey, filters.join(", "))
        setFilterState(filters)
    }

    const showOnlyUnrated = filterState.some(x => x === "Только непроверенные")

    const {
        isLoaded,
        currentStudentId,
        currentTaskId,
        allStudentSolutionsPreview,
        allSolutionsRated,
        courseId,
        allTaskSolutionsStats
    } = studentSolutionsState

    const taskSolutionsStats = showOnlyUnrated
        ? allTaskSolutionsStats.filter(x => x.countUnratedSolutions && x.countUnratedSolutions > 0)
        : allTaskSolutionsStats

    const studentSolutionsPreview = showOnlyUnrated
        ? allStudentSolutionsPreview.filter(x => x.lastSolution && x.lastSolution.state === Solution.StateEnum.NUMBER_0)
        : allStudentSolutionsPreview

    const getTaskData = async (taskId: string, studentId: string) => {
        const fullUpdate = currentTaskId !== taskId
        const task = fullUpdate
            ? await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+taskId!)
            : studentSolutionsState.task

        const {
            studentsSolutions,
            courseId,
            statsForTasks
        } = await ApiSingleton.solutionsApi.apiSolutionsTasksByTaskIdGet(+taskId!, studentId)

        const studentSolutionsPreview = studentsSolutions!.map(studentSolutions => {
            const ratedSolutionInfo = StudentStatsUtils.calculateLastRatedSolutionInfo(studentSolutions.solutions!, task.maxRating!)
            return {student: studentSolutions.user!, ...ratedSolutionInfo, solutions: studentSolutions.solutions!}
        })

        setStudentSolutionsState({
            ...studentSolutionsState,
            task: task,
            isLoaded: true,
            currentStudentId: studentId,
            currentTaskId: taskId,
            allTaskSolutionsStats: statsForTasks!,
            allStudentSolutionsPreview: studentSolutionsPreview,
            courseId: courseId!,
            allSolutionsRated: studentSolutionsPreview.findIndex(x => x.lastSolution && x.lastSolution.state === Solution.StateEnum.NUMBER_0) === -1
        })
    }

    useEffect(() => {
        getTaskData(taskId!, studentId!)
    }, [taskId, studentId])

    const currentStudent = studentSolutionsPreview.find(x => x.student.userId === currentStudentId)
    const renderGoBackToCoursesStatsLink = () => {
        return <Link
            to={`/courses/${courseId}/stats`}
            style={{color: '#212529'}}
        >
            <Typography>
                Назад к курсу
            </Typography>
        </Link>
    }

    if (isLoaded) {
        return (
            <div className={"container"} style={{marginBottom: '50px', marginTop: '15px'}}>
                <Grid direction={"column"} justifyContent="center" alignContent={"stretch"} spacing={2}>
                    <Stack direction={"row"} spacing={1}
                           style={{overflowY: "hidden", overflowX: "auto", minHeight: 80}}>
                        {taskSolutionsStats!.map((t, index) => {
                            const isCurrent = taskId === String(t.taskId)
                            const color = isCurrent ? "primary" : "default"
                            return <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                {index > 0 && <hr style={{width: 100}}/>}
                                <Step active={isCurrent}>
                                    <Link to={`/task/${t.taskId}/${currentStudentId}`}
                                          style={{color: "black", textDecoration: "none"}}>
                                        <StepButton
                                            ref={ref => {
                                                if (isCurrent) ref?.scrollIntoView({inline: "nearest"})
                                            }}
                                            color={color}
                                            icon={t.countUnratedSolutions
                                                ? <Chip size={"small"} color={isCurrent ? "primary" : "default"}
                                                        label={t.countUnratedSolutions}/>
                                                : <TaskAltIcon color={isCurrent ? "primary" : "success"}/>}>
                                            {t.title}
                                        </StepButton>
                                    </Link>
                                </Step>
                            </Stack>;
                        })}
                    </Stack>
                    {allSolutionsRated && <Alert severity="success" action={renderGoBackToCoursesStatsLink()}>
                        Все решения на данный момент
                        проверены!
                    </Alert>}
                </Grid>
                <Grid container spacing={3} style={{marginTop: '1px'}}>
                    <Grid item xs={3}>
                        <FormControl fullWidth>
                            <InputLabel>Фильтр</InputLabel>
                            <Select
                                size={"medium"}
                                value={filterState}
                                onChange={handleFilterChange}
                                input={<OutlinedInput label="Фильтр"/>}
                                MenuProps={FilterProps}
                            >
                                <MenuItem key="Только непроверенные" value={"Только непроверенные" as Filter}>
                                    Только непроверенные
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <List>
                            {studentSolutionsPreview!.map(({
                                                               color,
                                                               solutionsDescription,
                                                               lastRatedSolution, student: {
                                    name,
                                    surname,
                                    userId
                                }
                                                           }) =>
                                <Link to={`/task/${currentTaskId}/${(userId)!}`}
                                      style={{color: "black", textDecoration: "none"}}>
                                    <ListItemButton disableGutters divider
                                                    disableTouchRipple={currentStudentId === userId}
                                                    selected={currentStudentId === userId}>
                                        <Stack direction={"row"} spacing={1} sx={{paddingLeft: 1}}>
                                            <Tooltip arrow disableInteractive enterDelay={1000} title={<span
                                                style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>
                                                <Chip style={{backgroundColor: color}}
                                                      size={"small"}
                                                      label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating}/>
                                            </Tooltip>
                                            <ListItemText primary={surname + " " + name}/>
                                        </Stack>
                                    </ListItemButton>
                                </Link>)}
                        </List>
                        {renderGoBackToCoursesStatsLink()}
                    </Grid>
                    <Grid item xs={9} spacing={2} justifyContent={"flex-start"}>
                        <Task
                            task={studentSolutionsState.task}
                            forStudent={false}
                            forMentor={true}
                            isReadingMode={true}
                            onDeleteClick={() => 0}
                            isExpanded={false}
                            showForCourse={false}
                        />
                        {currentStudent && <TaskSolutions
                            forMentor={true}
                            task={studentSolutionsState.task}
                            solutions={currentStudent!.solutions}
                            student={currentStudent!.student}
                            onSolutionRateClick={async () => {
                                const nextStudentIndex = studentSolutionsPreview.findIndex(x => x.student.userId !== currentStudentId && x.lastSolution && x.lastSolution.state === Solution.StateEnum.NUMBER_0)
                                if (nextStudentIndex === -1) await getTaskData(currentTaskId, currentStudentId)
                                else navigate(`/task/${currentTaskId}/${studentSolutionsPreview[nextStudentIndex].student.userId}`)
                            }}
                        />}
                    </Grid>
                </Grid>
            </div>
        )
    }

    return (
        <div className={"container"}>
            <p>Загрузка решений...</p>
            <CircularProgress/>
        </div>
    )
}

export default StudentSolutionsPage
