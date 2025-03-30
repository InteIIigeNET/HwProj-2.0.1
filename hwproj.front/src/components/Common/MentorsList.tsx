import {FC} from "react";
import {AccountDataDto} from "../../api";
import {Typography} from "@material-ui/core";
import * as React from "react";
import {Badge, Stack, Tooltip} from "@mui/material";

const MentorsList: FC<{
    mentors: AccountDataDto[]
}> = (props) => {
    const count = 1
    const {mentors} = props
    const mentorsToShow = mentors.length > count ? mentors.slice(0, count) : mentors
    const mentorsToHide = mentors.length > count ? mentors.slice(count) : []
    const fontSize = 18

    return <Stack direction={"row"} alignItems={"center"} spacing={1}>
        <Typography style={{fontSize: fontSize, color: "GrayText"}}>
            {mentorsToShow.map(t => `${t.name} ${t.surname}`).join(", ")}
        </Typography>
        {mentorsToHide.length > 0 && <Tooltip arrow title={
            <span style={{whiteSpace: 'pre-line'}}>
                <Typography variant={"body1"}>
                    {mentorsToHide.map(t => <div>{`${t.name} ${t.surname}`}
                <Typography component="div" variant={"body1"}>
                        <sub style={{color: "powderblue"}}> {t.companyName}</sub>
                    </div>)}
                </Typography>
            </span>}>
            <Badge showZero={false} badgeContent={mentorsToHide.length} color="primary"
                   sx={{"& .MuiBadge-badge": {fontSize: 9, height: 15, minWidth: 10, backgroundColor: "darkgray"}}}>
                <div style={{width: 3, height: fontSize}}/>
            </Badge>
        </Tooltip>}
    </Stack>
}

export default MentorsList;
