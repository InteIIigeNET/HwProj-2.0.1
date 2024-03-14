import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import {IconButton} from "@material-ui/core";
import {useState} from "react";
import LecturerStatistics from "./Statistics/LecturerStatistics";

export default function SettingsDrawer() {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const[showStatistics, setShowStatistics] = useState<boolean>(false)

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                <ListItem key={"Статистика"} disablePadding>
                    <ListItemButton onClick={() => setShowStatistics(true)}>
                        <ListItemIcon>
                            <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Статистика"} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <IconButton onClick={toggleDrawer(true)}>
                <SettingsIcon>
                    <AssessmentIcon>Доп. настройки</AssessmentIcon>
                </SettingsIcon>
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
            {showStatistics &&(
                <LecturerStatistics onClose={() => setShowStatistics(false)}/>
            )}
        </>
    );
}