import * as React from 'react';
import {AccountDataDto, CourseViewModel} from '../../api/';
import ApiSingleton from "../../api/ApiSingleton";
import {FC} from "react";
import {Card, CardContent, CardActions, Grid, Button, Typography} from '@mui/material';

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: AccountDataDto[],
    onUpdate: () => void,
    courseId: string,
}

const NewCourseStudents: FC<INewCourseStudentsProps> = (props) => {

    const acceptStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesAcceptStudentByCourseIdByStudentIdPost(props.course.id!, studentId)
        props.onUpdate()
    }

    const rejectStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesRejectStudentByCourseIdByStudentIdPost(props.course.id!, studentId)
        props.onUpdate()
    }

    const studentsLength = props.students.length

    if (studentsLength === 0) {
        return (
            <div>
                Нет новых заявок в курс.
            </div>
        )
    }
    return <Grid container spacing={1} direction={"column"}>
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
