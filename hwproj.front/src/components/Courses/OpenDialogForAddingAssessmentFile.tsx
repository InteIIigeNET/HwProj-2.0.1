import React, {FC, useState} from 'react'
import {Button, Typography} from '@material-ui/core'
import AddAssessmentFile from './AddAssessmentFile'
import IconButton from "@material-ui/core/IconButton";
import AddRoundedIcon from '@material-ui/icons/AddRounded';

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
                onClick={openDialog}
            >
                <Typography>
                    Подсчет итоговой отметки
                </Typography>
                <AddRoundedIcon/>
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