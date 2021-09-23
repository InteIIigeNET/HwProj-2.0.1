import * as React from "react";
import {
    Typography,
    Grid,
    Container,
    Paper,
    ListSubheader,
    TableContainer,
    Table,
    TableCell,
    TableBody, TableRow, TableHead
} from "@material-ui/core";
import {ChangeEvent, FC, useEffect, useState} from "react";
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {makeStyles} from "@material-ui/styles";
import ApiSingleton from "../../api/ApiSingleton";
import AvailableCourseStudents from "./AvailableCourseStudents";
import {CourseGroupDTO, GroupMateDataDTO, GroupViewModel, GroupMateViewModel} from './../../api';
import Groups from './Groups'
import Group from "./Group";

interface ICourseGroupEditorProps {
    courseId: string;
}

const useStyles = makeStyles( theme => ({
    groups: {
        display: "flex",
        flexDirection: "row",
        justifyContent: 'start',
    },
    students: {
      marginRight: '16px',
    },
}))

const CourseGroups: FC<ICourseGroupEditorProps> = (props) => {
    const [groupState, setGroupState] = useState<CourseGroupDTO>({
        studentsWithoutGroup: [],
        groups: [],
    })
    const courseId = props.courseId
    const classes = useStyles()

    useEffect(() => {
        getGroupsInfo()
    }, [])

    const getGroupsInfo = async () => {
        const group = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetCourseDataGet(+courseId)
        let students = group.studentsWithoutGroup?.map((st) => {
            return {
                id: st.id!,
                name: st.name!,
                surname: st.surname!,
                middleName: st.middleName!,
            }
        })
        let groups = group!.groups!.map((g) => {
            let groupMates = g!.groupMates!.map((gm) => {
                return {
                    studentId: gm.studentId,
                }
            })
            return {
                id: g.id!,
                courseId: g.courseId!,
                name: g.name!,
                tasks: g.tasks!,
                groupMates: g.groupMates!,
            }
        })
        debugger
        setGroupState({
            studentsWithoutGroup: students,
            groups: groups,
        })
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={11}>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Группы</TableCell>
                                    <TableCell align="right">Задача 1</TableCell>
                                    <TableCell align="right">Задача 2</TableCell>
                                    <TableCell align="right">Задача 3</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <Group/>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={11} className={classes.groups}>
                    {groupState.studentsWithoutGroup?.length !== 0 &&
                    <Grid item style={{ marginRight: '16px' }}>
                        <Grid container>
                            <AvailableCourseStudents studentsWithoutGroup={groupState.studentsWithoutGroup}/>
                        </Grid>
                    </Grid>
                    }
                    <Grid item>
                        <Grid container>
                            <Grid item>
                                <Groups/>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

export default CourseGroups
