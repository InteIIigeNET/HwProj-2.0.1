import {Button, Snackbar} from "@material-ui/core";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as React from "react";
import {styled} from "@mui/material/styles";
import {useState} from "react";
import {IFileInfo} from "./IFileInfo";
import {Alert, Grid} from "@mui/material";
import FilesPreviewList from "./FilesPreviewList";
import LightTooltip from "components/Common/LightTooltip";

interface IFilesUploaderProps {
    initialFilesInfo?: IFileInfo[];
    onChange: (selectedFiles: IFileInfo[]) => void;
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
    const [selectedFilesInfo, setSelectedFilesInfo] = useState<IFileInfo[]>(props.initialFilesInfo ?? []);
    const [error, setError] = useState<string | null>(null);

    const validFileNameRegex = /^[a-zA-Z0-9_-]+$/;
    const validateFiles = (files: FileList): boolean => {
        for (const file of files) {
            const isValidName = validFileNameRegex.test(file.name);

            if (!isValidName) {
                setError(`Недопустимое имя файла: ${file.name}. Используйте английские буквы, цифры и символы _ -`);
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
                file: file
            })
        }
        setSelectedFilesInfo(previouslySelected => {
            const updatedArray = [...previouslySelected, ...newFilesInfo];
            props.onChange(updatedArray);
            return updatedArray;
        });
    }

    return (
        <Grid container columnSpacing={1}>
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
                <FilesPreviewList
                    filesInfo={selectedFilesInfo}
                    onRemoveFileInfo={(fI) => {
                        setSelectedFilesInfo(previouslySelected => {
                            const updatedArray = previouslySelected.filter(f => f.s3Key !== fI.s3Key)
                            props.onChange(updatedArray);
                            return updatedArray;
                        });
                    }}
                />
            </Grid>
            <Grid item>
                <LightTooltip
                    title="Для безопасной загрузки файлов, пожалуйста, используйте в названии
                     только английские буквы, цифры и символы _ -">
                    <Button
                        size="small"
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon/>}
                        color="primary"
                    >
                        Прикрепить файлы
                        <VisuallyHiddenInput
                            type="file"
                            onChange={handleFileInputChange}
                            multiple

                        />
                    </Button>
                </LightTooltip>
            </Grid>
        </Grid>
    )
}

export default FilesUploader