import {ActionOptions} from "../../api";
import {FC, useState} from "react";
import {ToggleButton, ToggleButtonGroup, Tooltip} from "@mui/material";
import {NotificationsActive, NotificationsOff} from "@mui/icons-material";

const ActionOptionsUI: FC<{
    disabled: boolean,
    onChange: (options: ActionOptions) => void
}> = (props) => {
    const [options, setOptions] = useState<ActionOptions>({sendNotification: false})
    return <ToggleButtonGroup
        value={options.sendNotification ? "right" : "left"}
        exclusive
        disabled={props.disabled}
        onChange={(_, value) => {
            const options = {sendNotification: value === "right"}
            setOptions(options)
            props.onChange(options)
        }}
        aria-label="text alignment"
    >
        <Tooltip placement={"bottom"} arrow title={"Без уведомления"}>
            <ToggleButton color={"primary"} value="left" aria-label="left aligned">
                <NotificationsOff fontSize={"small"}/>
            </ToggleButton>
        </Tooltip>
        <Tooltip placement={"bottom"} arrow title={"С уведомлением"}>
            <ToggleButton color={"primary"} value="right" aria-label="right aligned">
                <NotificationsActive fontSize={"small"}/>
            </ToggleButton>
        </Tooltip>
    </ToggleButtonGroup>
}

export default ActionOptionsUI;