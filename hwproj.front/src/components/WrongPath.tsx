import React, {FC} from "react";
import {Grid} from "@material-ui/core";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const WrongPath: FC = () => {
    return <div className={"container"}>
        <Grid container justifyContent={"center"} style={{marginTop: 10}}>
            <DotLottieReact
                src="https://lottie.host/bf9a1867-8371-442a-8486-78f40fcd0171/CIvVkqnUVJ.lottie"
                autoplay
            />
        </Grid>
    </div>
}
export default WrongPath;
