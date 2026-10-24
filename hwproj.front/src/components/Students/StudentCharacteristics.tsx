import React, {useEffect, useState} from 'react';
import {
    Grid,
    Chip,
    Alert,
    Box,
    Button,
    Link,
    Popover,
    Stack,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Autocomplete,
    DialogActions,
} from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import {StudentCharacteristicsDto} from '@/api';
import TextField from "@mui/material/TextField";
import {MarkdownEditor, MarkdownPreview} from "@/components/Common/MarkdownEditor";
import ApiSingleton from "@/api/ApiSingleton";
import {RemovedFromCourseTag} from "@/components/Common/StudentTags";


interface Props {
    courseId: number,
    studentId: string,
    characteristics: StudentCharacteristicsDto | undefined;
    onChange: (characteristics: StudentCharacteristicsDto) => void;
}

const tagChipSx = {
    height: 22,
    borderRadius: "999px",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.75rem", fontWeight: 500},
}

const linkSx = {
    fontSize: "0.75rem",
    flexShrink: 0,
}

// Точка-разделитель между ссылками: явно отделяет «описание» от «изменить характеристику»
const linkSeparatorSx = {
    width: 3,
    height: 3,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: "#b9bece",
}

// Описание открываем во всплывающей карточке: в углу карточки студента для него нет места,
// а разворачивать его инлайном значило бы двигать всё решение
const descriptionPopoverSx = {
    borderRadius: "12px",
    borderColor: "#c4cad2",
    mt: 0.5,
    p: 1.5,
    maxWidth: 460,
}

const descriptionSx = {
    mt: 0.5,
    "& .markdown-preview": {paddingBottom: "0 !important", fontSize: "0.875rem"},
}

const renderTag = (tag: string, props?: any) => {
    if (tag.startsWith("-")) {
        return <Chip {...props} label={tag.substring(1).trim()} color={"error"}/>
    }
    if (tag.startsWith("+")) {
        return <Chip {...props} label={tag.substring(1).trim()} color={"success"}/>
    }
    return <Chip {...props} label={tag.trim()} color={"default"}/>
}

// Характеристика живёт прямо в карточке студента под решением, поэтому выглядит как строка меток
// со ссылками, а не как отдельный блок-уведомление
export const StudentCharacteristics: React.FC<Props> = (props) => {
    const {characteristics} = props
    const [isEdit, setIsEdit] = React.useState(false)
    const description = characteristics?.description
    const tags = characteristics?.tags ?? []
    const hasCharacteristics = !!characteristics && (tags.length > 0 || !!description)

    const [descriptionAnchor, setDescriptionAnchor] = useState<HTMLElement | null>(null)

    useEffect(() => setDescriptionAnchor(null), [props.studentId, description])

    return (
        <Box>
            {isEdit && <EditStudentCharacteristics
                isOpen={isEdit}
                courseId={props.courseId}
                studentId={props.studentId}
                characteristics={characteristics}
                onCancel={() => setIsEdit(false)}
                onChange={x => {
                    setIsEdit(false)
                    props.onChange(x)
                }}/>}
            <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
                spacing={0.75}
                flexWrap={"wrap"}
                sx={{rowGap: 0.75}}
            >
                {hasCharacteristics &&
                    <Tooltip arrow title={"Характеристика студента — её видят только преподаватели курса"}>
                        <PsychologyOutlinedIcon sx={{fontSize: 17, flexShrink: 0, color: "text.secondary"}}/>
                    </Tooltip>}
                {[...tags].sort().map((tag, index) => (
                    <React.Fragment key={index}>
                        {renderTag(tag, {size: "small", sx: tagChipSx})}
                    </React.Fragment>
                ))}
                {description && <>
                    <Link
                        component={"button"}
                        type={"button"}
                        variant={"caption"}
                        underline={"hover"}
                        sx={linkSx}
                        onClick={(e: React.MouseEvent<HTMLElement>) => setDescriptionAnchor(e.currentTarget)}
                    >
                        описание
                    </Link>
                    <Box sx={linkSeparatorSx}/>
                </>}
                <Link
                    component={"button"}
                    type={"button"}
                    variant={"caption"}
                    underline={"hover"}
                    sx={linkSx}
                    onClick={() => setIsEdit(true)}
                >
                    {hasCharacteristics ? "изменить характеристику" : "добавить характеристику студенту"}
                </Link>
            </Stack>
            {description &&
                <Popover
                    open={!!descriptionAnchor}
                    anchorEl={descriptionAnchor}
                    onClose={() => setDescriptionAnchor(null)}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                    transformOrigin={{vertical: "top", horizontal: "right"}}
                    PaperProps={{variant: "outlined", sx: descriptionPopoverSx}}
                >
                    <Typography variant={"caption"} sx={{fontWeight: 500, color: "text.secondary"}}>
                        Характеристика студента
                    </Typography>
                    <Box sx={descriptionSx}>
                        <MarkdownPreview value={description}/>
                    </Box>
                </Popover>}
        </Box>)
};

const EditStudentCharacteristics: React.FC<Props & { onCancel: () => void, isOpen: boolean }> =
    (props) => {
        const [characteristics, setCharacteristics] = React.useState<StudentCharacteristicsDto>(props.characteristics || {
            tags: [],
            description: ""
        })
        const handleSubmit = async () => {
            await ApiSingleton.coursesApi.coursesUpdateStudentCharacteristics(props.courseId, props.studentId, characteristics)
            props.onChange(characteristics)
        }
        return (
            <Dialog
                fullWidth
                maxWidth="md"
                open={props.isOpen}
                onClose={() => props.onCancel()}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Добавить характеристику студенту
                </DialogTitle>
                <DialogContent>
                    <Grid container direction={"column"} spacing={1}>
                        <Grid item>
                            <Alert severity="info">
                                Студент не будет видеть характеристику, но она будет доступна другим преподавателям
                                курса
                            </Alert>
                        </Grid>
                        <Grid item>
                            <Typography variant={"body2"}>
                                Добавьте перед характеристикой '-' для отрицательной оценки или '+' для
                                положительной.
                                <br/>
                                Не добавляйте ничего, если хотите указать нейтральную характеристику.
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Autocomplete
                                fullWidth
                                multiple
                                freeSolo
                                id="tags-outlined"
                                options={["+ Талантливый студент", "- Списывает", RemovedFromCourseTag]}
                                value={characteristics?.tags ?? []}
                                defaultValue={characteristics?.tags ?? []}
                                filterSelectedOptions
                                onChange={(e, values) => {
                                    e.persist()
                                    const formatted = values.map(t => t.trim().split(RegExp("\\s+")).join(" "))
                                    const filtered = formatted.filter(t => t.length > 0)
                                    setCharacteristics((prevState) => ({
                                        ...prevState,
                                        tags: filtered,
                                    }))
                                }}
                                renderTags={(values, getTagProps) => <div>
                                    {values.map((value, index) => renderTag(value, getTagProps({index})))}
                                </div>}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Характеристики"
                                        placeholder="Напишите"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item>
                            <MarkdownEditor
                                label={"Подробное описание (опционально)"}
                                value={characteristics?.description ?? ""}
                                onChange={(value) => {
                                    setCharacteristics((prevState) => ({
                                        ...prevState,
                                        description: value
                                    }))
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        variant="text"
                        color="primary"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        Обновить
                    </Button>
                    <Button
                        size="small"
                        onClick={() => props.onCancel()}
                        variant="text"
                        color="error"
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>)
    }
