import * as React from "react";
import {CoursePreviewView} from "@/api";
import {NavLink} from "react-router-dom";
import MentorsList from "../Common/MentorsList";
import {Box, Chip, Divider, Grid, ListItem, Skeleton, Stack, Typography} from "@mui/material";
import NameBuilder from "../Utils/NameBuilder";

interface ICoursesProps {
    navigate: any
    courses: CoursePreviewView[] | undefined;
    isExpert: boolean
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
    public render() {
        const {courses, isExpert} = this.props;
        const ghostCoursesRand = [45, 12, 23, 3, 67, 50, 19]

        return (
            <Box>
                <Grid container direction="column">
                    {courses === undefined && ghostCoursesRand.map((rand, i) => {
                        return <Grid item key={i}>
                            <Skeleton variant="rectangular" animation="wave" width={300 + rand} height={25}
                                      style={{marginBottom: 5}}/>
                            <Skeleton variant="rectangular" animation="wave" width={50 + rand} height={14}
                                      style={{marginBottom: 10}}/>
                            <Skeleton variant="rectangular" animation="wave" width={150 + rand} height={20}/>
                            {i < ghostCoursesRand.length - 1 ?
                                <Divider style={{marginTop: 10, marginBottom: 10}}/> : null}
                        </Grid>;
                    })}
                    {courses && courses.map((course, i) => (
                        <Grid item key={course.id}>
                            <ListItem
                                style={{padding: 0, marginBottom: 5}}
                            >
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <NavLink
                                        to={isExpert && course.taskId != null ? "/task/" + course.taskId!.toString() + "/default"
                                            : "/courses/" + course.id!.toString()}
                                        style={{color: "#212529"}}
                                    >
                                        <Typography component="div" style={{fontSize: "20px"}}>
                                            {NameBuilder.getCourseFullName(course.name!, course.groupName)}
                                        </Typography>
                                    </NavLink>
                                    {course.isCompleted &&
                                        <Chip style={{color: "GrayText"}} label="Курс завершен" size={"small"}/>}
                                </Stack>
                            </ListItem>
                            <MentorsList mentors={course.mentors!}/>
                            {i < courses.length - 1 ? <Divider style={{marginTop: 5, marginBottom: 5}}/> : null}
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }
}
