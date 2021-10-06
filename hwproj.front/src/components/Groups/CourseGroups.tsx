import * as React from "react";
import {
    Grid,
} from "@material-ui/core";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto, CourseGroupDTO, GroupMateDataDTO, GroupMateViewModel, GroupViewModel} from './../../api';
import GroupsTable from "./GroupsTable";

interface ICourseGroupEditorProps {
    courseId: string;
}

const useStyles = makeStyles(theme => ({
    groups: {
        display: "flex",
        flexDirection: "row",
        justifyContent: 'start',
        alignItems: "start",
    },
    students: {
        marginRight: '16px',
    },
}))

interface GroupState {
    id: number;
    courseId: number;
    name: string;
    groupMates?: AccountDataDto[];
}

interface CourseGroupState {
    studentsWithoutGroup?: GroupMateDataDTO[];
    groups?: GroupState[];
}

const CourseGroups: FC<ICourseGroupEditorProps> = (props) => {
    const [groupState, setGroupState] = useState<CourseGroupState>({
        studentsWithoutGroup: [],
        groups: [],
    })

    useEffect(() => {
        getGroupsInfo()
    }, [])

    const getGroupsInfo = async () => {
        const group = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetCourseDataGet(+courseId)
        const students = group.studentsWithoutGroup?.map((st) => {
            return {
                id: st.id!,
                name: st.name!,
                surname: st.surname!,
                middleName: st.middleName!,
            }
        })
        const groups = await Promise.all(group.groups!.map(async(g) => {
            const groupMates = await Promise.all(g.groupMates!.map( async (gm) => {
                const student = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(gm.studentId!)
                return {
                    name: student.name!,
                    surname:  student.surname!,
                    middleName:  student.middleName!,
                    email:  student.email!,
                    role: student.role!,
                }
            }))
            return {
                id: g.id!,
                courseId: g.courseId!,
                name: g.name!,
                groupMates: groupMates!,
            }
        }))
        setGroupState({
            studentsWithoutGroup: students,
            groups: groups,
        })
    }

    const courseId = props.courseId
    const classes = useStyles()

    return (
        <div style={{marginTop: '20px'}}>
            <Grid container spacing={2} justifyContent="center">
                <GroupsTable
                    studentsWithoutGroup={groupState.studentsWithoutGroup!}
                    groups={groupState.groups!}
                    courseId={courseId}
                />
                <Grid item xs={11} className={classes.groups}>

                </Grid>
            </Grid>
        </div>
    )
}

export default CourseGroups
