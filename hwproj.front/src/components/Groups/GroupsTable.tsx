import React, {FC, useEffect, useState} from 'react'
import {
    AccountDataDto,
    GroupMateDataDTO,
    HomeworkViewModel,
    StatisticsCourseGroupModel,
} from "../../api";
import {Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import AvailableCourseStudents from "./AvailableCourseStudents";
import Group from "./Group";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/styles";
import EditIcon from "@material-ui/icons/Edit";
import ApiSingleton from "../../api/ApiSingleton";
import TaskStudentCell from 'components/Tasks/TaskStudentCell';

interface GroupState {
    id: number;
    courseId: number;
    name: string;
    groupMates?: AccountDataDto[];
}

interface CourseTableProps {
    studentsWithoutGroup: GroupMateDataDTO[];
    groups: GroupState[];
    homeworks: HomeworkViewModel[];
    courseId: string;
    isMentor: boolean;
}

interface GroupsTableState {
    statistics: StatisticsCourseGroupModel[];
    isLoaded: boolean;
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
    const [statistics, setStatistics] = useState<GroupsTableState>({
        statistics: [],
        isLoaded: false,
    })

    useEffect(() => {
        getStatistics()
    }, [props])

    const getStatistics = async () => {
        const currentStatistics = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdGroupsGet(+props.courseId!)
        setStatistics({
            statistics: currentStatistics,
            isLoaded: true,
        })
    }

    const getTable = () => {
        return (
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
                                    {props.isMentor && (
                                        <div>
                                            <IconButton
                                                onClick={() => window.location.assign("./" + props.courseId! + "/groups-edit")}
                                                style={{ color: '#212529' }}
                                            >
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            {props.homeworks.map((homework, index) => (
                                <TableCell
                                    padding="none"
                                    component="td"
                                    align="center"
                                    colSpan={homework.tasks!.length}
                                >
                                    {index + 1}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell component="td">
                                <div>

                                </div>
                            </TableCell>
                            {props.homeworks.map((homework) =>
                                homework.tasks!.map((task) => (
                                    <TableCell padding="none" component="td" align="center">
                                        {task.title}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {statistics.statistics.map(s =>
                            <TableRow>
                                <TableCell>
                                    <Group group={props.groups.find(g => g.id === s.id)!}/>
                                </TableCell>
                                {s.homeworks?.map(hw =>
                                    hw.tasks?.map(task =>
                                        <TaskStudentCell  // ToDo
                                            studentId="fd"
                                            taskId={task.id!}
                                            forMentor={true}
                                            userId={ApiSingleton.authService.getUserId()}
                                            solutions={task.solution!.slice(-1)[0]}
                                        />
                                    )
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    if (statistics.isLoaded && props.groups.length > 0) {
        return (
            <Grid item xs={11}>
                {props.studentsWithoutGroup?.length !== 0 && (
                    <Grid container xs={12} spacing={2}>
                        <Grid item xs={4}>
                            <AvailableCourseStudents studentsWithoutGroup={props.studentsWithoutGroup}/>
                        </Grid>
                        <Grid item xs={8}>
                            {getTable()}
                        </Grid>
                    </Grid>
                )}
                {props.studentsWithoutGroup?.length === 0 && (
                    <Grid container xs={12}>
                        <Grid item xs={12}>
                            {getTable()}
                        </Grid>
                    </Grid>
                )}
            </Grid>
        )
    }

    return (
        <div>

        </div>
    )
}


export default GroupsTable;