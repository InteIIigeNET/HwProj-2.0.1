import {Grid} from "@mui/material";
import * as React from "react";
import FilePreview from "./FilePreview";
import {IFileInfo} from "./IFileInfo";

interface FilesPreviewProps {
    filesInfo: IFileInfo[]
    onRemoveFileInfo?: (f: IFileInfo) => void
    onClickFileInfo?: (f: IFileInfo) => void
}

const FilesPreviewList: React.FC<FilesPreviewProps> = (props) => {

    return (
        <Grid container direction="row" spacing={0.7} flexWrap="wrap"
              alignItems="flex-start" marginTop={props.filesInfo.length > 4 ? -0.5 : 0.5} sx={{flexGrow: 1}}>
            {props.filesInfo.map((fileInfo, index) => (
                <Grid item key={fileInfo.key || fileInfo.file?.name || index}>
                    <FilePreview
                        fileInfo={fileInfo}
                        onRemove={props.onRemoveFileInfo}
                        onClick={props.onClickFileInfo}
                    />
                </Grid>
            ))}
        </Grid>
    )
}

export default FilesPreviewList;