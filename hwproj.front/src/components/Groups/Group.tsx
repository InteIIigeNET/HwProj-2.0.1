import React, {FC} from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {IconButton, ListItem, Theme} from "@material-ui/core";
import List from "@material-ui/core/List";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import {GroupViewModel} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";

interface GroupProps {
    group: GroupViewModel;
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
    const group = props.group

    const GetGroupMates = async () => {
        debugger
        const groupMates = group.groupMates!.map(async (gm) => {
            const student = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(gm.studentId!)
            return (
                <ListItem>
                    {student.surname}&nbsp;{student.name}
                    <IconButton aria-label="Delete" onClick={() => console.log("Hello")}>
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </ListItem>
            )
        })
        return (
            <List>
                {groupMates}
            </List>
        )
    };

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
                        <Typography className={classes.heading}>{group.name}</Typography>
                        <IconButton aria-label="Edit" onClick={() => console.log("Hello")}>
                            <EditIcon fontSize="small"/>
                        </IconButton>
                        <IconButton aria-label="Delete" onClick={() => console.log("Hello")}>
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    {group.groupMates?.length !== 0 &&
                        GetGroupMates()
                    }
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default Group