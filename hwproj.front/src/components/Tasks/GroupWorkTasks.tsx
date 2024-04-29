import React, { FC, useState } from 'react';
import { GroupTaskWithoutGroupInSolutionViewModel,} from "../../api";
import { Link, NavLink } from "react-router-dom";
import { Divider, Grid, ListItem, Typography, Chip } from "@mui/material";
import Utils from "../../services/Utils";

interface IGroupWorkTasksProps {
    tasks: GroupTaskWithoutGroupInSolutionViewModel[]
}

const GroupWorkTasks: FC<IGroupWorkTasksProps> = ({tasks}) => {
    
    return (
        <div>
            {tasks.map(({ taskTitle, courseTitle, taskId, publicationDate }, i) => (
                <Grid marginBottom={2}>
                    <Link to={`/task/${taskId}`}>
                        <ListItem style={{ padding: 0, color: "#212529" }}>
                            <Grid container direction={"row"} >
                                <Grid item>
                                    <NavLink to={`/task/${taskId}`} style={{ color: "#212529" }}>
                                        <Typography style={{ fontSize: "20px", marginRight: "10px" }}>
                                            {taskTitle + " • " + courseTitle }
                                        </Typography>
                                    </NavLink>
                                </Grid>
                                <Grid item>
                                    <Chip color="primary" label="Командное" size={"small"}/>
                                </Grid>
                            </Grid>
                        </ListItem>
                    </Link>
                    <Typography style={{ fontSize: "18px", color: "GrayText" }}>
                        {courseTitle}
                    </Typography>
                    {Utils.renderReadableDate(publicationDate!)}
                    { i !== tasks!.length - 1 && <Divider style={{marginTop: 10, marginBottom: 10}}/> }
                </Grid>
            ))}
        </div>
    );
};

export default GroupWorkTasks;