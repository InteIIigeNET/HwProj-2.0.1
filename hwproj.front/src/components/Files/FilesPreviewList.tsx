import {Grid} from "@mui/material";
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

const FilesPreviewList: React.FC<FilesPreviewProps> = (props) => {

    return (
        <Grid container direction="row" spacing={0.7} flexWrap="wrap"
              alignItems="flex-start" marginTop={(props?.filesInfo?.length ?? 0) > 4 ? -0.5 : 0.5} sx={{flexGrow: 1}}>
            {props.filesInfo ? (
                props.filesInfo.map((fileInfo, index) => (
                    <Grid item key={fileInfo.name || index}>
                        <FilePreview
                            showOkStatus={props.showOkStatus}
                            fileInfo={fileInfo}
                            onRemove={props.onRemoveFileInfo}
                            onClick={props.onClickFileInfo}
                        />
                    </Grid>)
                )) : (
                <div className="container">
                    <DotLottieReact
                        src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                        loop
                        autoplay
                    />
                </div>
            )}
        </Grid>
    )
}

export default FilesPreviewList;