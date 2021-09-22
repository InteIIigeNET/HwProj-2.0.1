import React, { FC } from 'react'
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import {IconButton, ListItem, Theme} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import List from "@material-ui/core/List";
import DeleteIcon from "@material-ui/icons/Delete";
import Accordion from "@material-ui/core/Accordion";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import Group from './Group'

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
)

const Groups: FC = () => {
    const classes = useStyles()

    return (
        <div>
            <Accordion style={{backgroundColor: "#c6cceb"}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography className={classes.heading}>Группы</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        <ListItem>
                            <Group/>
                        </ListItem>
                    </List>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default Group