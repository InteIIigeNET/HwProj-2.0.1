import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {HomeworkTaskViewModel} from "@/api";
import {FC} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import Utils from "../../services/Utils";
import {getTip} from "../Common/HomeworkTags";
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {MarkdownPreview} from "../Common/MarkdownEditor";
import TaskCriteria from "@/components/Tasks/TaskCriteria";

interface ITaskProp {
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isExpanded: boolean,
    isReadingMode: boolean,
    onDeleteClick: () => void,
    showForCourse: boolean
}

// Оформление согласовано с редизайном страницы курса: панель с рамкой вместо «полосатого» аккордеона
const accordionSx = {
    width: "100%",
    border: "1px solid #c4cad2",
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor: "#fff",
    // Аккордеон по умолчанию рисует разделитель сверху и раздвигает себя при раскрытии
    "&:before": {display: "none"},
    "&.Mui-expanded": {margin: 0},
}

const summarySx = (isDeferred: boolean) => ({
    px: {xs: 2, sm: 2.5},
    backgroundColor: isDeferred ? "#f1f2f5" : "#f7f8fd",
    "&.Mui-expanded": {borderBottom: "1px solid #e6e8f0"},
    "& .MuiAccordionSummary-content": {my: 1.75, minWidth: 0},
})

const titleSx = {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.3,
    wordBreak: "break-word" as const,
}

const accentChipSx = {
    height: 24,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 600},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

const metaChipSx = {
    height: 24,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

// Жёсткий дедлайн и незаполненные даты — предупреждающие состояния, поэтому тёплая плашка
const warnChipSx = {
    height: 24,
    backgroundColor: "#fff4d6",
    color: "#8a6d00",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

const plainChipSx = {
    height: 24,
    backgroundColor: "transparent",
    color: "text.secondary",
    border: "1px dashed #c9cedb",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
}

const Task: FC<ITaskProp> = (props) => {
    const publicationDate = new Date(props.task.publicationDate!)
    const deadlineDate = new Date(props.task.deadlineDate!)

    const publicationDateIsSet = !props.task.publicationDateNotSet
    const deadlineDateIsSet = !props.task.deadlineDateNotSet

    const {task} = props

    const publicationDateString = Utils.renderReadableDate(publicationDate)
    const deadlineDateString = Utils.renderReadableDate(deadlineDate)


    return (
        <Box sx={{width: '100%'}}>
            <Accordion
                disableGutters
                elevation={0}
                expanded={props.isExpanded ? true : undefined}
                sx={accordionSx}
            >
                <AccordionSummary
                    expandIcon={!props.isExpanded ? <ExpandMoreIcon/> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    sx={summarySx(task.isDeferred!)}
                >
                    <Box sx={{minWidth: 0}}>
                        <Typography component={"h2"} sx={titleSx}>
                            {task.title}{getTip(task)}
                        </Typography>
                        <Stack direction={"row"} spacing={0.75} useFlexGap flexWrap={"wrap"} sx={{mt: 1}}>
                            <Tooltip arrow title={"Максимальный балл"}>
                                <Chip
                                    size={"small"}
                                    icon={<StarRoundedIcon/>}
                                    label={task.maxRating}
                                    sx={accentChipSx}/>
                            </Tooltip>
                            {task.isGroupWork &&
                                <Chip
                                    size={"small"}
                                    icon={<GroupIcon/>}
                                    label="Командное"
                                    sx={metaChipSx}/>
                            }
                            {props.forMentor && publicationDateIsSet &&
                                <Tooltip arrow title={"Дата публикации"}>
                                    <Chip
                                        size={"small"}
                                        icon={<ScheduleIcon/>}
                                        label={publicationDateString}
                                        sx={metaChipSx}/>
                                </Tooltip>
                            }
                            {props.forMentor && !publicationDateIsSet &&
                                <Tooltip arrow title={"Не выставлена дата публикации"}>
                                    <Chip
                                        size={"small"}
                                        icon={<WarningAmberRoundedIcon/>}
                                        label="Нет публикации"
                                        sx={warnChipSx}/>
                                </Tooltip>
                            }
                            {task.hasDeadline && deadlineDateIsSet &&
                                <Tooltip
                                    arrow
                                    title={task.isDeadlineStrict ? "Нельзя публиковать решения после дедлайна" : "Дедлайн"}
                                >
                                    <Chip
                                        size={"small"}
                                        icon={task.isDeadlineStrict
                                            ? <LockClockOutlinedIcon/>
                                            : <EventOutlinedIcon/>}
                                        label={"До " + deadlineDateString}
                                        sx={task.isDeadlineStrict ? warnChipSx : metaChipSx}/>
                                </Tooltip>
                            }
                            {props.forMentor && task.hasDeadline && !deadlineDateIsSet &&
                                <Tooltip arrow title={"Не выставлена дата дедлайна"}>
                                    <Chip
                                        size={"small"}
                                        icon={<WarningAmberRoundedIcon/>}
                                        label="Нет дедлайна"
                                        sx={warnChipSx}/>
                                </Tooltip>
                            }
                            {!task.hasDeadline &&
                                <Chip size={"small"} label="Без дедлайна" sx={plainChipSx}/>
                            }
                        </Stack>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{px: {xs: 2, sm: 2.5}, py: 2.5}}>
                    {task.description
                        ? <Typography component="div" style={{color: "#454545"}} variant="body1">
                            <MarkdownPreview value={task.description!}/>
                        </Typography>
                        : <Typography variant={"body2"} sx={{color: "text.disabled", fontStyle: "italic"}}>
                            Условие задачи не заполнено
                        </Typography>}
                    <TaskCriteria task={task}/>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

export default Task
