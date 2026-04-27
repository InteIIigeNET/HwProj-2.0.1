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
                            {c.type === CriterionTypeDeadline && (
                                <Chip
                                    label="Авто"
                                    size="small"
                                    sx={{
                                        backgroundColor: "#E8F8EE",
                                        color: "#159947",
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                            <Stack spacing={0}>
                                <Typography variant="body2">{c.name}</Typography>
                                {c.type === CriterionTypeDeadline && c.arguments && (
                                    <Typography variant="caption" color="text.secondary">
                                        До {Utils.renderDateWithoutSeconds(new Date(c.arguments))}
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                        <Chip
                            style={{fontSize: 14}}
                            size={"small"}
                            color={"default"}
                            label={c.type === CriterionTypeDeadline ? `-${c.maxPoints}` : c.maxPoints}
                        />
                    </Stack>
                ))}
            </Stack>
        </>
    ) : null
}
export default TaskCriteria;
