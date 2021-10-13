import React, {FC, useEffect, useState} from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {IconButton, ListItem, Theme} from "@material-ui/core";
import List from "@material-ui/core/List";
import DeleteIcon from "@material-ui/icons/Delete";
import {AccountDataDto, GroupViewModel, StatisticsCourseGroupModel} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";

interface GroupState {
    id: number;
    courseId: number;
    name: string;
    groupMates?: AccountDataDto[];
}

interface GroupProps {
    group: GroupState;
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
        tools: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        }
    }),
);


const Group: FC<GroupProps> = (props) => {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: "#eceef8"}}
                >
                    <div className={classes.tools}>
                        <Typography className={classes.heading}>{props.group.name}</Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    {props.group.groupMates!.length !== 0 &&
                        <List>
                            {props.group.groupMates!.map((gm) => {
                                return (
                                    <ListItem>
                                        <Typography>
                                            {gm.surname}&nbsp;{gm.name}
                                        </Typography>
                                    </ListItem>
                                )
                            })}
                        </List>
                    }
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default Group