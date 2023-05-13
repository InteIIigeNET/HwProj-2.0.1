import * as React from "react";
import {
    HomeworkTaskViewModel, Solution,
    StatisticsCourseSolutionsModel
} from "../../api/";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {CircularProgress, Grid, Link} from "@material-ui/core";
import {useNavigate, useParams} from "react-router-dom";
import {Chip, List, ListItemButton, ListItemText, Stack, Alert} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";

interface IStudentSolutionsPageState {
    currentTaskId: string
    currentStudentId: string
    task: HomeworkTaskViewModel
    isLoaded: boolean
    allSolutionsRated: boolean,
    courseId: number,
    studentSolutionsPreview: {
        userId: string,
        name: string,
        surname: string,
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

        const {studentsSolutions, courseId} = await ApiSingleton.solutionsApi.apiSolutionsTasksByTaskIdGet(+taskId!, studentId)

        const studentSolutionsPreview = studentsSolutions!.map(studentSolutions => {
            const {userId, name, surname} = studentSolutions.user!
            const ratedSolutionInfo = StudentStatsUtils.calculateLastRatedSolutionInfo(studentSolutions.solutions!, task.maxRating!)
            return {userId: userId!, name: name!, surname: surname!, ...ratedSolutionInfo}
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

    const goBackToCourseStats = () => navigate(`/courses/${courseId}/stats`)
    const renderGoBackToCoursesStatsLink = () => {
        return <Link
            component="button"
            style={{color: '#212529'}}
            onClick={goBackToCourseStats}
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
                            {studentSolutionsPreview!.map(x =>
                                <ListItemButton disableGutters divider
                                                disableTouchRipple={currentStudentId === x.userId}
                                                selected={currentStudentId === x.userId}
                                                onClick={async () => {
                                                    if (currentStudentId === x.userId) return
                                                    navigate(`/task/${currentTaskId}/${x.userId!}`)
                                                    await getTaskData(currentTaskId, x.userId!)
                                                }}>
                                    <Stack direction={"row"} spacing={1} sx={{paddingLeft: 1}}>
                                        <Chip style={{backgroundColor: x.color}}
                                              size={"small"}
                                              label={x.lastRatedSolution == undefined ? "?" : x.lastRatedSolution.rating}/>
                                        <ListItemText primary={x.surname + " " + x.name}/>
                                    </Stack>
                                </ListItemButton>)}
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
                        <TaskSolutions
                            forMentor={true}
                            task={studentSolutionsState.task}
                            studentId={currentStudentId!}
                            onSolutionRateClick={async () => {
                                const nextStudentIndex = studentSolutionsPreview.findIndex(x => x.userId !== currentStudentId && x.lastSolution && x.lastSolution.state === Solution.StateEnum.NUMBER_0)
                                const nextStudentId = nextStudentIndex === -1 ? currentStudentId : studentSolutionsPreview[nextStudentIndex].userId
                                await getTaskData(currentTaskId, nextStudentId)
                            }}
                        />
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
