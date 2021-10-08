import React, {FC, useState} from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import ApiSingleton from "../../api/ApiSingleton";

interface AddGroupProps {
    isOpen: boolean;
    close: any;
    update: any;
    courseId: string;
}

const AddGroup: FC<AddGroupProps> = (props) => {

    const [groupName, setGroupName] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])
    const [info, setInfo] = useState<string>('')

    const addGroup = async () => {
        if (groupName === '' || groupName[0] === ' ') {
            setErrors(['Некорректное имя группы'])
            return
        }
        try {
            const result = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdCreatePost(+props.courseId, {
                name: groupName,
            })
            setInfo('Группа создана')
            props.update()
        } catch (e) {
            setErrors(['Сервис недоступен'])
        }
    }

    const closeDialog = () => {
        setErrors([])
        setGroupName('')
        setInfo('')
        props.close()
    }

    return (
        <div>
            <Dialog
                open={props.isOpen}
                onClose={closeDialog}
                aria-labelledby="form-dialog-title"
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogTitle id="form-dialog-title" style={{ margin: "0"}} >Введите название группы</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {errors && (
                            <Typography style={{color: "red", margin: "0"}}>
                                {errors}
                            </Typography>
                        )}
                        {errors! && info && (
                            <Typography style={{color: "green", margin: "0"}}>
                                {info}
                            </Typography>
                        )}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        id="name"
                        label="Название группы"
                        fullWidth
                        name={groupName}
                        onChange={(e) => {
                            e.persist()
                            setGroupName(e.target.value)
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeDialog}
                        variant="contained"
                        color="primary"
                    >
                        Закрыть
                    </Button>
                    <Button
                        onClick={addGroup}
                        variant="contained"
                        color="primary"
                    >
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AddGroup;