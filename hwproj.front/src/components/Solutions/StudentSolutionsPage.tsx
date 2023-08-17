import * as React from "react";
import {
    AccountDataDto, GetSolutionModel,
    HomeworkTaskViewModel,TaskSolutionsStats,
    AssignmentViewModel,Solution,
    StatisticsCourseSolutionsModel
} from "../../api/";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {CircularProgress, Grid} from "@material-ui/core";
import {useNavigate, useParams} from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
    Chip,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Alert,
    Tooltip
} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';

interface IStudentSolutionsPageState {
    currentTaskId: string
    currentStudentId: string
    task: HomeworkTaskViewModel
    isLoaded: boolean
    allSolutionsRated: boolean,
    courseId: number,
    taskSolutionsStats: TaskSolutionsStats[],
    assignedStudents: string[],
    studentSolutionsPreview: {
        student: AccountDataDto,
        solutions: GetSolutionModel[]
        lastSolution: Solution,
        lastRatedSolution: Solution,
        color: string,
        ratedSolutionsCount: number,
        solutionsDescription: string
    }[]
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
        taskSolutionsStats: [],
        assignedStudents: [],
        studentSolutionsPreview: [],
    })

    const {
        isLoaded,
        currentStudentId,
        currentTaskId,
        studentSolutionsPreview,
        allSolutionsRated,
        courseId,
        taskSolutionsStats,
        assignedStudents
    } = studentSolutionsState

    const getTaskData = async (taskId: string, studentId: string, assigned: string[]) => {
        const fullUpdate = currentTaskId !== taskId
        const task = fullUpdate
            ? await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+taskId!)
            : studentSolutionsState.task

        const {
            studentsSolutions,
            statsForTasks,
            assignments,
            courseId
        } = await ApiSingleton.solutionsApi.apiSolutionsTasksByTaskIdGet(+taskId!, studentId)

        const assignedStudents = assigned.length == 0 
            ? assignments?.filter(a => a.mentorId === userId).map(a => a.studentId!)
            : assigned!

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
            taskSolutionsStats: statsForTasks!,
            studentSolutionsPreview: studentSolutionsPreview,
            courseId: courseId!,
            assignedStudents: assignedStudents!,
            allSolutionsRated: studentSolutionsPreview.findIndex(x => x.lastSolution && x.lastSolution.state === Solution.StateEnum.NUMBER_0) === -1
        })
    }

    const doesMentorHasStudent = assignedStudents!.length > 0

    useEffect(() => {
        getTaskData(taskId!, studentId!, assignedStudents)
    }, [taskId, studentId])

    const currentStudent = studentSolutionsPreview.find(x => x.student.userId === currentStudentId)

    const [homeworkMentorFilter, setHomeworkMentorFilter] = useState<boolean>(true);

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
        if (
            !ApiSingleton.authService.isLoggedIn()
        ) {
            return (
                <Typography variant="h6">
                    Страница не найдена
                </Typography>
            )
        }
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
                {doesMentorHasStudent && <Grid>
                    <Checkbox defaultChecked onChange = {() => setHomeworkMentorFilter(state => !state)} />
                    Закрепленные студенты 
                </Grid>}
                <Grid container spacing={3} style={{marginTop: '1px'}}>
                    <Grid item xs={3}>
                        <List>
                            {studentSolutionsPreview!.filter(solution => (homeworkMentorFilter && doesMentorHasStudent) ? assignedStudents?.includes(solution.student.userId!) : true).map(({
                                                               color, lastRatedSolution, student: {
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
                    {(!doesMentorHasStudent || !homeworkMentorFilter || assignedStudents.includes(currentStudentId)) &&
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
                                if (nextStudentIndex === -1) await getTaskData(currentTaskId, currentStudentId, assignedStudents)
                                else navigate(`/task/${currentTaskId}/${studentSolutionsPreview[nextStudentIndex].student.userId}`)
                            }}
                        />}
                    </Grid>
                    }
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
