import * as React from 'react';
import ApiSingleton from "../../api/ApiSingleton";
import {FC} from "react";
import {Card, CardContent, CardActions, Grid, Button, Typography, Alert, AlertTitle} from '@mui/material';
import {useAppSelector, useAppDispatch} from "@/store/hooks";
import {fetchCourseData} from '@/store/slices/courseSlice';

const NewCourseStudents: FC = () => {
    const course = useAppSelector(state => state.course.course);
    const students = useAppSelector(state => state.course.newStudents);
    const dispatch = useAppDispatch();

    const acceptStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.coursesAcceptStudent(course?.id!, studentId)
        dispatch(fetchCourseData(course?.id!));
    }

    const rejectStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.coursesRejectStudent(course?.id!, studentId)
        dispatch(fetchCourseData(course?.id!));
    }

    const studentsLength = students.length

    if (studentsLength === 0) {
        return (
            <Alert>
                <AlertTitle>
                    На данный момент все заявки приняты!
                </AlertTitle>
                Уведомления о новых заявках на Ваших курсах так же будут отображены на главной странице сервиса
            </Alert>
        )
    }
    return <Grid item container spacing={1} direction={"row"} xs={"auto"}>
        {students.map((cm, i) => (
            <Grid item>
                <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
                    <CardContent>
                        <Typography variant="h6" component="div">
                            {cm.surname} {cm.name}
                        </Typography>
                        <Typography style={{color: "GrayText"}} gutterBottom className="antiLongWords">
                            {cm.email}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            onClick={() => acceptStudent(cm.userId!)}
                            size="small"
                            color={"primary"}
                        >
                            Принять
                        </Button>
                        <Button
                            onClick={() => rejectStudent(cm.userId!)}
                            size="small"
                            color={"error"}
                        >
                            Отклонить
                        </Button>
                    </CardActions>
                </Card>
            </Grid>))}
    </Grid>
}

export default NewCourseStudents
