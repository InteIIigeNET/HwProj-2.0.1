import {FC} from "react";
import {Box} from "@mui/material";

// Цвет плитки курса выводится из его названия, чтобы курс узнавался с одного взгляда
// и одинаково выглядел в списке курсов, в событиях и на странице курса
const getHue = (value: string) => {
    let hash = 0
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 360
    return hash
}

const getInitials = (value: string) => value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase()

export const CourseTile: FC<{
    name: string
    size?: number
    fontSize?: string
    borderRadius?: string
}> = ({name, size = 44, fontSize = "1rem", borderRadius = "12px"}) => {
    const hue = getHue(name)

    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: borderRadius,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: fontSize,
                fontWeight: 700,
                backgroundColor: `hsl(${hue}, 70%, 94%)`,
                color: `hsl(${hue}, 45%, 38%)`,
            }}
        >
            {getInitials(name)}
        </Box>
    )
}
