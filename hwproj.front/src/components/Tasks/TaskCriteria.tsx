import {HomeworkTaskViewModel} from "@/api";
import {Chip, Divider, Stack, Typography} from "@mui/material";
import {FC} from "react";
import Utils from "../../services/Utils";

const CriterionTypeDeadline = 1;

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
                                <Typography variant="body2">
                                    {c.name}
                                    {c.type === CriterionTypeDeadline && (
                                        <sup style={{color: "#159947", fontWeight: 600}}> авто</sup>
                                    )}
                                </Typography>
                                {c.type === CriterionTypeDeadline && c.arguments && (
                                    <Typography variant="caption" color="text.secondary">
                                        До {Utils.renderDateWithoutSeconds(new Date(c.arguments))} · Штраф
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                        <Chip
                            style={{fontSize: 14}}
                            size={"small"}
                            color={c.type === CriterionTypeDeadline ? "warning" : "default"}
                            label={c.type === CriterionTypeDeadline ? `Штраф ${c.maxPoints}` : c.maxPoints}
                            sx={c.type === CriterionTypeDeadline ? {
                                backgroundColor: "#FFF4D6",
                                color: "#9A5B00",
                                fontWeight: 600,
                            } : undefined}
                        />
                    </Stack>
                ))}
            </Stack>
        </>
    ) : null
}
export default TaskCriteria;
