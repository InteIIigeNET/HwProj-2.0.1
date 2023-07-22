import * as React from "react";
import {
    AccountDataDto, GetSolutionModel,
    HomeworkTaskViewModel, Solution,
    StatisticsCourseSolutionsModel
} from "../../api/";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {CircularProgress, Grid} from "@material-ui/core";
import {useNavigate, useParams} from "react-router-dom";
import {Chip, List, ListItemButton, ListItemText, Stack, Alert} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import { Link } from 'react-router-dom';

interface IStudentSolutionsPageState {
    currentTaskId: string
    currentStudentId: string
    task: HomeworkTaskViewModel
    isLoaded: boolean
    allSolutionsRated: boolean,
    courseId: number,
    studentSolutionsPreview: {
        student: AccountDataDto,
        solutions: GetSolutionModel[]
        lastSolution: StatisticsCourseSolutionsModel,
        lastRatedSolution: StatisticsCourseSolutionsModel,
        color: string,
        ratedSolutionsCount: number
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
        studentSolutionsPreview: [],
    })

    const {
        isLoaded,
        currentStudentId,
        currentTaskId,
        studentSolutionsPreview,
        allSolutionsRated,
        courseId
    } = studentSolutionsState
    const userId = ApiSingleton.authService.isLoggedIn()
        ? ApiSingleton.authService.getUserId()
        : undefined

    const getTaskData = async (taskId: string, studentId: string) => {
        const fullUpdate = currentTaskId !== taskId
        const task = fullUpdate
            ? await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+taskId!)
            : studentSolutionsState.task

        const {
            studentsSolutions,
            courseId
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
            studentSolutionsPreview: studentSolutionsPreview,
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
                    {allSolutionsRated
                        ? <Alert severity="success" action={renderGoBackToCoursesStatsLink()}>
                            Все решения на данный момент
                            проверены!
                        </Alert>
                        : renderGoBackToCoursesStatsLink()}
                </Grid>
                <Grid container spacing={3} style={{marginTop: '1px'}}>
                    <Grid item xs={3}>
                        <List>
                            {studentSolutionsPreview!.map(({
                                                               color, lastRatedSolution, student: {
                                    name,
                                    surname,
                                    userId
                                }
                                                           }) =>
                                <Link to={`/task/${currentTaskId}/${(userId)!}`} style={{color: "black", textDecoration: "none"}}>
                                    <ListItemButton disableGutters divider
                                                    disableTouchRipple={currentStudentId === userId}
                                                    selected={currentStudentId === userId}>
                                        <Stack direction={"row"} spacing={1} sx={{paddingLeft: 1}}>
                                            <Chip style={{backgroundColor: color}}
                                                  size={"small"}
                                                  label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating}/>
                                            <ListItemText primary={surname + " " + name}/>
                                        </Stack>
                                    </ListItemButton>
                                </Link>)}
                        </List>
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
