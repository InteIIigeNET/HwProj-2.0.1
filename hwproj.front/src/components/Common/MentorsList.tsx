import {FC, useState} from "react";
import * as React from "react";
import {AccountDataDto} from "@/api";
import {Box, Stack, Tooltip, Typography} from "@mui/material";
import {UserInitialsAvatar} from "./UserInitialsAvatar";
import Utils from "../../services/Utils";

const mentorPlurals = ["преподаватель", "преподавателя", "преподавателей"]

const fullNameOf = (mentor: AccountDataDto) => `${mentor.name ?? ""} ${mentor.surname ?? ""}`.trim()

const tooltipTitle = (mentors: AccountDataDto[]) =>
    <Stack spacing={0.5}>
        {mentors.map(mentor =>
            <Box key={mentor.userId}>
                <Typography variant={"body2"} sx={{fontWeight: 500, lineHeight: 1.3}}>
                    {fullNameOf(mentor)}
                </Typography>
                {mentor.companyName &&
                    <Typography variant={"caption"} sx={{opacity: 0.75}}>
                        {mentor.companyName}
                    </Typography>}
            </Box>)}
    </Stack>

// Аватарки преподавателей лежат стопкой с перекрытием, а при наведении на список разъезжаются,
// чтобы курс можно было узнать по лицам, не занимая места в карточке
const MentorsList: FC<{
    mentors: AccountDataDto[]
    size?: number
}> = ({mentors, size = 28}) => {
    // Индекс аватарки под курсором: по нему подписываем конкретного преподавателя рядом со стопкой
    const [hovered, setHovered] = useState<number | null>(null)

    if (mentors.length === 0) return null

    const max = 4
    const visible = mentors.length > max ? mentors.slice(0, max - 1) : mentors
    const hidden = mentors.slice(visible.length)

    const overlap = Math.round(size * 0.35)
    const hoveredMentor = hovered !== null ? visible[hovered] : undefined

    const bubbleSx = {
        display: "flex",
        borderRadius: "50%",
        border: "2px solid #fff",
        backgroundColor: "#fff",
        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.16)",
        cursor: "default",
        transition: "margin-left .25s ease, transform .2s ease",
        ml: `-${overlap}px`,
        "&:first-of-type": {ml: 0},
        "&:hover": {transform: "translateY(-2px) scale(1.08)"},
    }

    return (
        <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{minWidth: 0}}>
            <Box
                onMouseLeave={() => setHovered(null)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    // Стопка раскрывается при наведении на любую её часть
                    "&:hover > *": {ml: "3px", "&:first-of-type": {ml: 0}},
                }}
            >
                {visible.map((mentor, index) =>
                    <Tooltip arrow key={mentor.userId} title={tooltipTitle([mentor])}>
                        <Box
                            onMouseEnter={() => setHovered(index)}
                            // Левые аватарки лежат поверх правых, а та, что под курсором — поверх всех
                            sx={{...bubbleSx, zIndex: hovered === index ? max + 1 : visible.length - index}}
                        >
                            <UserInitialsAvatar
                                user={mentor}
                                size={size}
                                fontSize={`${Math.round(size * 0.36)}px`}
                            />
                        </Box>
                    </Tooltip>)}
                {hidden.length > 0 &&
                    <Tooltip arrow title={tooltipTitle(hidden)}>
                        <Box sx={{...bubbleSx, zIndex: 0}}>
                            <Box
                                sx={{
                                    width: size,
                                    height: size,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: `${Math.round(size * 0.36)}px`,
                                    fontWeight: 600,
                                    backgroundColor: "#eceff4",
                                    color: "#5a6472",
                                }}
                            >
                                +{hidden.length}
                            </Box>
                        </Box>
                    </Tooltip>}
            </Box>
            <Typography
                noWrap
                sx={{
                    minWidth: 0,
                    fontSize: "0.875rem",
                    lineHeight: 1.3,
                    color: hoveredMentor ? "text.primary" : "text.secondary",
                    transition: "color .2s ease",
                }}
            >
                {hoveredMentor
                    ? fullNameOf(hoveredMentor)
                    : mentors.length === 1
                        ? fullNameOf(mentors[0])
                        : `${mentors.length} ${Utils.pluralizeHelper(mentorPlurals, mentors.length)}`}
            </Typography>
        </Stack>
    )
}

export default MentorsList;
