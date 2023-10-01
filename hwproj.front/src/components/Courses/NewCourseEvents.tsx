import {FC} from "react";
import {CourseEvents} from "../../api";
import {Card, CardContent, Divider, Grid, Typography, Stack} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import * as React from "react";
import {Link} from "react-router-dom";
import Utils from "../../services/Utils";

const courseEventPlurals = ["новая заявка", "новые заявки", "новых заявок"]

const NewCourseEvents: FC<{
    courseEvents: CourseEvents[]
}> = (props) => {
    const {courseEvents} = props
    if (courseEvents.length > 0)
        return <Grid container spacing={1} direction={"row"} xs={"auto"}>
            {courseEvents.map((course, i) => (
                <Grid item>
                    <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
                        <CardContent>
                            <Typography variant={"subtitle1"}>
                                {course.name} {course.groupName?.length != 0 ? "/ " + course.groupName : ""}
                            </Typography>
                            <Divider style={{marginTop: 15, marginBottom: 15}}/>
                            <Link style={{color: "#3f51b5"}} to={`/courses/${course.id}/applications`}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <PersonAddIcon fontSize={"small"}/>
                                    <Typography>
                                        {course.newStudentsCount!} {Utils.pluralizeHelper(courseEventPlurals, course.newStudentsCount!)} на
                                        вступление
                                    </Typography>
                                </Stack>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>))}
        </Grid>
    return <div>
        <Typography variant={"body1"} color={"GrayText"}>Нет новых событий в курсах.</Typography>
    </div>
}

export default NewCourseEvents;
