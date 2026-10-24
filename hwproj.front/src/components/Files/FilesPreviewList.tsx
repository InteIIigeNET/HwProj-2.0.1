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
    // Список внутри уже очерченного блока (например, «Материалы»): файлы рисуем без своих рамок,
    // иначе получается матрёшка из вложенных карточек
    flat?: boolean
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

const FilesPreviewList: React.FC<FilesPreviewProps> = (props) => {

    return props.filesInfo ? (
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
