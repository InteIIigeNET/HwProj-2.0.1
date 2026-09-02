import * as React from "react";
import {CoursePreviewView} from "@/api";
import {NavLink} from "react-router-dom";
import MentorsList from "../Common/MentorsList";
import {Box, Card, CardActionArea, Chip, Grid, Skeleton, Stack, Typography} from "@mui/material";

interface ICoursesProps {
    navigate: any
    courses: CoursePreviewView[] | undefined;
    isExpert: boolean
}

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

// Цвет плитки курса выводится из его названия, чтобы карточки различались с одного взгляда
const getHue = (value: string) => {
    let hash = 0
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 360
    return hash
}

const getInitials = (value: string) => value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase()

export class CoursesList extends React.Component<ICoursesProps, {}> {
    public render() {
        const {courses, isExpert} = this.props;
        const ghostCoursesRand = [45, 12, 23, 3, 67, 50]

        if (courses !== undefined && courses.length === 0) {
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
                    <Typography variant={"body1"}>Здесь пока нет курсов</Typography>
                </Box>
            )
        }

        return (
            <Grid container spacing={2}>
                {courses === undefined && ghostCoursesRand.map((rand, i) => (
                    <Grid item xs={12} sm={6} lg={4} key={i}>
                        <Card variant="outlined" sx={{...cardSx, "&:hover": undefined}}>
                            <Box sx={{p: 2}}>
                                <Stack direction={"row"} spacing={1.5} alignItems={"flex-start"}>
                                    <Skeleton variant="rounded" animation="wave" width={44} height={44}/>
                                    <Box sx={{flexGrow: 1}}>
                                        <Skeleton variant="text" animation="wave" width={`${45 + rand / 2}%`}
                                                  height={26}/>
                                        <Skeleton variant="text" animation="wave" width={`${25 + rand / 3}%`}
                                                  height={16}/>
                                    </Box>
                                </Stack>
                                <Skeleton variant="text" animation="wave" width={`${40 + rand / 2}%`} height={20}
                                          sx={{mt: 2}}/>
                            </Box>
                        </Card>
                    </Grid>
                ))}
                {courses && courses.map(course => {
                    const name = course.name ?? ""
                    const hue = getHue(name)
                    return (
                        <Grid item xs={12} sm={6} lg={4} key={course.id}>
                            <Card variant="outlined" sx={cardSx}>
                                <CardActionArea
                                    component={NavLink}
                                    to={isExpert ? "/task/" + course.taskId!.toString() + "/default"
                                        : "/courses/" + course.id!.toString()}
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
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                flexShrink: 0,
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                backgroundColor: `hsl(${hue}, 70%, 94%)`,
                                                color: `hsl(${hue}, 45%, 38%)`,
                                            }}
                                        >
                                            {getInitials(name)}
                                        </Box>
                                        <Box sx={{minWidth: 0}}>
                                            <Typography
                                                component={"div"}
                                                sx={{
                                                    fontSize: "1.05rem",
                                                    fontWeight: 600,
                                                    lineHeight: 1.3,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {name}
                                            </Typography>
                                            {course.groupName &&
                                                <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                                    {course.groupName}
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
                                        <Box sx={{minWidth: 0, "& .MuiTypography-root": {fontSize: "0.875rem"}}}>
                                            <MentorsList mentors={course.mentors ?? []}/>
                                        </Box>
                                        {course.isCompleted &&
                                            <Chip
                                                label="Завершён"
                                                size={"small"}
                                                sx={{flexShrink: 0, color: "GrayText"}}
                                            />}
                                    </Stack>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
        );
    }
}
