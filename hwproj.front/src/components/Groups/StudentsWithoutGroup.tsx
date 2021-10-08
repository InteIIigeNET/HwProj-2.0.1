import {AccountDataDto, GroupMateDataDTO, GroupViewModel} from "../../api";
import {ListItem} from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import React, {FC, useState} from "react";
import ApiSingleton from "../../api/ApiSingleton";

interface GroupState {
    id: number;
    courseId: number;
    name: string;
    groupMates?: AccountDataDto[];
}

interface GetStudentsProps {
    studentsWithoutGroup?: GroupMateDataDTO[];
    isEdit: boolean;
    group?: GroupViewModel;
}

const StudentsWithoutGroup: FC<GetStudentsProps> = (props) => {

    const addStudentInGroup = async (userId: string) => {
        debugger
        if (props.isEdit){
            debugger
            const result = await ApiSingleton.courseGroupsApi.
                apiCourseGroupsByCourseIdAddStudentInGroupByGroupIdPost(props.group!.courseId!, props.group!.id!, userId)
        }
    }

    const students = props.studentsWithoutGroup!.map((student: GroupMateDataDTO) => {
        const fullName = student.surname + ' ' + student.name
        return (
            <ListItem
                button
                onClick={() => addStudentInGroup(student.id!)}
            >
                <ListItemText primary={fullName}/>
            </ListItem>
        )
    })
    return (
        <List
            component="nav"
            aria-label="secondary mailbox folders"
        >
            {students}
        </List>
    )
}

export default StudentsWithoutGroup