import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import {Grid} from "@material-ui/core";
import {CourseFileInfoDTO, HomeworkViewModel} from "../../api";
import Homework from "./Homework";
import {FC} from "react";
import FileInfoConverter from "components/Utils/FileInfoConverter";

interface ICourseHomeworkProps {
    homework: HomeworkViewModel[];
    isMentor: boolean;
    isStudent: boolean;
    isReadingMode: boolean;
    onUpdate: () => void;
    courseFilesInfo: CourseFileInfoDTO[]
}

const CourseHomework: FC<ICourseHomeworkProps> = (props) => {

    const homeworkList = props.homework
        .map((hw, i) => (
            <ListItem key={hw.id} style={{padding: 0, marginBottom: 15, width: '100%'}}>
                <Homework
                    isExpanded={i === props.homework.length - 1}
                    homework={hw}
                    forStudent={props.isStudent}
                    forMentor={props.isMentor}
                    isReadingMode={props.isReadingMode}
                    onUpdateClick={() => props.onUpdate()}
                    homeworkFilesInfo={FileInfoConverter.GetHomeworkFilesInfo(props.courseFilesInfo, hw.id!)}
                />

            </ListItem>
        )).reverse()

    if (homeworkList.length > 0) {
        return (
            <Grid container direction="column" alignItems="center" justify="center">
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
