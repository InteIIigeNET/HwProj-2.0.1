import {FC} from "react";
import { Grid, Checkbox, FormControlLabel, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface CheckboxWithTooltipProps {
    checkboxLabel: string
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipText: string
    tooltipPlacement:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
}

const CheckboxWithTooltip: FC<CheckboxWithTooltipProps> = (props) => {
    return (<Grid>
                <FormControlLabel
                    style={{ margin: 0 }}
                    control={
                        <Checkbox
                            color="primary"
                            checked={props.checked}
                            onChange={props.onChange}
                        />
                    }
                    label={props.checkboxLabel}
                />
                <Tooltip arrow placement={props.tooltipPlacement}
                    PopperProps={{
                        modifiers: [{ name: "offset", options: { offset: [0, -5], } }]
                    }}
                    title={props.tooltipText}>
                    <IconButton>
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
            </Grid>);
}

export default CheckboxWithTooltip;