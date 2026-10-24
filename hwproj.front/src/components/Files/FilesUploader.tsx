import {Box, Snackbar} from "@mui/material";
import {FileUploader} from "react-drag-drop-files";
import * as React from "react";
import {styled} from "@mui/material/styles";
import {useEffect, useState} from "react";
import {IFileInfo} from "./IFileInfo";
import {Alert, CircularProgress, Stack, Typography} from "@mui/material";
import FilesPreviewList from "./FilesPreviewList";
import {CourseUnitType} from "./CourseUnitType";
import {FileStatus} from "./FileStatus";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import "./filesUploaderOverrides.css";
import Utils from "@/services/Utils";

interface IFilesUploaderProps {
    courseUnitType: CourseUnitType
    courseUnitId: number;
    initialFilesInfo?: IFileInfo[];
    onChange: (selectedFiles: IFileInfo[]) => void;
    isLoading?: boolean;
    maxFilesCount?: number;
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

// Зона загрузки согласована с редизайном курса: скруглённая панель и индиго-акцент вместо синей рамки
const dropzoneSx = (isDragging: boolean) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 2.25,
    borderRadius: "16px",
    border: "2px dashed",
    borderColor: isDragging ? "#3f51b5" : "#ccd4ea",
    backgroundColor: isDragging ? "#f0f2fc" : "#fafbfe",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "border-color .15s, background-color .15s",
    "&:hover": {
        borderColor: "#9aa5db",
        backgroundColor: "#f4f6fd",
    },
    "&:hover .files-uploader-icon": {
        backgroundColor: "#dadffa",
    },
})

const iconTileSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    transition: "background-color .15s",
}

// Подсказку при перетаскивании библиотека рисует своим оверлеем, стилизуем её инлайном
const dropMessageStyle: React.CSSProperties = {
    border: "2px dashed #3f51b5",
    borderRadius: "16px",
    backgroundColor: "#eef1fc",
    opacity: 1,
    color: "#3f51b5",
    fontWeight: 600,
    fontSize: "0.9375rem",
}

const FilesUploader: React.FC<IFilesUploaderProps> = (props) => {
    const [selectedFilesInfo, setSelectedFilesInfo] = useState<IFileInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Для корректного отображения файлов React-ом
    useEffect(() => {
        if (props.initialFilesInfo) {
            setSelectedFilesInfo(props.initialFilesInfo);
        }
    }, [props.initialFilesInfo]);

    const maxFileSizeInBytes = 100 * 1024 * 1024;

    const forbiddenFileTypes = [
        'application/vnd.microsoft.portable-executable',
        'application/x-msdownload',
        'application/x-ms-installer',
        'application/x-ms-dos-executable',
        'application/x-dosexec',
        'application/x-msdos-program',
        'application/octet-stream', // если тип двоичного файла не определен, отбрасывать
    ]

    const validateFiles = (files: File[]): boolean => {
        if (props.maxFilesCount &&
            (props.initialFilesInfo ? props.initialFilesInfo.length : 0) + files.length > props.maxFilesCount) {
            setError(`Выбрано слишком много файлов.
             Максимально допустимое количество файлов: ${props.maxFilesCount} ${Utils.pluralizeHelper(["штука", "штука", "штук"], props.maxFilesCount)}`);
            return false;
        }
        for (const file of files) {
            if (file.size > maxFileSizeInBytes) {
                setError(`Файл "${file.name}" слишком большой.
                 Максимальный допустимый размер: ${(maxFileSizeInBytes / 1024 / 1024).toFixed(1)} MB.`);
                return false;
            }
            if (forbiddenFileTypes.includes(file.type)) {
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

    const limitsHint = [
        `до ${(maxFileSizeInBytes / 1024 / 1024).toFixed(0)} MB`,
        props.maxFilesCount
            ? `не более ${props.maxFilesCount} ${Utils.pluralizeHelper(["файла", "файлов", "файлов"], props.maxFilesCount)}`
            : null,
    ].filter(Boolean).join(" · ")

    return (
        <Stack direction={"column"} spacing={1.5} marginBottom={props.isLoading ? 0 : 1}>
            {error && (
                <Snackbar
                    open={!!error}
                    autoHideDuration={8000}
                    onClose={() => setError(null)}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert
                        severity="error"
                        variant="filled"
                        onClose={() => setError(null)}
                        sx={{borderRadius: "12px", alignItems: "center"}}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            )}
            <FileUploader
                classes="rddu-no-block"
                handleChange={handleFileInputChange}
                onDraggingStateChange={setIsDragging}
                dropMessageStyle={dropMessageStyle}
                hoverTitle={"Перетащите файлы сюда для загрузки"}
                children={
                    <Box sx={dropzoneSx(isDragging)}>
                        <Box className={"files-uploader-icon"} sx={iconTileSx}>
                            <CloudUploadOutlinedIcon sx={{fontSize: 24}}/>
                        </Box>
                        <Box>
                            <Typography sx={{fontSize: "0.9375rem", fontWeight: 600, color: "#3f51b5"}}>
                                {props.courseUnitType === CourseUnitType.Solution
                                    ? "Загрузите файлы решения"
                                    : "Загрузите материалы задания"}
                            </Typography>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Перетащите файлы сюда или нажмите, чтобы выбрать
                            </Typography>
                        </Box>
                        <Typography variant={"caption"} sx={{color: "text.disabled", fontSize: "0.7rem"}}>
                            {limitsHint}
                        </Typography>
                    </Box>}
                multiple={true}
                name="file"/>
            {props.isLoading &&
                <Stack direction={"row"} alignItems={"center"} spacing={0.75} sx={{color: "#3f51b5"}}>
                    <CircularProgress size={"14px"} color={"inherit"}/>
                    <Typography variant={"caption"} sx={{fontWeight: 500}}>
                        Получаем информацию о файлах...
                    </Typography>
                </Stack>
            }
            {/* Пустой список рисовать не нужно: он оставлял бы под зоной загрузки лишний отступ */}
            {selectedFilesInfo.length > 0 &&
                <FilesPreviewList
                    filesInfo={selectedFilesInfo}
                    onRemoveFileInfo={(fI) => {
                        setSelectedFilesInfo(previouslySelected => {
                            const updatedArray = previouslySelected.filter(f => f.name !== fI.name || f.id !== fI.id);
                            props.onChange(updatedArray);
                            return updatedArray;
                        });
                    }}
                />}
        </Stack>
    )
}

export default FilesUploader
