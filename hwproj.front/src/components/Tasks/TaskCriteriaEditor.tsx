import {CriterionViewModel} from "@/api";
import {
    Box,
    Button,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {FC} from "react";

const TaskCriteriaEditor: FC<{
    criteria: CriterionViewModel[];
    isOpen: boolean;
    onToggleOpen: () => void;
    onAddCriterion: () => void;
    onUpdateCriterion: (index: number, patch: Partial<CriterionViewModel>) => void;
    onRemoveCriterion: (index: number) => void;
}> = ({
    criteria,
    isOpen,
    onToggleOpen,
    onAddCriterion,
    onUpdateCriterion,
    onRemoveCriterion,
}) => {
    return (
        <Grid item xs={12} sx={{mt: 1, mb: 2}}>
            {criteria.length === 0 && (
                <Grid container direction={"row"} alignItems="baseline">
                    <Grid item>
                        <Typography variant="body2" color="text.secondary">
                            Критерии оценивания не указаны.&nbsp;
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Link
                            style={{cursor: "pointer"}}
                            variant="body2"
                            color="primary"
                            onClick={onAddCriterion}
                        >
                            Добавить критерий оценивания
                        </Link>
                    </Grid>
                </Grid>
            )}

            {criteria.length > 0 && (
                <>
                    <Box sx={{mb: 1}}>
                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                            <IconButton
                                size="small"
                                onClick={onToggleOpen}
                            >
                                {isOpen ? (
                                    <ExpandLessIcon fontSize="small"/>
                                ) : (
                                    <ExpandMoreIcon fontSize="small"/>
                                )}
                            </IconButton>

                            <Chip size={"small"} label={criteria.length} color={"default"}/>

                            <Typography variant="subtitle1">
                                Критерии оценивания
                            </Typography>
                        </Stack>
                    </Box>

                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Stack spacing={0.5}>
                            {criteria.map((criterion, index) => (
                                <Grid
                                    key={index}
                                    container
                                    spacing={1}
                                    alignItems="center"
                                    sx={{py: 0.5}}
                                >
                                    <Grid item xs>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant={"standard"}
                                            label="Название критерия"
                                            value={criterion.name}
                                            inputProps={{maxLength: 50}}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                const limited = raw.slice(0, 50);
                                                onUpdateCriterion(index, {name: limited});
                                            }}
                                        />
                                    </Grid>

                                    <Grid item>
                                        <TextField
                                            label="Баллы"
                                            type="number"
                                            size="small"
                                            sx={{width: 100}}
                                            value={criterion.maxPoints}
                                            inputProps={{min: 1}}
                                            onKeyDown={(e) => {
                                                if (e.key === "-") e.preventDefault();
                                            }}
                                            onChange={(e) =>
                                                onUpdateCriterion(index, {
                                                    maxPoints: Math.max(+e.target.value, 1),
                                                })
                                            }
                                            onBlur={(e) =>
                                                onUpdateCriterion(index, {
                                                    maxPoints: Math.max(+e.target.value, 1),
                                                })
                                            }
                                        />
                                    </Grid>

                                    <Grid item>
                                        <IconButton
                                            onClick={() => onRemoveCriterion(index)}
                                            color={"error"}
                                            size="small"
                                        >
                                            <CloseIcon fontSize="small"/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}

                            <Button
                                size="small"
                                onClick={onAddCriterion}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "15px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "#1976d2",
                                    paddingLeft: "0px",
                                    paddingRight: "0px",
                                    minWidth: "auto",
                                    "&:hover": {
                                        backgroundColor: "transparent",
                                        textDecoration: "none"
                                    }
                                }}
                            >
                                + Добавить критерий оценивания
                            </Button>
                        </Stack>
                    </Collapse>
                </>
            )}
        </Grid>
    );
};

export default TaskCriteriaEditor;