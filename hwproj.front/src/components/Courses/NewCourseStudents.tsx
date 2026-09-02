import * as React from 'react';
import {AccountDataDto, CourseViewModel} from '../../api/';
import ApiSingleton from "../../api/ApiSingleton";
import {FC} from "react";
import {Alert, AlertTitle, Box, Button, Card, Grid, Stack, Typography} from '@mui/material';
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: AccountDataDto[],
    onUpdate: () => void,
    courseId: string,
}

const cardSx = {
    height: "100%",
    borderRadius: "14px",
    borderColor: "#c4cad2",
}

const buttonSx = {
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "1rem",
    py: 0.9,
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
    return <Grid container spacing={2}>
        {props.students.map((cm, i) => (
            <Grid item xs={12} sm={6} lg={4} key={cm.userId ?? i}>
                <Card variant="outlined" sx={cardSx}>
                    <Box sx={{p: 2, height: "100%", display: "flex", flexDirection: "column"}}>
                        <Stack direction={"row"} spacing={1.5} alignItems={"flex-start"}>
                            <UserInitialsAvatar user={cm} size={44} fontSize={"1rem"}/>
                            <Box sx={{minWidth: 0}}>
                                <Typography
                                    component={"div"}
                                    sx={{fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3}}
                                >
                                    {cm.surname} {cm.name}
                                </Typography>
                                <Typography
                                    variant={"caption"}
                                    // почта длиннее карточки должна переноситься, а не растягивать её
                                    sx={{color: "text.secondary", wordBreak: "break-word"}}
                                >
                                    {cm.email}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction={"row"} spacing={1} sx={{mt: "auto", pt: 2}}>
                            <Button
                                onClick={() => acceptStudent(cm.userId!)}
                                fullWidth
                                variant="contained"
                                color={"primary"}
                                disableElevation
                                sx={buttonSx}
                            >
                                Принять
                            </Button>
                            <Button
                                onClick={() => rejectStudent(cm.userId!)}
                                fullWidth
                                variant="outlined"
                                color={"error"}
                                sx={buttonSx}
                            >
                                Отклонить
                            </Button>
                        </Stack>
                    </Box>
                </Card>
            </Grid>))}
    </Grid>
}

export default NewCourseStudents
