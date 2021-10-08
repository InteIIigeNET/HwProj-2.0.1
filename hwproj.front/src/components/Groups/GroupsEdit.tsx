import React, {FC, useEffect, useState} from 'react'
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {Grid, IconButton, ListItem, Paper, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {AccountDataDto, CourseGroupDTO, GroupMateDataDTO, GroupMateViewModel, GroupViewModel} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import GroupEdit from "./GroupEdit";
import AddIcon from "@material-ui/icons/Add";
import AddGroup from "./AddGroup";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            marginTop: theme.spacing(4)
        },
        main: {
            marginTop: theme.spacing(4)
        },
        students: {
            marginLeft: '8px',

        },
        tools: {
            display: "flex",
            flexDirection: 'row',
            alignItems: 'center',
        },
    }),
)

interface GroupsEditProps {
    id: string;
}

interface CourseGroupState {
    studentsWithoutGroup?: GroupMateDataDTO[];
    groups?: GroupViewModel[];
}

const GroupsEdit: FC<RouteComponentProps<GroupsEditProps>> = (props) => {

    const courseId = props.match.params.id

    const [groupsState, setGroupsState] = useState<CourseGroupState>({
        studentsWithoutGroup: [],
        groups: [],
    })

    const [currentGroup, setCurrentGroup] = useState<GroupViewModel>({
        id: -1,
        courseId: 0,
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
        const groups = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetAllGet(+courseId)
        setGroupsState({
            groups: groups,
        })
    }

    const update = async () => {
        await getGroupsInfo()
        setCurrentGroup({
            id: -1,
            courseId: 0,
        })
    }
    const classes = useStyles()

    const groups = groupsState.groups!.map((group, index) => {
        return (
            <ListItem
                button
                onClick={() => setCurrentGroup({
                    id: group.id,
                    courseId: group.courseId,
                })}
            >
                <ListItemText primary={group.name}/>
            </ListItem>
        )
    })

    return (
        <Grid container justifyContent="center" className={classes.paper}>
            <Grid container xs={11}>
                <Link
                    component="button"
                    style={{color: '#212529'}}
                    onClick={() => window.location.assign('/courses/' + courseId)}
                >
                    <Typography>
                        Назад к курсу
                    </Typography>
                </Link>
            </Grid>
            <Grid container xs={11} direction="row" className={classes.paper} spacing={1}>
                <Grid item xs={3}>
                    <Paper elevation={3} style={{ minHeight: '400px', backgroundColor: "#c6cceb" }}>
                        <div>
                            <div className={classes.tools}>
                                <div style={{  marginTop: '16px', marginLeft: '16px' }}>
                                    <Typography style={{ fontSize: '20px' }}>
                                        Выберите группу
                                    </Typography>
                                </div>
                                <div style={{  marginTop: '16px', marginLeft: '16px' }}>
                                    <IconButton
                                        onClick={handleOpen}
                                        style={{ color: '#212529' }}
                                    >
                                        <AddIcon fontSize="small"/>
                                    </IconButton>
                                </div>
                            </div>
                            <List>
                                {groups}
                            </List>
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={9}>
                    <div>
                        <Paper elevation={3} style={{ minHeight: '400px', backgroundColor: "#eceef8"}}>
                            {currentGroup.id !== -1 && (
                                <GroupEdit
                                    id={currentGroup.id!}
                                    courseId={currentGroup.courseId!}
                                    update={update}
                                />
                            )}
                        </Paper>
                    </div>
                </Grid>
            </Grid>
            <AddGroup
                isOpen={open}
                close={handleClose}
                courseId={courseId}
                update={update}
            />
        </Grid>
    )
}

export default GroupsEdit