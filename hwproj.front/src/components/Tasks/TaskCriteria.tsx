import {HomeworkTaskViewModel} from "@/api";
import {Chip, Divider, Stack, Typography} from "@mui/material";
import {FC} from "react";
import Utils from "../../services/Utils";

const CriterionTypeDeadline = 1;

const autoCriterionChipSx = {
    height: 22,
    backgroundColor: "#E8F8EE",
    color: "#159947",
    fontWeight: 600,
    "& .MuiChip-label": {
        px: 1,
    },
};

const TaskCriteria: FC<{ task: HomeworkTaskViewModel }> = ({task}) => {
    return task.criteria && task.criteria.length > 0 ? (
        <>
            <Divider style={{marginTop: 15, marginBottom: 10}}/>

            <Typography variant="h6" gutterBottom style={{fontSize: 16}}>
                Критерии оценивания
            </Typography>

            <Stack spacing={0.5}>
                {task.criteria.map(c => (
                    <Stack key={c.id} direction="row" alignItems={"center"} justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Stack spacing={0}>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Typography variant="body2">
                                        {c.name}
                                    </Typography>
                                    {c.type === CriterionTypeDeadline && (
                                        <Chip
                                            label="Авто"
                                            size="small"
                                            sx={autoCriterionChipSx}
                                        />
                                    )}
                                </Stack>
                                {c.type === CriterionTypeDeadline && c.arguments && (
                                    <Typography variant="caption" color="text.secondary">
                                        До {Utils.renderDateWithoutSeconds(new Date(c.arguments))}
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                        {c.type === CriterionTypeDeadline ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "#9A5B00",
                                        fontWeight: 600,
                                        fontSize: 11,
                                    }}
                                >
                                    Штраф
                                </Typography>
                                <Chip
                                    style={{fontSize: 14}}
                                    size={"small"}
                                    color={"warning"}
                                    label={c.maxPoints}
                                    sx={{
                                        backgroundColor: "#FFF4D6",
                                        color: "#9A5B00",
                                        fontWeight: 600,
                                    }}
                                />
                            </Stack>
                        ) : (
                            <Chip
                                style={{fontSize: 14}}
                                size={"small"}
                                color={"default"}
                                label={c.maxPoints}
                            />
                        )}
                    </Stack>
                ))}
            </Stack>
        </>
    ) : null
}
export default TaskCriteria;
