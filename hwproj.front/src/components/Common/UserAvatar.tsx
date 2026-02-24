import {AccountDataDto} from "@/api";
import {FC} from "react";
import AvatarUtils from "@/components/Utils/AvatarUtils";
import {Avatar} from "@mui/material";
import {Avatar as Avatarka, generateParams, getThemeNames} from 'avatarka-react';

const themes = getThemeNames().filter(x => x !== "geometric")

export const UserAvatar: FC<{ user: AccountDataDto }> = ({user}) => {
    if (user.githubId) return <Avatar {...AvatarUtils.stringAvatar(user)}/>

    const hash = [...user.userId!].reduce((h, c) => Math.imul(h, 31) + c.charCodeAt(0) | 0, 0) >>> 0
    const index = hash % themes.length
    const theme = themes[index]
    const params = generateParams(theme, user.userId);
    return <Avatarka params={{...params, backgroundShape: "circle"}} theme={theme} size={40}/>;
}
