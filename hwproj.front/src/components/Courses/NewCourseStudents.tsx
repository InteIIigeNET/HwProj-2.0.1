import * as React from 'react';
import {AccountDataDto, CourseViewModel} from '../../api/';
import ApiSingleton from "../../api/ApiSingleton";
import {FC} from "react";
import {Card, CardContent, CardActions, Grid, Button, Typography, Alert, AlertTitle} from '@mui/material';

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: AccountDataDto[],
    onUpdate: () => void,
    courseId: string,
}

const NewCourseStudents: FC<INewCourseStudentsProps> = (props) => {

    const acceptStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.coursesAcceptStudent(props.course.id!, studentId)
        props.onUpdate()
    }

    const rejectStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.coursesRejectStudent(props.course.id!, studentId)
        props.onUpdate()
    }

    const studentsLength = props.students.length

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
        {props.students.map((cm, i) => (
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
