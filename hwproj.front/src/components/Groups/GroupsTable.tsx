import React, {FC} from 'react'
import {AccountDataDto, CourseGroupDTO, GroupMateDataDTO, GroupViewModel} from "../../api";
import {Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import AvailableCourseStudents from "./AvailableCourseStudents";
import Group from "./Group";
import AddIcon from '@material-ui/icons/Add';
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/styles";
import EditIcon from "@material-ui/icons/Edit";

interface GroupState {
    id: number;
    courseId: number;
    name: string;
    groupMates?: AccountDataDto[];
}

interface CourseTableProps {
    studentsWithoutGroup: GroupMateDataDTO[];
    groups: GroupState[];
    courseId: string;
}

const useStyles = makeStyles(theme => ({
    tools: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
    },
    tool: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
    }
}))

const GroupsTable: FC<CourseTableProps> = (props) => {

    const classes = useStyles()

    return (
        <Grid item xs={11}>
            {props.studentsWithoutGroup?.length !== 0 && (
                <Grid container xs={12} spacing={2}>
                    <Grid item xs={4}>
                        <AvailableCourseStudents studentsWithoutGroup={props.studentsWithoutGroup}/>
                    </Grid>
                    <Grid item xs={8}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <div className={classes.tools}>
                                                <div>
                                                    <Typography>
                                                        Группы
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <IconButton
                                                        onClick={() => window.location.assign("./" + props.courseId! + "/groups-edit")}
                                                        style={{ color: '#212529' }}
                                                    >
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">Задача 1</TableCell>
                                        <TableCell align="right">Задача 2</TableCell>
                                        <TableCell align="right">Задача 3</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.groups!.map((g) => {
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
                </Grid>
            )}
            {props.studentsWithoutGroup?.length === 0 && (
                <Grid container xs={12}>
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <div className={classes.tools}>
                                                <div>
                                                    <Typography>
                                                        Группы
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <IconButton
                                                        onClick={() => window.location.assign("./" + props.courseId! + "/groups-edit")}
                                                        style={{ color: '#212529' }}
                                                    >
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">Задача 1</TableCell>
                                        <TableCell align="right">Задача 2</TableCell>
                                        <TableCell align="right">Задача 3</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.groups!.map((g) => {
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
                </Grid>
            )}
        </Grid>
    )
}

export default GroupsTable;