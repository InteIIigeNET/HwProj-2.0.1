import {Box, Button, CircularProgress} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import {enqueueSnackbar} from "notistack";
import FilePreview from "./FilePreview";
import {IFileInfo} from "./IFileInfo";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {downloadFilesArchive, getDownloadableFiles} from "./FilesArchiveDownloader";

interface FilesPreviewProps {
    filesInfo: IFileInfo[] | undefined
    onRemoveFileInfo?: (f: IFileInfo) => void
    onClickFileInfo?: (f: IFileInfo) => void
    showOkStatus?: boolean
    // Список внутри уже очерченного блока (например, «Материалы»): файлы рисуем без своих рамок,
    // иначе получается матрёшка из вложенных карточек
    flat?: boolean
    // Имя zip-архива без расширения; если задано, под списком появляется кнопка «Скачать все»
    downloadAllArchiveName?: string
}

// Сетка вместо переноса флексом: карточки выравниваются в колонки и не «рвут» строку по разной ширине имён
const gridSx = (flat: boolean) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
    gap: flat ? 0.25 : 1,
    // Без рамок строки выносим на всю ширину блока-родителя, чтобы подсветка при наведении
    // доходила до его краёв, а имена файлов вставали по одной линии с подписью блока
    ...(flat
        ? {width: "auto", mx: -1, mt: 0}
        : {width: "100%", mt: 0.5}),
})

// Плейсхолдер загрузки ограничиваем по ширине и центрируем: во всю строку анимация выглядит громоздко
const loaderSx = {
    width: "100%",
    maxWidth: 180,
    mx: "auto",
}

const downloadAllButtonSx = (flat: boolean) => ({
    mt: flat ? 0.5 : 1,
    // В плоском виде выравниваем по иконкам файлов, которые вынесены на mx: -1
    ml: flat ? -0.5 : 0,
    px: 1,
    textTransform: "none",
    fontWeight: 500,
    color: "#3f51b5",
    borderRadius: "8px",
})

const FilesPreviewList: React.FC<FilesPreviewProps> = (props) => {
    const [isDownloadingAll, setIsDownloadingAll] = useState(false)

    // Архив из одного файла смысла не имеет — его проще скачать напрямую
    const downloadableCount = props.filesInfo ? getDownloadableFiles(props.filesInfo).length : 0
    const showDownloadAll = props.downloadAllArchiveName !== undefined && downloadableCount > 1

    const handleDownloadAll = async () => {
        setIsDownloadingAll(true)
        try {
            await downloadFilesArchive(props.filesInfo!, props.downloadAllArchiveName!)
        } catch {
            enqueueSnackbar("Не удалось скачать файлы архивом", {variant: "error", autoHideDuration: 3000})
        } finally {
            setIsDownloadingAll(false)
        }
    }

    return props.filesInfo ? (
        <Box>
            <Box sx={gridSx(!!props.flat)}>
                {props.filesInfo.map((fileInfo, index) => (
                    <FilePreview
                        key={fileInfo.name || index}
                        showOkStatus={props.showOkStatus}
                        flat={props.flat}
                        fileInfo={fileInfo}
                        onRemove={props.onRemoveFileInfo}
                        onClick={props.onClickFileInfo}
                    />
                ))}
            </Box>
            {showDownloadAll &&
                <Button
                    size="small"
                    disabled={isDownloadingAll}
                    onClick={handleDownloadAll}
                    startIcon={isDownloadingAll
                        ? <CircularProgress size={14} color="inherit"/>
                        : <DownloadRoundedIcon sx={{fontSize: 18}}/>}
                    sx={downloadAllButtonSx(!!props.flat)}
                >
                    {isDownloadingAll ? "Собираем архив..." : `Скачать все (${downloadableCount})`}
                </Button>}
        </Box>
    ) : (
        <Box sx={loaderSx}>
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </Box>
    )
}

export default FilesPreviewList;
