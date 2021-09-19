import React, { FC } from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {IconButton, ListItem, Theme} from "@material-ui/core";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";

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

const GroupHomeworks: FC = () => {
    const classes = useStyles()

    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography className={classes.heading}>Домашние задания:</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        <ListItem>
                            Для Володи
                            <IconButton aria-label="Delete" onClick={() => console.log("Hello")}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </ListItem>
                        <ListItem>
                            Для Володи
                            <IconButton aria-label="Delete" onClick={() => console.log("Hello")}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </ListItem>
                        <ListItem>
                            Для Володи
                            <IconButton aria-label="Delete" onClick={() => console.log("Hello")}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </ListItem>
                        <ListItem>
                            Для Володи
                            <IconButton aria-label="Delete" onClick={() => console.log("Hello")}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </ListItem>
                    </List>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default GroupHomeworks