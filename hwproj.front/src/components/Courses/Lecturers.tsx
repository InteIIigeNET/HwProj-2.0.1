import React, {FC, useState} from 'react'
import List from "@material-ui/core/List";
import { Link, ListItem, Typography, Accordion, AccordionSummary,
    AccordionDetails, Grid, ListItemIcon, Avatar} from "@material-ui/core";
import {AccountDataDto} from "../../api";
import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import AddLecturerInCourse from "./AddLecturerInCourse";
import {makeStyles} from '@material-ui/core/styles';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MentorWorkspaceModal from "./MentorWorkspaceModal";
import AvatarUtils from "../Utils/AvatarUtils";

interface LecturersProps {
    mentors: AccountDataDto[];
    courseId: string;
    isEditCourse: boolean;
    update: any;
}

interface EditMentorWorkspaceState {
    mentorId: string;
    mentorName: string;
    mentorSurname: string;
    isOpen: boolean;
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

const Lecturers: FC<LecturersProps> = (props) => {

    const [isOpenDialogAddLecturer, setIsOpenDialogAddLecturer] = useState<boolean>(false)

    const [mentorWorkspaceState, setMentorWorkspaceState] = useState<EditMentorWorkspaceState>({
        mentorId: "",
        mentorName: "",
        mentorSurname: "",
        isOpen: false
    })

    const openDialogIconAddLecturer = () => {
        setIsOpenDialogAddLecturer(true)
    }

    const closeDialogIconAddLecturer = () => {
        setIsOpenDialogAddLecturer(false)
    }

    const handleOpenMentorControl = (userId: string, name: string, surname: string) => {
        setMentorWorkspaceState({
            mentorId: userId,
            mentorName: name,
            mentorSurname: surname,
            isOpen: true
        })
    }

    const handleCloseMentorControl = () => {
        setMentorWorkspaceState({
            mentorId: "",
            mentorName: "",
            mentorSurname: "",
            isOpen: false
        })
    }

    const classes = useStyles()

    return (
        <div>
            <Accordion expanded={true}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div className={classes.tools}>
                        <Typography style={{ fontSize: '16px'}}>
                            Преподаватели
                        </Typography>
                        {props.isEditCourse &&
                            <IconButton
                                onClick={openDialogIconAddLecturer}
                                style={{ color: '#212529' }}
                            >
                                <PersonAddIcon fontSize="small"/>
                            </IconButton>
                        }
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container direction="column">
                        <List>
                            {props.mentors.map(mentor =>
                                <ListItem dense={true}>
                                    <ListItemIcon>
                                        <Avatar {...AvatarUtils.stringAvatar(mentor!)} />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Link
                                            color="inherit"
                                            component="button"
                                            onClick={() => window.location.href = "mailto:" + mentor.email}
                                        >
                                            <Typography style={{fontSize: '16px'}}>
                                                {mentor.name}&nbsp;{mentor.surname}
                                            </Typography>
                                        </Link>
                                    </ListItemText>
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleOpenMentorControl(mentor.userId!, mentor.name!, mentor.surname!)}
                                            style={{color: '#212529'}}
                                        >
                                            <ManageAccountsIcon fontSize="small"/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )}
                        </List>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <AddLecturerInCourse
                onClose={closeDialogIconAddLecturer}
                courseId={props.courseId}
                isOpen={isOpenDialogAddLecturer}
                update={props.update}
            />
            {mentorWorkspaceState.isOpen && (
                <MentorWorkspaceModal
                    isOpen={mentorWorkspaceState.isOpen}
                    onClose={handleCloseMentorControl}
                    courseId={+props.courseId}
                    mentorId={mentorWorkspaceState.mentorId}
                    mentorName={mentorWorkspaceState.mentorName}
                    mentorSurname={mentorWorkspaceState.mentorSurname}
                />)}
        </div>
    )
}

export default Lecturers