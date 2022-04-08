import * as React from "react";
import {
    Button,
    Grid, Typography,
} from "@material-ui/core";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import ApiSingleton from "../../api/ApiSingleton";
import {
    AccountDataDto,
    CourseGroupDTO,
    GroupMateDataDTO,
    GroupMateViewModel,
    GroupViewModel,
    HomeworkViewModel
} from './../../api';
import GroupsTable from "./GroupsTable";
import CourseHomework from "../Homeworks/CourseHomework";

interface ICourseGroupEditorProps {
    courseId: string;
    groupHomeworks: HomeworkViewModel[];
    onDelete: any;
    isStudent: boolean;
    isMentor: boolean;
    isReadingMode: boolean;
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
        const groupsInfo = await Promise.all(group.groups!.map(async(g) => {
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
            groups: groupsInfo,
        })
    }

    const courseId = props.courseId
    const classes = useStyles()

    return (
        <div style={{marginTop: '20px', marginBottom: '40px'}}>
            { props.isMentor && groupState.groups!.length == 0 &&
                <Grid container direction="row" alignItems="center">
                    <Grid item style={{marginLeft: '60px'}}>
                        <Typography
                            variant="h5"
                        >
                            Групп нет. Хотите создать?
                        </Typography>
                    </Grid>
                    <Grid item style={{marginLeft: '20px'}}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={() => console.log(window.location.assign("./" + props.courseId! + "/groups-edit"))}
                        >
                            Создать
                        </Button>
                    </Grid>
                </Grid>
            }
            <Grid container spacing={2} justifyContent="center">
                <GroupsTable
                    studentsWithoutGroup={groupState.studentsWithoutGroup!}
                    groups={groupState.groups!}
                    courseId={courseId}
                    isMentor={props.isMentor}
                    homeworks={props.groupHomeworks}
                />
                <Grid item xs={11} className={classes.groups} style={{marginTop: '30px'}}>
                    <CourseHomework
                        homework={props.groupHomeworks}
                        isMentor={props.isMentor}
                        isStudent={props.isStudent}
                        onDelete={props.onDelete}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default CourseGroups
