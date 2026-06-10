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
        await ApiSingleton.coursesApi.coursesAcceptStudent(props.course.id!, studentId)
        props.onUpdate()
    }

    const rejectStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.coursesRejectStudent(props.course.id!, studentId)
        props.onUpdate()
    }

    return <>
        {props.students.map((cm, i) => (
            <Grid item xs={12} md={6} key={cm.userId ?? i} style={{display: "flex"}}>
                <Card variant="elevation" 
                      style={{
                          backgroundColor: "ghostwhite",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column"
                      }}>
                    <CardContent style={{flexGrow: 1}}>
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
    </>
}

export default NewCourseStudents
