import {Box, Snackbar} from "@material-ui/core";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as React from "react";
import {styled} from "@mui/material/styles";
import {useEffect, useState} from "react";
import {IFileInfo} from "./IFileInfo";
import {Alert, Button, Grid} from "@mui/material";
import FilesPreviewList from "./FilesPreviewList";
import { CourseUnitType } from "./CourseUnitType";
import { FileStatus } from "./FileStatus";

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

    const validFileNameRegex = /^(?!.*[:*?"<>|!])[\p{L}0-9_\-\.() ]+(\.[\p{L}0-9]+)?$/u;
    const maxFileSizeInBytes = 100 * 1024 * 1024;

    const validateFiles = (files: FileList): boolean => {
        for (const file of files) {
            const isValidName = validFileNameRegex.test(file.name);
            if (!isValidName) {
                setError(`Недопустимое имя файла: ${file.name}.
                 Пожалуйста, используйте буквы, цифры, символы _ - . ( ) : или пробел`);
                return false;
            }

            if (file.size > maxFileSizeInBytes) {
                setError(`Файл "${file.name}" слишком большой.
                 Максимальный допустимый размер: ${(maxFileSizeInBytes / 1024 / 1024).toFixed(1)} MB.`);
                return false;
            }
        }

        return true
    }


    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files == null) return
        if (!validateFiles(e.target.files)) return

        const newFilesInfo: IFileInfo[] = []
        for (const file of e.target.files) {
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
        <Grid container direction="row" alignItems="flex-start" spacing={1} marginBottom={props.isLoading ? 0 : 1}>
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
            <Grid item>
                <Button
                    size="small"
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon/>}
                    color="primary"
                    style={{marginTop: "10px"}}
                >
                    Прикрепить файлы
                    <VisuallyHiddenInput
                        type="file"
                        onChange={handleFileInputChange}
                        multiple
                    />
                </Button>
            </Grid>
            {props.isLoading &&
                <Grid item>
                    <Box marginTop="18px" marginBottom="-9px">
                        <p>Получаем информацию о файлах...</p>
                    </Box>
                </Grid>
            }
            <Grid item>
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