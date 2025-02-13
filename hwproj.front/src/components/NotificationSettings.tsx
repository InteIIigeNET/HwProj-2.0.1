import {FC, useEffect, useState} from "react";
import {NotificationsSettingDto} from "../api";
import ApiSingleton from "../api/ApiSingleton";
import {Dialog, DialogContent, DialogTitle, FormGroup, FormControlLabel, Switch} from "@mui/material";
import * as React from "react";

const NotificationSettings: FC<{
    onClose: () => void
}> = (props) => {

    const [settings, setSettings] = useState<NotificationsSettingDto[]>([])

    const getLabel = (category: string) => {
        if (category === "newSolutions") return "Новые решения"
        return ""
    }
    const getSettings = async () => {
        const settings = await ApiSingleton.notificationsApi.notificationsGetSettings()
        setSettings(settings)
    }

    const changeSetting = async (setting: NotificationsSettingDto, enabled: boolean) => {
        await ApiSingleton.notificationsApi.notificationsChangeSetting({...setting, isEnabled: enabled})
        await getSettings()
    }

    useEffect(() => {
        getSettings()
    }, []);

    return <Dialog open={true} onClose={() => props.onClose()} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
            Настройки уведомлений на почту
        </DialogTitle>
        <DialogContent>
            <FormGroup style={{marginTop: 10}}>
                {settings.map(s =>
                    <FormControlLabel
                        control={<Switch
                            onChange={(_, checked) => changeSetting(s, checked)}
                            checked={s.isEnabled}/>}
                        label={getLabel(s.category!)}/>)}
            </FormGroup>
        </DialogContent>
    </Dialog>
}

export default NotificationSettings;
