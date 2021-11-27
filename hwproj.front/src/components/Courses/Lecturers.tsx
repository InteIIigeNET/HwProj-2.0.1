import React, {FC, useState} from 'react'
import List from "@material-ui/core/List";
import {Link, ListItem, Typography, Accordion, AccordionSummary, AccordionDetails} from "@material-ui/core";
import {AccountDataDto} from "../../api";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import AddLecturerInCourse from "./AddLecturerInCourse";
import {makeStyles} from "@material-ui/styles";

interface LecturersProps {
    mentors: AccountDataDto[];
    courseId: string;
    isEditCourse: boolean;
    update: any;
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

    const openDialogIconAddLecturer = () => {
        setIsOpenDialogAddLecturer(true)
    }

    const closeDialogIconAddLecturer = () => {
        setIsOpenDialogAddLecturer(false)
    }

    const classes = useStyles()

    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
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
                    <List>
                        {props.mentors.map(mentor =>
                            <div>
                                <ListItem>
                                    <Link
                                        color="inherit"
                                        component="button"
                                        onClick={() => window.location.href = "mailto:" + mentor.email}
                                    >
                                        <Typography style={{ fontSize: '16px'}}>
                                            {mentor.name}&nbsp;{mentor.surname}
                                        </Typography>
                                    </Link>
                                </ListItem>
                            </div>
                        )}
                    </List>
                </AccordionDetails>
            </Accordion>
            <AddLecturerInCourse
                onClose={closeDialogIconAddLecturer}
                courseId={props.courseId}
                isOpen={isOpenDialogAddLecturer}
                update={props.update}
            />
        </div>
    )
}

export default Lecturers