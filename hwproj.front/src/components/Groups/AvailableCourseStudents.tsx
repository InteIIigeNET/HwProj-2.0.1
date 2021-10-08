import React, { FC } from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {Grid, IconButton, ListItem, Theme} from "@material-ui/core";
import {GroupMateDataDTO} from "../../api";
import StudentsWithoutGroup from "./StudentsWithoutGroup";

interface AvailableCourseStudentsProps {
    studentsWithoutGroup?: GroupMateDataDTO[];
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
    }),
);

const AvailableCourseStudents: FC<AvailableCourseStudentsProps> = (props) => {
    const classes = useStyles()

    return (
        <div>
            <div className={classes.root}>
                <Accordion>
                    <AccordionSummary
                        style={{backgroundColor: "#c6cceb"}}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>
                            Студенты без группы
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <StudentsWithoutGroup
                            studentsWithoutGroup={props.studentsWithoutGroup}
                            isEdit={false}
                            group={undefined}
                        />
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    )
}

export default AvailableCourseStudents