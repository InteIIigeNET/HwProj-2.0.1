import {FC} from "react";
import {AccountDataDto} from "@/api";
import {Typography} from "@material-ui/core";
import * as React from "react";
import {Stack, Tooltip} from "@mui/material";

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
        {mentorsToHide.length > 0 &&
            <Tooltip arrow title={
                <span style={{whiteSpace: 'pre-line'}}>
                <Typography component="div" variant={"body1"}>
                    {mentorsToHide.map((t, index) => <div key={index}>{`${t.name} ${t.surname}`}
                        <sub style={{color: "powderblue"}}> {t.companyName}</sub>
                    </div>)}
                </Typography>
            </span>}>
                <Typography style={{fontSize: fontSize, cursor: "default"}} color={"primary"}>
                    и ещё {mentorsToHide.length}
                </Typography>
            </Tooltip>}
    </Stack>
}

export default MentorsList;
