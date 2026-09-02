import React, {FC, ReactNode, useState} from 'react';
import {TaskDeadlineDto, TaskDeadlineView} from "../../api";
import {NavLink} from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    ListItem,
    ListItemButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {DoDisturbAltOutlined} from "@mui/icons-material";
import {colorBetween} from "../../services/JsUtils";
import Utils from "../../services/Utils";
import ApiSingleton from "../../api/ApiSingleton";
import {getTip} from "../Common/HomeworkTags";
import {CourseTile} from "../Common/CourseTile";

interface ITaskDeadlinesProps {
    taskDeadlines: TaskDeadlineView[]
    onGiveUpClick: () => void
}

const DAY = 1000 * 60 * 60 * 24

const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const rowSx = {
    px: 2,
    py: 1.5,
    alignItems: "flex-start",
    gap: 1.5,
    color: "#212529",
    textDecoration: "none",
    // Bootstrap подчёркивает и перекрашивает ссылки на hover — строка списка не должна вести себя как текстовая ссылка
    "&:hover, &:focus": {color: "#212529", textDecoration: "none"},
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

const getPercent = (startDate: Date, endDate: Date) => {
    const startDateNumber = new Date(startDate).getTime()
    const endDateNumber = new Date(endDate).getTime()
    const currentDateNumber = new Date().getTime()
    return clamp((currentDateNumber - startDateNumber) * 100 / (endDateNumber - startDateNumber), 0, 100)
}

const renderBadge = (solutionState: TaskDeadlineView["solutionState"], rating: number, maxRating: number) => {
    if (solutionState === null)
        return <Chip color="error" size={"small"} label={"Не решено"}/>

    if (solutionState === 0) //POSTED
        return <Chip color="info" size={"small"} label={"Ожидает проверки"}/>

    const color = colorBetween(0xff0000, 0x2cba00, Math.min(rating, maxRating) / maxRating * 100)
    return <Chip
        size={"small"}
        label={`⭐ ${rating}/${maxRating}`}
        sx={{backgroundColor: color, color: "#fff", fontWeight: 500}}
    />
}

const EmptyState: FC<{ text: string }> = ({text}) => (
    <Box
        sx={{
            py: 6,
            textAlign: "center",
            border: "1px dashed #d7dbe0",
            borderRadius: "14px",
            color: "text.secondary",
        }}
    >
        <Typography variant={"body1"}>{text}</Typography>
    </Box>
)

const DeadlineRow: FC<{
    view: TaskDeadlineView
    onGiveUp: (taskId: number) => void
}> = ({view, onGiveUp}) => {
    const {rating, deadlinePast, solutionState} = view
    const deadline = view.deadline as TaskDeadlineDto

    const timeLeft = new Date(deadline.deadlineDate!).getTime() - new Date().getTime()
    // за сутки до дедлайна подсвечиваем прогресс жёлтым, после дедлайна — красным
    const isUrgent = !deadlinePast && timeLeft < DAY
    const progressColor = deadlinePast ? "error" : isUrgent ? "warning" : "primary"
    const timeLeftColor = deadlinePast ? "error.main" : isUrgent ? "warning.dark" : "text.secondary"
    const timeLeftLabel = deadlinePast ? "Дедлайн прошёл" : `Через ${Utils.pluralizeDateTime(timeLeft)}`

    const canGiveUp = solutionState == null

    const giveUpAction: ReactNode = (
        <Tooltip title={"Отказаться от решения задачи"}>
            <IconButton
                className={"giveUpAction"}
                size={"small"}
                aria-label={"Отказаться от решения задачи"}
                onClick={() => onGiveUp(deadline.taskId!)}
                sx={{
                    color: "text.disabled",
                    transition: "opacity .2s",
                    // на тач-устройствах курсор наводить некуда, поэтому там кнопка видна всегда
                    opacity: {xs: 1, sm: 0},
                    pointerEvents: {xs: "auto", sm: "none"},
                    "&:hover": {color: "error.main"},
                }}
            >
                <DoDisturbAltOutlined fontSize={"small"}/>
            </IconButton>
        </Tooltip>
    )

    return (
        <ListItem
            component={"div"}
            disablePadding
            secondaryAction={canGiveUp ? giveUpAction : undefined}
            sx={{"&:hover .giveUpAction, &:focus-within .giveUpAction": {opacity: 1, pointerEvents: "auto"}}}
        >
            <ListItemButton component={NavLink} to={`/task/${deadline.taskId}`} sx={rowSx}>
                <CourseTile name={deadline.courseTitle ?? ""}/>
                <Box sx={{flexGrow: 1, minWidth: 0}}>
                    <Stack direction={"row"} alignItems={"center"} spacing={1} flexWrap={"wrap"} sx={{rowGap: 0.5}}>
                        <Typography component={"span"} sx={{fontSize: "1rem", fontWeight: 600}}>
                            {deadline.taskTitle}{getTip(deadline)}
                        </Typography>
                        {!deadlinePast && renderBadge(solutionState, rating!, deadline.maxRating!)}
                    </Stack>
                    <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                        {deadline.courseTitle}
                    </Typography>
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1.5}
                        flexWrap={"wrap"}
                        sx={{mt: 1, rowGap: 0.5}}
                    >
                        <LinearProgress
                            variant={"determinate"}
                            color={progressColor}
                            value={deadlinePast ? 100 : getPercent(deadline.publicationDate!, deadline.deadlineDate!)}
                            sx={{
                                flexGrow: 1,
                                minWidth: 80,
                                height: 6,
                                borderRadius: "3px",
                                backgroundColor: "#eceff3",
                            }}
                        />
                        <Typography
                            variant={"caption"}
                            sx={{flexShrink: 0, whiteSpace: "nowrap", color: "text.secondary"}}
                        >
                            <Box component={"span"} sx={{color: timeLeftColor, fontWeight: 500}}>
                                {timeLeftLabel}
                            </Box>
                            {` · ${Utils.renderReadableDate(deadline.deadlineDate!)}`}
                        </Typography>
                    </Stack>
                </Box>
            </ListItemButton>
        </ListItem>
    )
}

