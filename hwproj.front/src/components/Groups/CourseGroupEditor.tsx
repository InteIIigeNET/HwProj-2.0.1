import * as React from "react";
import {RouteComponentProps} from 'react-router';
import {Typography, Grid, Container, Paper} from "@material-ui/core";
import {ChangeEvent, FC, useEffect, useState} from "react";
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {makeStyles} from "@material-ui/styles";
import ApiSingleton from "../../api/ApiSingleton";
import {Redirect} from "react-router-dom";
import Group from './Group';

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
}));

const CourseGroupEditor: FC<RouteComponentProps<ICourseGroupEditorProps>> = (props) => {
    const courseId = props.match.params.courseId
    const classes = useStyles()

    if (!ApiSingleton.authService.isLoggedIn()){
        return <Redirect to={"/login"} />
    }

    return (
        <Container style={{ marginTop: '20px' }}>
            <Grid container spacing={2} className={classes.paper}>
                <Grid item xs={4}>
                    <Grid container direction="column" justifyContent="center">
                        <Paper elevation={3}>
                            <Grid item style={{ marginLeft: '15px', marginTop: '15px' }}>
                                <Typography variant="h5">
                                    Студенты без группы
                                </Typography>
                            </Grid>
                            <Grid style={{ marginTop: '10px' }}>
                                <List
                                    component="nav"
                                    aria-label="secondary mailbox folders"
                                >
                                    <ListItem button>
                                        {/*<ListItemIcon>*/}
                                        {/*    <Avatar style={{ color: 'white', backgroundColor: '#3fcb27' }}/>*/}
                                        {/*</ListItemIcon>*/}
                                        <ListItemText primary="Никита Бабич"/>
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemText primary="Артем Вяткин"/>
                                    </ListItem>
                                </List>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
                <Grid item xs={8}>
                    <Paper elevation={3}>
                        <Grid className={classes.info}>
                            <Grid item style={{ marginTop: '15px' }}>
                                <Typography variant="h5">
                                    Группы
                                </Typography>
                            </Grid>
                            <Grid>
                                <Group/>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default CourseGroupEditor
