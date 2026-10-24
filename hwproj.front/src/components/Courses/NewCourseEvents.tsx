import {FC} from "react";
import {CourseEvents} from "../../api";
import {Box, Card, CardActionArea, Chip, Grid, Stack, Typography} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import * as React from "react";
import {NavLink} from "react-router-dom";
import Utils from "../../services/Utils";
import {CourseTile} from "../Common/CourseTile";

const courseEventPlurals = ["новая заявка", "новые заявки", "новых заявок"]

const cardSx = {
    height: "100%",
    borderRadius: "14px",
    borderColor: "#c4cad2",
    transition: "transform .2s, box-shadow .2s, border-color .2s",
    "&:hover": {
        transform: "translateY(-2px)",
        borderColor: "#3f51b5",
        boxShadow: "0 6px 20px rgba(63, 81, 181, 0.12)",
    },
}

const NewCourseEvents: FC<{
    courseEvents: CourseEvents[]
}> = (props) => {
    const {courseEvents} = props

    if (courseEvents.length === 0)
        return (
            <Box
                sx={{
                    py: 6,
                    textAlign: "center",
                    border: "1px dashed #d7dbe0",
                    borderRadius: "14px",
                    color: "text.secondary",
                }}
            >
                <Typography variant={"body1"}>Нет новых событий в курсах.</Typography>
            </Box>
        )

    return (
        <Grid container spacing={2}>
            {courseEvents.map((event, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                    <Card variant="outlined" sx={cardSx}>
                        <CardActionArea
                            component={NavLink}
                            to={`/courses/${event.id}/applications`}
                            sx={{
                                height: "100%",
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch",
                                justifyContent: "flex-start",
                                color: "#212529",
                                // Bootstrap подчёркивает ссылки на hover — гасим, карточка не должна вести себя как текстовая ссылка
                                textDecoration: "none",
                                "&:hover, &:focus": {
                                    color: "#212529",
                                    textDecoration: "none",
                                },
                            }}
                        >
                            <Stack direction={"row"} spacing={1.5} alignItems={"flex-start"}>
                                <CourseTile name={event.name ?? ""}/>
                                <Box sx={{minWidth: 0}}>
                                    <Typography
                                        component={"div"}
                                        sx={{
                                            fontSize: "1.05rem",
                                            fontWeight: 500,
                                            lineHeight: 1.3,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {event.name}
                                    </Typography>
                                    {event.groupName &&
                                        <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                            {event.groupName}
                                        </Typography>}
                                </Box>
                            </Stack>

                            <Stack
                                direction={"row"}
                                alignItems={"center"}
                                justifyContent={"space-between"}
                                spacing={1}
                                sx={{mt: "auto", pt: 2}}
                            >
                                <Stack
                                    direction={"row"}
                                    alignItems={"center"}
                                    spacing={1}
                                    sx={{minWidth: 0, color: "#3f51b5"}}
                                >
                                    <PersonAddIcon fontSize={"small"}/>
                                    <Typography sx={{fontSize: "1rem", fontWeight: 500}}>
                                        {`${event.newStudentsCount!} ${Utils.pluralizeHelper(courseEventPlurals, event.newStudentsCount!)} на вступление`}
                                    </Typography>
                                </Stack>
                                {event.isCompleted &&
                                    <Chip
                                        label="Курс завершен"
                                        size={"small"}
                                        sx={{flexShrink: 0, color: "GrayText"}}
                                    />}
                            </Stack>
                        </CardActionArea>
                    </Card>
                </Grid>))}
        </Grid>
    )
}

export default NewCourseEvents;
