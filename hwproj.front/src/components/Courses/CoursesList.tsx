import * as React from "react";
import {CoursePreviewView} from "../../api/";
import {NavLink} from "react-router-dom";
import MentorsList from "../Common/MentorsList";
import {Box, Divider, Grid, ListItem, Typography} from "@mui/material";

interface ICoursesProps {
    navigate: any
    courses: CoursePreviewView[];
    isExpert: boolean
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
    public render() {
        const {courses, isExpert} = this.props;

        return (
            <Box>
                <Grid container direction="column">
                    {courses.map((course, i) => (
                        <Grid item key={course.id}>
                            <ListItem
                                style={{padding: 0}}
                            >
                                <NavLink
                                    to={isExpert ? "/task/" + course.taskId!.toString() + "/default"
                                        : "/courses/" + course.id!.toString()}
                                    style={{color: "#212529"}}
                                >
                                    <Typography style={{fontSize: "20px"}}>
                                        {course.name} {course.groupName?.length != 0 ? "/ " + course.groupName : ""}
                                    </Typography>
                                </NavLink>
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
