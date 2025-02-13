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
        <Grid item container direction={props.onRemoveFileInfo ? "column" : "row"} spacing={0.7}
              alignItems={props.onRemoveFileInfo ? "flex-end" : "flex-start"} sx={{width: "100%"}}>
            {props.filesInfo.map((fileInfo, index) => (
                <Grid item key={fileInfo.s3Key || fileInfo.file?.name || index}>
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