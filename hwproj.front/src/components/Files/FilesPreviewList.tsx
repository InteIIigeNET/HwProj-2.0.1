import {Box} from "@mui/material";
import * as React from "react";
import FilePreview from "./FilePreview";
import {IFileInfo} from "./IFileInfo";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface FilesPreviewProps {
    filesInfo: IFileInfo[] | undefined
    onRemoveFileInfo?: (f: IFileInfo) => void
    onClickFileInfo?: (f: IFileInfo) => void
    showOkStatus?: boolean
}

// Сетка вместо переноса флексом: карточки выравниваются в колонки и не «рвут» строку по разной ширине имён
const gridSx = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
    gap: 1,
    width: "100%",
    mt: 0.5,
}

// Плейсхолдер загрузки ограничиваем по ширине и центрируем: во всю строку анимация выглядит громоздко
const loaderSx = {
    width: "100%",
    maxWidth: 180,
    mx: "auto",
}

const FilesPreviewList: React.FC<FilesPreviewProps> = (props) => {

    return props.filesInfo ? (
        <Box sx={gridSx}>
            {props.filesInfo.map((fileInfo, index) => (
                <FilePreview
                    key={fileInfo.name || index}
                    showOkStatus={props.showOkStatus}
                    fileInfo={fileInfo}
                    onRemove={props.onRemoveFileInfo}
                    onClick={props.onClickFileInfo}
                />
            ))}
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
