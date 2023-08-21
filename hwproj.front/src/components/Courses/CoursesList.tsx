import * as React from "react";
import {CoursePreviewView} from "../../api/";
import {Divider, Grid, ListItem, Typography} from "@material-ui/core";
import {NavLink} from "react-router-dom";

interface ICoursesProps {
    navigate: any
    courses: CoursePreviewView[];
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
    public render() {
        const {courses} = this.props;

        return (
            <div className="container">
                {courses.map((course, i) => (
                    <Grid item>
                        <ListItem
                            key={course.id}
                            style={{padding: 0}}
                        >
                            <NavLink
                                to={"/courses/" + course.id!.toString()}
                                style={{color: "#212529"}}
                            >
                                <Typography style={{fontSize: "20px"}}>
                                    {course.name} {course.groupName?.length != 0 ? "/ " + course.groupName : ""}
                                </Typography>
                            </NavLink>
                        </ListItem>
                        <Typography style={{fontSize: "18px", color: "GrayText"}}>
                            {course.mentors?.map(t => `${t.name} ${t.surname}`).join(", ")}
                        </Typography>
                        {i < courses.length - 1 ? <Divider style={{marginTop: 5, marginBottom: 5}}/> : null}
                    </Grid>
                ))}
            </div>
        );
    }
}
