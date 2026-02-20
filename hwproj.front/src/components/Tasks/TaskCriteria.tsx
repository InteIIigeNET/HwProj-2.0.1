import {HomeworkTaskViewModel} from "@/api";
import {Chip, Divider, Stack, Typography} from "@mui/material";
import {FC} from "react";

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
                        <Typography variant="body2">{c.name}</Typography>
                        <Chip style={{fontSize: 14}} size={"small"} color={"default"} label={c.maxPoints}/>
                    </Stack>
                ))}
            </Stack>
        </>
    ) : null
}
export default TaskCriteria;