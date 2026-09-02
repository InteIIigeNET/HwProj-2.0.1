import {AccountDataDto} from "@/api";
import {FC} from "react";
import {Avatar} from "@mui/material";

// Цвет плашки с инициалами выводится из имени, чтобы человека было легче узнавать в списках
const getHue = (value: string) => {
    let hash = 0
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 360
    return hash
}

export const UserInitialsAvatar: FC<{
    user: AccountDataDto
    size?: number
    fontSize?: string
}> = ({user, size = 38, fontSize = "0.85rem"}) => {
    const fullName = `${user.surname ?? ""} ${user.name ?? ""}`.trim()
    const hue = getHue(fullName)

    return (
        <Avatar
            // GitHub-аватар грузится по логину; если логина нет или картинка не загрузилась,
            // Avatar сам покажет инициалы
            src={user.githubId ? `https://github.com/${user.githubId}.png?size=${size * 2}` : undefined}
            alt={fullName}
            sx={{
                width: size,
                height: size,
                fontSize: fontSize,
                fontWeight: 600,
                backgroundColor: `hsl(${hue}, 70%, 94%)`,
                color: `hsl(${hue}, 45%, 38%)`,
            }}
        >
            {`${user.surname?.[0] ?? ""}${user.name?.[0] ?? ""}`}
        </Avatar>
    )
}
