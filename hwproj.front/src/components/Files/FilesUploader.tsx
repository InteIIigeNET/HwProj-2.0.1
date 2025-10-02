import {Box, Snackbar} from "@material-ui/core";
import {FileUploader} from "react-drag-drop-files";
import * as React from "react";
import {styled} from "@mui/material/styles";
import {useEffect, useState} from "react";
import {IFileInfo} from "./IFileInfo";
import {Alert, Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import FilesPreviewList from "./FilesPreviewList";
import {CourseUnitType} from "./CourseUnitType";
import {FileStatus} from "./FileStatus";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import "./filesUploaderOverrides.css";

interface IFilesUploaderProps {
    courseUnitType: CourseUnitType
    courseUnitId: number;
    initialFilesInfo?: IFileInfo[];
    onChange: (selectedFiles: IFileInfo[]) => void;
    isLoading?: boolean;
}

// Кастомизированный Input для загрузки файла (из примеров MaterialUI)
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const FilesUploader: React.FC<IFilesUploaderProps> = (props) => {
    const [selectedFilesInfo, setSelectedFilesInfo] = useState<IFileInfo[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Для корректного отображения файлов React-ом
    useEffect(() => {
        if (props.initialFilesInfo) {
            setSelectedFilesInfo(props.initialFilesInfo);
        }
    }, [props.initialFilesInfo]);

    const maxFileSizeInBytes = 100 * 1024 * 1024;
    const maxFilesCount = 5;

    const validateFiles = (files: File[]): boolean => {
        if ((props.initialFilesInfo ? props.initialFilesInfo.length : 0) + files.length > maxFilesCount) {
            setError(`Выбрано слишком много файлов.
             Максимально допустимое количество файлов: ${maxFilesCount} штук.`);
            return false;
        }
        for (const file of files) {
            if (file.size > maxFileSizeInBytes) {
                setError(`Файл "${file.name}" слишком большой.
                 Максимальный допустимый размер: ${(maxFileSizeInBytes / 1024 / 1024).toFixed(1)} MB.`);
                return false;
            }
            if (file.type.startsWith("application")) {
                setError(`Файл "${file.name}" имеет недопустимый тип "${file.type}`);
                return false;
            }
        }

        return true
    }


    const handleFileInputChange = (input: Array<File> | File) => {
        const files = input instanceof File ? [input] : input;
        if (files == null) return
        if (!validateFiles(files)) return

        const newFilesInfo: IFileInfo[] = []
        for (const file of files) {
            newFilesInfo.push({
                name: file.name,
                type: file.type,
                sizeInBytes: file.size,
                file: file,
                courseUnitType: props.courseUnitType,
                courseUnitId: props.courseUnitId,
                status: FileStatus.Local
            })
        }
        setSelectedFilesInfo(previouslySelected => {
            const updatedArray = [...previouslySelected, ...newFilesInfo];
            props.onChange(updatedArray);
            return updatedArray;
        });
    }

    return (
        <Grid container direction="column" marginBottom={props.isLoading ? 0 : 1}>
            {error && (
                <Snackbar
                    open={!!error}
                    autoHideDuration={8000}
                    onClose={() => setError(null)}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert severity="error">{error}</Alert>
                </Snackbar>
            )}
            <Grid item xs={12}>
                <FileUploader
                    classes="rddu-no-block"
                    handleChange={handleFileInputChange}
                    hoverTitle={"Перетащите файлы сюда для загрузки"}
                    children={
                        <Card
                            style={{
                                border: "1px dashed #1976d2",
                                backgroundColor: "ghostwhite",
                                textAlign: "center",
                            }}
                            variant={"outlined"}>
                            <CardContent>
                                <Typography color={"primary"} variant={"body1"}>
                                    Загрузите материалы задания
                                </Typography>
                                <CloudUploadOutlinedIcon color="primary" fontSize={"medium"}/>
                            </CardContent>
                        </Card>}
                    multiple={true}
                    name="file"/>
            </Grid>
            {props.isLoading &&
                <Grid item>
                    <Box marginTop="18px" marginBottom="-9px">
                        <p>Получаем информацию о файлах...</p>
                    </Box>
                </Grid>
            }
            <Grid item xs={12}>
                <FilesPreviewList
                    filesInfo={selectedFilesInfo}
                    onRemoveFileInfo={(fI) => {
                        setSelectedFilesInfo(previouslySelected => {
                            const updatedArray = previouslySelected.filter(f => f.name !== fI.name);
                            props.onChange(updatedArray);
                            return updatedArray;
                        });
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default FilesUploader