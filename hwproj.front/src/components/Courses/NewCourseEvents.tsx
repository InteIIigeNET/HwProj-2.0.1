import {FC} from "react";
import {CourseEvents} from "../../api";
import {Card, CardContent, Divider, Grid, Typography, Stack, Chip} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import * as React from "react";
import {Link} from "react-router-dom";
import Utils from "../../services/Utils";
import NameBuilder from "../Utils/NameBuilder";

const courseEventPlurals = ["новая заявка", "новые заявки", "новых заявок"]

const NewCourseEvents: FC<{
    courseEvents: CourseEvents[]
}> = (props) => {
    const {courseEvents} = props
    if (courseEvents.length > 0)
        return <Grid container spacing={1} direction={"row"} xs={"auto"}>
            {courseEvents.map((event, i) => (
                <Grid item>
                    <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
                        <CardContent>
                            <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                <Typography variant={"subtitle1"}>
                                    {NameBuilder.getCourseFullName(event.name!, event.groupName)}
                                </Typography>
                                {event.isCompleted && <Chip style={{color: "GrayText"}} label="Курс завершен" size={"small"}/>}
                            </Stack>
                            <Divider style={{marginTop: 15, marginBottom: 15}}/>
                            <Link style={{color: "#3f51b5"}} to={`/courses/${event.id}/applications`}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <PersonAddIcon fontSize={"small"}/>
                                    <Typography>
                                        {event.newStudentsCount!} {Utils.pluralizeHelper(courseEventPlurals, event.newStudentsCount!)} на
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
