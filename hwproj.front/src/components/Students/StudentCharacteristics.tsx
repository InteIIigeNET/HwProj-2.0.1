import React, {useEffect, useState} from 'react';
import {
    Grid,
    Chip,
    Alert,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Autocomplete,
    DialogActions,
    AlertTitle, Stack
} from '@mui/material';
import {StudentCharacteristicsDto} from '@/api';
import TextField from "@material-ui/core/TextField";
import {MarkdownEditor, MarkdownPreview} from "@/components/Common/MarkdownEditor";
import ApiSingleton from "@/api/ApiSingleton";


interface Props {
    courseId: number,
    studentId: string,
    characteristics: StudentCharacteristicsDto | undefined;
    onChange: (characteristics: StudentCharacteristicsDto) => void;
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

export const StudentCharacteristics: React.FC<Props> = (props) => {
    const {characteristics} = props
    const [isEdit, setIsEdit] = React.useState(false)
    const description = characteristics?.description
    const hasCharacteristics = characteristics && (characteristics.tags && characteristics.tags.length > 0 || characteristics.description)
    const maxDescriptionLength = 400
    const tooLongDescription = description != undefined && description.length > maxDescriptionLength

    const [showFullDescription, setShowFullDescription] = useState(!tooLongDescription)

    useEffect(() => setShowFullDescription(!tooLongDescription), [tooLongDescription])

    const renderUpdateButton = () => {
        return <Typography color={"#3f51b5"} variant={"caption"} style={{cursor: "pointer"}}
                           onClick={() => setIsEdit(true)}>
            {hasCharacteristics ? "Изменить характеристику" : "Добавить характеристику студенту"}
        </Typography>
    }

    if (!hasCharacteristics && !isEdit) return renderUpdateButton()

    return (
        <div>
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
            <Grid item><Alert severity="info">
                <AlertTitle>Характеристика студента</AlertTitle>
                <Grid container direction={"column"} spacing={1}>
                    <Grid item container spacing={0.5} direction={"row"}>
                        {characteristics?.tags!.sort().map((tag, index) => (
                            <Grid item key={index}>
                                {renderTag(tag, {size: "small"})}
                            </Grid>
                        ))}
                    </Grid>
                    {description && <Grid item
                                          style={tooLongDescription ? {cursor: "pointer"} : undefined}
                                          onClick={() => {
                                              if (!showFullDescription) {
                                                  setShowFullDescription(true)
                                              } else if (showFullDescription && tooLongDescription) {
                                                  setShowFullDescription(false)
                                              }
                                          }}>
                        <MarkdownPreview
                            value={showFullDescription
                                ? tooLongDescription
                                    ? description + "\n\n**Нажмите, чтобы свернуть**" : description
                                : description.substring(0, maxDescriptionLength) + "...**Нажмите, чтобы показать целиком**"}
                        />
                    </Grid>}
                    <Grid item>{renderUpdateButton()}</Grid>
                </Grid>
            </Alert>
            </Grid>
        </div>)
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
                                options={["+ Талантливый студент", "- Списывает", "Удален с курса"]}
                                value={characteristics?.tags ?? []}
                                defaultValue={characteristics?.tags ?? []}
                                filterSelectedOptions
                                onChange={(e, values) => {
                                    e.persist()
                                    setCharacteristics((prevState) => ({
                                        ...prevState,
                                        tags: values
                                    }))
                                }}
                                renderTags={(values, getTagProps) => <div>
                                    {values.map((value, index) => renderTag(value, getTagProps({index})))}
                                </div>}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
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
