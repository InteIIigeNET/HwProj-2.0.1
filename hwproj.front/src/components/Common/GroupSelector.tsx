import {FC, useEffect, useState} from "react";
import {
    Grid,
    TextField,
    Autocomplete
} from "@mui/material";
import ApiSingleton from "../../api/ApiSingleton";
import { Group } from "@/api";


interface GroupSelectorProps {
    courseId: number,
    onGroupIdChange: (groupId?: number) => void
    selectedGroupId?: number ,
    disabled?: boolean,
}

const GroupSelector:  FC<GroupSelectorProps> = (props) => {
    const [groups, setGroups] = useState<Group[]>([])
    const [groupsLoading, setGroupsLoading] = useState(false)

    const loadGroups = async () => {
        setGroupsLoading(true)
        try {
            const courseGroups = await ApiSingleton.courseGroupsApi.courseGroupsGetAllCourseGroupsWithNames(props.courseId)
            setGroups(courseGroups)
        } catch (error) {
            console.error('Failed to load groups:', error)
        } finally {
            setGroupsLoading(false)
        }
    }
    useEffect(() => {
        loadGroups()
    }, [props.courseId])

    return (
        <Grid item xs={12} style={{marginBottom: "15px", marginTop: 1}}>
            {props.disabled ? (
                <TextField
                    label="Группа"
                    value={groups.find(g => g.id === props.selectedGroupId)?.name || "Все студенты"}
                    variant="outlined"
                    fullWidth
                    disabled
                />
            ) : (
                <Autocomplete
                    options={[{ id: undefined, name: "Все студенты" }, ...groups]}
                    getOptionLabel={(option) => option.name || ""}
                    value={props.selectedGroupId !== undefined
                        ? groups.find(g => g.id === props.selectedGroupId) || null
                        : { id: undefined, name: "Все студенты" }}
                    onChange={(_, newGroup) => props.onGroupIdChange(newGroup?.id)}
                    loading={groupsLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Группа (не обязательно)"
                            placeholder="Выберите группу"
                            variant="outlined"
                        />
                    )}
                />
            )}
        </Grid>
    )
}

export default GroupSelector