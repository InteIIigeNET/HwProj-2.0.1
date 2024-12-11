import {Stack, Typography} from "@mui/material";
import React from "react";

export default class NameBuilder {
    static getUserFullName(
        name: string | undefined,
        surname: string | undefined,
        middleName: string | undefined
    ) {
        return [surname, name, middleName]
            .filter(Boolean)
            .join(' ');
    }

    static getCourseFullName(
        courseName: string,
        groupName: string | undefined,
    ) {
        return <Stack direction={"column"}>
            {courseName}
            {groupName && <Typography variant={"caption"} style={{color: "GrayText"}}>{groupName}</Typography>}
        </Stack>
    }
}