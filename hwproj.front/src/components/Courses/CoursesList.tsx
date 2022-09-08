import * as React from "react";
import {CoursePreviewView} from "../../api/";
import {
    Link as RouterLink,
    BrowserRouter as Router,
} from "react-router-dom";
import {Divider, Grid, ListItem, Typography} from "@material-ui/core";

interface ICoursesProps {
    courses: CoursePreviewView[];
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
    public render() {
        const {courses} = this.props;

        return (
            <div className="container">
                <Router>
                    {courses.map((course, i) => (
                        <Grid item>
                            <ListItem
                                key={course.id}
                                onClick={() => window.location.assign("/courses/" + course.id!.toString())}
                                style={{padding: 0}}
                            >
                                <RouterLink
                                    to={"/courses/" + course.id!.toString()}
                                    style={{color: "#212529"}}
                                >
                                    <Typography style={{fontSize: "20px"}}>
                                        {course.name} {course.groupName?.length != 0 ? "/ " + course.groupName : ""}
                                    </Typography>
                                </RouterLink>
                            </ListItem>
                            <Typography style={{fontSize: "18px", color: "GrayText"}}>
                                {course.mentors?.map(t => `${t.name} ${t.surname}`).join(", ")}
                            </Typography>
                            {i < courses.length - 1 ? <Divider style={{marginTop: 5, marginBottom: 5}}/> : null}
                        </Grid>
                    ))}
                </Router>
            </div>
        );
    }
}
