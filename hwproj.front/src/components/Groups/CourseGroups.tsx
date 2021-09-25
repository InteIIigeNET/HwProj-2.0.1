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
    TableBody, TableRow, TableHead, Button
} from "@material-ui/core";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import ApiSingleton from "../../api/ApiSingleton";
import AvailableCourseStudents from "./AvailableCourseStudents";
import {CourseGroupDTO, GroupMateViewModel} from './../../api';
import AddGroup from "./AddGroup";
import Group from "./Group";

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

const CourseGroups: FC<ICourseGroupEditorProps> = (props) => {
    const [groupState, setGroupState] = useState<CourseGroupDTO>({
        studentsWithoutGroup: [],
        groups: [],
    })
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

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
        let groups = group.groups!.map((g) => {
            return {
                id: g.id,
                courseId: g.courseId,
                name: g.name,
                tasks: g.tasks,
                groupMates: g.groupMates,
            }
        })
        setGroupState({
            studentsWithoutGroup: students,
            groups: group.groups,
        })
    }

    const courseId = props.courseId
    const classes = useStyles()

    return (
        <div style={{marginTop: '20px'}}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={11}>

                </Grid>
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
                                {groupState.groups!.map((g) => {
                                    return (
                                        <TableRow>
                                            <TableCell>
                                                <Group group={g}/>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={11} className={classes.groups}>
                    {groupState.studentsWithoutGroup &&
                    <Grid item style={{marginRight: '16px'}}>
                        <Grid container>
                            <AvailableCourseStudents studentsWithoutGroup={groupState.studentsWithoutGroup}/>
                        </Grid>
                    </Grid>
                    }
                    <Grid item style={{marginRight: '16px'}}>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={handleOpen}
                        >
                            Создать группу
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <AddGroup isOpen={open} close={handleClose} courseId={courseId}/>
        </div>
    )
}

export default CourseGroups
