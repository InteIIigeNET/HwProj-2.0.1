import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {HomeworkTaskViewModel} from "@/api";
import {FC, useState} from "react";
import {
    Box,
    ButtonBase,
    Chip,
    Collapse,
    Divider,
    Paper,
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
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
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

// Оформление согласовано с редизайном страницы решений: та же рамка, радиусы и мягкие шапки.
// Аккордеон заменён на панель с Collapse: он рисовал свои отступы и разделители и мешал
// держать одинаковые скругления с остальными карточками
const cardSx = {
    width: "100%",
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const headerSx = (isDeferred: boolean) => ({
    px: {xs: 2, sm: 2.5},
    py: 1.75,
    backgroundColor: isDeferred ? "#f1f2f5" : "#f7f8fd",
})

// Строка «Условие задачи» — одновременно кнопка и заголовок раздела: пока условие свёрнуто, она
// закрывает низ карточки и показывает начало текста, а раскрытая становится шапкой содержимого
const conditionRowSx = (isOpen: boolean) => ({
    width: "100%",
    justifyContent: "flex-start",
    px: {xs: 2, sm: 2.5},
    py: 1.25,
    color: "#3f51b5",
    backgroundColor: isOpen ? "#fff" : "#fafbfe",
    transition: "background-color .15s",
    "&:hover": {backgroundColor: isOpen ? "#f7f8fd" : "#f1f3fb"},
})

const conditionPlaceholderRowSx = {
    px: {xs: 2, sm: 2.5},
    py: 1.25,
    backgroundColor: "#fafbfe",
}

const contentSx = {
    px: {xs: 2, sm: 2.5},
    pt: 0.5,
    pb: 2.5,
}

const chevronSx = (isOpen: boolean) => ({
    fontSize: 20,
    flexShrink: 0,
    transition: "transform .2s",
    transform: isOpen ? "rotate(180deg)" : "none",
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

const criteriaHintChipSx = {
    height: 22,
    flexShrink: 0,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.625, mr: -0.375, fontSize: 14, color: "inherit"},
}

// Свёрнутое условие показываем одной строкой, поэтому из markdown убираем разметку — иначе
// в подсказку попадают решётки заголовков и звёздочки
const plainTextPreview = (markdown: string) => markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200)

const Task: FC<ITaskProp> = (props) => {
    const publicationDate = new Date(props.task.publicationDate!)
    const deadlineDate = new Date(props.task.deadlineDate!)

    const publicationDateIsSet = !props.task.publicationDateNotSet
    const deadlineDateIsSet = !props.task.deadlineDateNotSet

    const {task} = props

    const publicationDateString = Utils.renderReadableDate(publicationDate)
    const deadlineDateString = Utils.renderReadableDate(deadlineDate)

    // Условие по умолчанию свёрнуто: на страницах решений важнее сами решения
    const [isConditionOpen, setIsConditionOpen] = useState(false)
    const isOpen = props.isExpanded || isConditionOpen

    const criteriaCount = task.criteria?.length ?? 0
    const hasCondition = !!task.description || criteriaCount > 0
    const descriptionPreview = task.description ? plainTextPreview(task.description) : ""

    // Раскрытое условие подхватывает строку-заголовок сверху, поэтому своего отступа ему почти
    // не нужно; когда строки нет, отступ берём обычный, как в других карточках
    const renderConditionContent = (pt: number) => (
        <Box sx={{...contentSx, pt}}>
            {task.description
                ? <Typography component="div" style={{color: "#454545"}} variant="body1">
                    <MarkdownPreview value={task.description!}/>
                </Typography>
                : <Typography variant={"body2"} sx={{color: "text.disabled", fontStyle: "italic"}}>
                    Условие задачи не заполнено
                </Typography>}
            <TaskCriteria task={task}/>
        </Box>
    )

    return (
        <Paper variant={"outlined"} sx={cardSx}>
            <Box sx={headerSx(task.isDeferred!)}>
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
            <Divider/>

            {/* Условие раскрывается по клику на всю строку: она же показывает, что внутри —
                начало текста и число критериев, — поэтому свёрнутая карточка не выглядит пустой */}
            {props.isExpanded
                ? renderConditionContent(2)
                : hasCondition
                    ? <>
                        <ButtonBase
                            focusRipple
                            aria-expanded={isOpen}
                            onClick={() => setIsConditionOpen(!isConditionOpen)}
                            sx={conditionRowSx(isOpen)}
                        >
                            <Stack
                                direction={"row"}
                                alignItems={"center"}
                                spacing={1}
                                sx={{width: "100%", minWidth: 0}}
                            >
                                <SubjectRoundedIcon sx={{fontSize: 19, flexShrink: 0}}/>
                                <Typography variant={"body2"} sx={{fontWeight: 500, flexShrink: 0}}>
                                    Условие задачи
                                </Typography>
                                {/* Пока условие свёрнуто — начало текста как подсказка */}
                                {!isOpen &&
                                    <Typography
                                        variant={"body2"}
                                        noWrap
                                        sx={{minWidth: 0, color: "text.secondary"}}
                                    >
                                        {descriptionPreview || "не заполнено"}
                                    </Typography>}
                                <Box sx={{flexGrow: 1}}/>
                                {criteriaCount > 0 && !isOpen &&
                                    <Chip
                                        size={"small"}
                                        icon={<ChecklistRoundedIcon/>}
                                        label={criteriaCount}
                                        sx={criteriaHintChipSx}/>}
                                <ExpandMoreIcon sx={chevronSx(isOpen)}/>
                            </Stack>
                        </ButtonBase>
                        <Collapse in={isOpen} timeout={220} unmountOnExit>
                            {renderConditionContent(0.5)}
                        </Collapse>
                    </>
                    : <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1}
                        sx={conditionPlaceholderRowSx}
                    >
                        <SubjectRoundedIcon sx={{fontSize: 19, flexShrink: 0, color: "text.disabled"}}/>
                        <Typography variant={"body2"} sx={{color: "text.disabled", fontStyle: "italic"}}>
                            Условие задачи не заполнено
                        </Typography>
                    </Stack>}
        </Paper>
    );
}

export default Task
