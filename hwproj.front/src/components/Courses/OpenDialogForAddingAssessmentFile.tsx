import React, {FC, useState} from 'react'
import {Button} from '@material-ui/core'
import AddAssessmentFile from './AddAssessmentFile'

interface Props {
    courseId: string;
    update: any;
}

const OpenDialogForAddingAssessmentFile: FC<Props> = (props) => {
    const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false)
    
    const openDialog = () => setIsOpenDialog(true)
    
    const closeDialog = () => setIsOpenDialog(false)
    
    return (
        <div>
            <Button
                onClick = {openDialog}
            >
                Подсчет итоговой отметки
            </Button>
            <AddAssessmentFile
                onClose = {closeDialog}
                courseId = {props.courseId}
                isOpen = {isOpenDialog}
                update = {props.update}
            />
        </div>
    )
}

export default OpenDialogForAddingAssessmentFile