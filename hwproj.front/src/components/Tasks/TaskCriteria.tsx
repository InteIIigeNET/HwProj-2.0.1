import {HomeworkTaskViewModel} from "@/api";
import {Box, Chip, Divider, Stack, Tooltip, Typography} from "@mui/material";
import {FC} from "react";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Utils from "../../services/Utils";

const CriterionTypeDeadline = 1;

// Оформление согласовано с редизайном страницы курса: скруглённая панель с мягкой шапкой
const panelSx = {
    mt: 2,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
    overflow: "hidden",
}

const headerSx = {
    px: 1.5,
    py: 0.875,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const rowSx = {
    px: 1.5,
    py: 1,
}

const countChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const pointsChipSx = {
    height: 24,
    flexShrink: 0,
    backgroundColor: "#eef0f5",
    color: "text.primary",
    "& .MuiChip-label": {px: 1, fontSize: "0.8125rem", fontWeight: 600},
}

// Штраф отличается от баллов цветом: его вычитают, а не начисляют
const penaltyChipSx = {
    height: 24,
    flexShrink: 0,
    backgroundColor: "#fff4d6",
    color: "#9a5b00",
    "& .MuiChip-label": {px: 1, fontSize: "0.8125rem", fontWeight: 600},
}

const TaskCriteria: FC<{ task: HomeworkTaskViewModel }> = ({task}) => {
    return task.criteria && task.criteria.length > 0 ? (
        <Box sx={panelSx}>
            <Stack direction="row" alignItems="center" spacing={1} sx={headerSx}>
                <ChecklistRoundedIcon fontSize="small"/>
                <Typography variant="body2" sx={{fontWeight: 500}}>
                    Критерии оценивания
                </Typography>
                <Chip size="small" label={task.criteria.length} sx={countChipSx}/>
            </Stack>
            <Divider/>

            <Stack divider={<Divider/>}>
                {task.criteria.map(c => (
                    <Stack key={c.id} direction="row" alignItems="center" spacing={1} sx={rowSx}>
                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                {c.name}
                            </Typography>
                            {c.type === CriterionTypeDeadline && c.arguments && (
                                <Stack direction="row" alignItems="center" spacing={0.5}
                                       sx={{mt: 0.25, color: "text.secondary"}}>
                                    <ScheduleIcon sx={{fontSize: 13, flexShrink: 0}}/>
                                    <Typography variant="caption">
                                        До {Utils.renderDateWithoutSeconds(new Date(c.arguments))}
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                        {c.type === CriterionTypeDeadline ? (
                            <Tooltip arrow placement="left" title={"Штраф за нарушение срока"}>
                                <Chip size="small" label={"−" + c.maxPoints} sx={penaltyChipSx}/>
                            </Tooltip>
                        ) : (
                            <Chip size="small" label={c.maxPoints} sx={pointsChipSx}/>
                        )}
                    </Stack>
                ))}
            </Stack>
        </Box>
    ) : null
}
export default TaskCriteria;
