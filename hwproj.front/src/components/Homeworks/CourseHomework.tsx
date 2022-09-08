import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import {Grid, Typography} from "@material-ui/core";
import {HomeworkViewModel} from "../../api";
import Homework from "./Homework";
import {FC} from "react";

interface ICourseHomeworkProps {
    homework: HomeworkViewModel[];
    isMentor: boolean;
    isStudent: boolean;
    isReadingMode: boolean;
    onDelete: () => void;
}

const CourseHomework: FC<ICourseHomeworkProps> = (props) => {

    const homeworkList = props.homework
        .map((hw) => (
            <ListItem key={hw.id} style={{padding: 0, marginTop: '20px', width: '100%'}}>
                <Homework
                    homework={hw}
                    forStudent={props.isStudent}
                    forMentor={props.isMentor}
                    isReadingMode={props.isReadingMode}
                    onDeleteClick={() => props.onDelete()}
                />

            </ListItem>
        )).reverse()

    if (homeworkList.length > 0) {
        return (
            <Grid container direction="column" alignItems="center" justify="center">
                <Grid item>
                    <Typography style={{fontSize: '20px'}}>
                        Домашние задания
                    </Typography>
                </Grid>
                <div style={{width: '100%'}}>
                    <List>
                        {homeworkList}
                    </List>
                </div>
            </Grid>
        )
    }
    return (
        <div>

        </div>
    )
}

export default CourseHomework