const TaskDeadlines: FC<ITaskDeadlinesProps> = ({taskDeadlines, onGiveUpClick}) => {
    const [showGiveUpModalForTaskId, setShowGiveUpModalForTaskId] = useState<number | undefined>(undefined);

    const giveUp = async (taskId: number) => {
        await ApiSingleton.solutionsApi.solutionsGiveUp(taskId);
        setShowGiveUpModalForTaskId(undefined);
        onGiveUpClick();
    };

    return (
        <div>
            {taskDeadlines.length === 0
                ? <EmptyState text={"Нет ближайших дедлайнов."}/>
                : <Paper variant={"outlined"} sx={panelSx}>
                    <Stack divider={<Divider/>}>
                        {taskDeadlines.map(view =>
                            <DeadlineRow
                                key={view.deadline!.taskId}
                                view={view}
                                onGiveUp={setShowGiveUpModalForTaskId}
                            />)}
                    </Stack>
                </Paper>}
            <Dialog open={showGiveUpModalForTaskId !== undefined}
                    onClose={() => setShowGiveUpModalForTaskId(undefined)}
                    fullWidth
                    maxWidth={"xs"}
                    PaperProps={{sx: {borderRadius: "16px"}}}
                    aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" sx={{pb: 1, fontSize: "1.1rem", fontWeight: 500}}>
                    Отказаться от решения задачи
                </DialogTitle>
                <DialogContent>
                    <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                        Вы уверены? Задача автоматически будет оценена в 0 баллов.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2}}>
                    <Button
                        size="small"
                        onClick={() => setShowGiveUpModalForTaskId(undefined)}
                        sx={{textTransform: "none"}}>
                        Отменить
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => showGiveUpModalForTaskId && giveUp(showGiveUpModalForTaskId)}
                        sx={{textTransform: "none"}}>
                        Отказаться
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TaskDeadlines;
