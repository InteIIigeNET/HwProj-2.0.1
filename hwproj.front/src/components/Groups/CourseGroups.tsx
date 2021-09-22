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
import Groups from './Groups';
import AvailableCourseStudents from "./AvailableCourseStudents";
import { CourseGroupDTO } from './../../api';

interface ICourseGroupEditorState {
    isLoaded: boolean;
}

interface ICourseGroupEditorProps {
    courseId: string;
}

const useStyles = makeStyles( theme => ({
    paper: {
    },
    info: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
    },
}))

const CourseGroups: FC<ICourseGroupEditorProps> = (props) => {
    const [groupState, setGroupState] = useState<CourseGroupDTO>({
        studentsWithoutGroup: [],
        groups: []
    })
    const courseId = props.courseId
    const classes = useStyles()

    useEffect(() => {
        getGroupsInfo()
    }, [])

    const getGroupsInfo = async () => {
        const group = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetCourseDataGet(+courseId)
        setGroupState(group)
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
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                {groupState.studentsWithoutGroup?.length != 0 &&
                    <Grid item xs={12}>
                        <Grid container direction="column" justifyContent="center">
                            <Paper elevation={3}>
                                <AvailableCourseStudents studentsWithoutGroup={groupState.studentsWithoutGroup}/>
                            </Paper>
                        </Grid>
                    </Grid>
                }
                <Grid item xs={11}>
                    <Paper elevation={3}>
                        <Grid container>
                            <Grid item className={classes.info}>
                                <Grid item style={{ marginTop: '15px' }}>
                                    <Typography variant="h5">
                                        Группы
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Groups/>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}

export default CourseGroups
