import { Button, DialogActions } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import ApiSingleton from '../../api/ApiSingleton'
import React, {FC, FormEvent, useState} from 'react'
import { ResponseForAddAssessmentMethod } from '../../api/api'

interface AddAssessmentFileProps {
    onClose:any;
    isOpen: boolean;
    courseId: string;
    update: any;
}

const AddAssessmentFile: FC<AddAssessmentFileProps> = (props) =>
{
    const [fileState, setFileState] = useState<File | undefined>(undefined)
    
    const [responseState, setResponseState] = useState<ResponseForAddAssessmentMethod>(
        {
            everyThingOK: undefined,
            errorMessage: ''
        })
    
    const [isFileUpload, setIsFileUpload] = useState<boolean>(false)
    
    const closeDialogIcon = () => {
        setFileState(undefined);
        setIsFileUpload(false)
        setResponseState((prevState) => ({everyThingOK: undefined, errorMessage:''}))
        props.onClose()
    }

    const sendDll = async () => {
        var url = "http://localhost:5000/api/Solutions/assessmentSystem/add/" + props.courseId
        if (fileState != undefined && fileState.size > 0)
        {
            var formdata = new FormData()
            formdata.append("File", fileState)
            fetch(url, {
                headers: {"Authorization" : "Bearer " + ApiSingleton.authService.getToken()},
                method: 'POST',
                body: formdata
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    setResponseState(response.json() as ResponseForAddAssessmentMethod)
                    setIsFileUpload(responseState.everyThingOK!)
                }
                else {
                    throw response
                }
            })
        }
    }
    
    return (
        <div>
            <Dialog
                onClose={closeDialogIcon}
                aria-labelledby="simple-dialog-title"
                open={props.isOpen}
            >
                <DialogTitle id="form-dialog-title">
                    Добавить файл для итогового оценивания
                </DialogTitle>    
                <DialogContent>
                    <DialogContentText>
                        <Typography>
                            Для добавления подсчета итоговой отметки по курсу нужно реализовать класс на языке программирования C#,
                            собрать этот проект и загрузить файл в формате dll в эту форму. Итоговая отметка студентов отобразится
                            в таблице статистики курса. Подробнее про то, как это делать по ссылке: 
                        </Typography>
                    </DialogContentText>
                    {isFileUpload != true &&
                        <label htmlFor="btn-upload">
                            <input
                                name="user-file"
                                type="file"
                                onChange={(e) => setFileState(e.target["files"]![0])}
                            />
                        </label>
                    }
                    {isFileUpload == false && responseState.everyThingOK == false &&
                        <Typography>{responseState.errorMessage}</Typography>
                    }

                    {isFileUpload == true &&
                        <Typography>Файл успешно загружен</Typography>
                    }
                    <DialogActions>
                        <Button
                            onClick={closeDialogIcon}
                            color="primary"
                        >
                            Закрыть
                        </Button>
                        { isFileUpload != true &&
                            <Button
                                onClick= {sendDll}
                                color="primary"
                            >
                                Отправить файл
                            </Button>
                        }
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddAssessmentFile