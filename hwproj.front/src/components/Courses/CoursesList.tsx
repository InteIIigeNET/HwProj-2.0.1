import * as React from "react";
import { CourseViewModel } from "../../api/";
import {
    Link as RouterLink,
    BrowserRouter as Router,
} from "react-router-dom";
import {ListItem, Typography} from "@material-ui/core";


interface ICoursesProps {
    courses: CourseViewModel[];
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
    
    public render() {
        const { courses } = this.props;

        return (
            <div className="container">
                <Router>
                    {courses.map((course) => (
                        <ListItem
                            key={course.id}
                            onClick={() => window.location.assign("/courses/"  + course.id!.toString())}
                            style={{ padding: 0, marginTop: '16px' }}
                        >
                            <div>
                                <RouterLink 
                                    to={"/courses/" + course.id!.toString()}
                                    style={{ color: "#212529" }}
                                >
                                    <Typography style={{ fontSize: "18px" }}>
                                        {course.name} / {course.groupName}
                                    </Typography>
                                </RouterLink>  
                            </div>
                        </ListItem>
                    )).reverse()}
                </Router>
            </div>
        );
    }
}
