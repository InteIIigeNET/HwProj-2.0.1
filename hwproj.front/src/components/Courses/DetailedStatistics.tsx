import React, {FC, useEffect, useState} from "react";
import {CourseViewModel, DetailedCourseStatsModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {Grid, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Paper, createStyles, Theme} from "@material-ui/core";
import TaskStudentCell from "../Tasks/TaskStudentCell";
import ApiSingleton from "../../api/ApiSingleton";
import {withStyles} from '@material-ui/styles';
import {RouteComponentProps} from "react-router-dom";
import Typography from "@material-ui/core/Typography";


interface IDetailedStatisticsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
}

interface IDetailedStatisticsState {
    stats: DetailedCourseStatsModel[];
}

const DetailedStatistics: FC<IDetailedStatisticsProps> = (props) => {
    const courseId = props.course.id!

    const [detailedStatState, setDetailedStatState] = useState<IDetailedStatisticsState>({
        stats: []
    })

    useEffect(() => {
        getGroupsInfo()
    }, [])

    const getGroupsInfo = async () => {
        const stats = await ApiSingleton.statisticsApi.apiStatisticsGetDetailedStatByCourseIdGet(+courseId)

        console.log(stats)
        setDetailedStatState({
            stats: stats
        })
    }

    return (
        <Grid>
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" padding="none" component="td">
                                <Typography>
                                    Статистика
                                </Typography>
                            </TableCell>
                            {props.homeworks.map((homework, index) => (
                                <TableCell
                                    padding="none"
                                    component="td"
                                    align="center"
                                    colSpan={homework.tasks!.length}
                                >
                                    {index + 1}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell component="td"></TableCell>
                            {props.homeworks.map((homework) =>
                                homework.tasks!.map((task) => (
                                    <TableCell padding="none" component="td" align="center">
                                        {task.title}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key={2}>
                            <TableCell align="center" padding="none" component="td">
                                Количество сданных работ
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.numberSolutionsRatePosted!}
                                </TableCell>
                            )}
                        </TableRow>
                        <TableRow key={3}>
                            <TableCell align="center" padding="none" component="td">
                                Количество принятых работ
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.numberSolutionsRateFinal!}
                                </TableCell>
                            )}
                        </TableRow>
                        <TableRow key={4}>
                            <TableCell align="center" padding="none" component="td">
                                Среднее время сдачи
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.averageTimeHandIn!}
                                </TableCell>
                            )}
                        </TableRow>
                        <TableRow key={5}>
                            <TableCell align="center" padding="none" component="td">
                                Минимальное время сдачи
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.minimumTimeHandIn!}
                                </TableCell>
                            )}
                        </TableRow>
                        <TableRow key={6}>
                            <TableCell align="center" padding="none" component="td">
                                Средний балл за первую попытку
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.averageScoreOnFirstAttempt!}
                                </TableCell>
                            )}
                        </TableRow>
                        <TableRow key={7}>
                            <TableCell align="center" padding="none" component="td">
                                Средний конечный балл
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.averageFinalGrade!}
                                </TableCell>
                            )}
                        </TableRow>
                        <TableRow key={8}>
                            <TableCell align="center" padding="none" component="td">
                                Среднее количество попыток сдачи
                            </TableCell>
                            {detailedStatState.stats.map((s) =>
                                <TableCell align="center" padding="none" component="td">
                                    {s.averageNumberOfCorrections!}
                                </TableCell>
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}

export default DetailedStatistics