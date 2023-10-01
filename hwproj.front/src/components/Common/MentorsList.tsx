import {FC} from "react";
import {AccountDataDto} from "../../api";
import {Typography} from "@material-ui/core";
import * as React from "react";
import {Chip, Stack, Tooltip} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';

const MentorsList: FC<{
    mentors: AccountDataDto[]
}> = (props) => {
    const count = 1
    const {mentors} = props
    const mentorsToShow = mentors.length > count ? mentors.slice(0, count) : mentors
    const mentorsToHide = mentors.length > count ? mentors.slice(count) : []

    return <Stack direction={"row"} alignItems={"center"} spacing={1}>
        <Typography style={{fontSize: "18px", color: "GrayText"}}>
            {mentorsToShow.map(t => `${t.name} ${t.surname}`).join(", ")}
        </Typography>
        {mentorsToHide.length > 0 && <Tooltip arrow title={
            <span style={{whiteSpace: 'pre-line'}}>
                <Typography variant={"body1"}>
                    {mentorsToHide.map(t => `${t.name} ${t.surname}`).join("\n")}
                </Typography>
            </span>}>
            <Chip size={"small"}
                  label={<Stack alignItems={"center"} direction={"row"} spacing={0.5}>
                      <div style={{color: "GrayText"}}>+{mentorsToHide.length}</div>
                      <SchoolIcon style={{color: "GrayText"}} fontSize={"small"}/>
                  </Stack>}/>
        </Tooltip>}
    </Stack>
}

export default MentorsList;
