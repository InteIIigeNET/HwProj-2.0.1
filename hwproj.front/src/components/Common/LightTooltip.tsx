import * as React from "react";
import {styled} from "@mui/material/styles";
import Tooltip, {TooltipProps, tooltipClasses} from '@mui/material/Tooltip';

// Кастомизированный Tooltip с белым фоном (из примеров MaterialUI)
const LightTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 12,
    },
}));

export default LightTooltip
