import React, {FC, useEffect, useState} from 'react';
import {AccountDataDto, GroupMateDataDTO, GroupMateViewModel, GroupViewModel} from "../../api";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import {ListItem, Theme} from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import StudentsWithoutGroup from "./StudentsWithoutGroup";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import DeletionConfirmation from "../DeletionConfirmation";

interface StudentState {
    id: string;
    name: string;
    surname: string;
}

interface GroupEditProps {
    id: number;
    courseId: number;
    update: any
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tools: {
            display: "flex",
            flexDirection: 'row',
            alignItems: 'center',
        },
    }),
)

const GroupEdit: FC<GroupEditProps> = (props) => {

    const [isAddGroupMates, setIsAddGroupMates] = useState<boolean>(false)
    const [group, setGroup] = useState<GroupViewModel>({
        id: -1,
        courseId: -1,
        name: "",
        groupMates: [],
    })
    const [currentGroupMates, setCurrentGroupMates] = useState<StudentState[]>([])
    const [studentsWithoutGroup, setStudentsWithoutGroup] = useState<GroupMateDataDTO[]>([])
    const [isOpenDialogDeleteGroup, setIsOpenDialogDeleteGroup] = useState<boolean>(false)

    const openDialogDeleteGroup = () => {
        setIsOpenDialogDeleteGroup(true)
    }

    const closeDialogDeleteGroup = () => {
        setIsOpenDialogDeleteGroup(false)
    }

    const onDeleteGroup = async () => {
        await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdDeleteByGroupIdDelete(props.courseId, props.id)
        props.update()
    }

    useEffect(() => {
        getGroupState()
    }, [props])

    const getGroupState = async () => {
        const courseGroups = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetCourseDataGet(props.courseId)
        const group = await ApiSingleton.courseGroupsApi.apiCourseGroupsGetByGroupIdGet(props.id!)
        const groupMates = await Promise.all(group.groupMates!.map(async (gm) => {
            const student = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(gm.studentId!)
            return {
                id: gm.studentId!,
                name: student.name!,
                surname: student.surname!,
            }
        }))
        setStudentsWithoutGroup(courseGroups.studentsWithoutGroup!)
        setGroup(group)
        setCurrentGroupMates(groupMates)
    }

    const addStudentInGroup = async (userId: string) => {
        await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdAddStudentInGroupByGroupIdPost(props.courseId!, props.id!, userId)
            .then(() => getGroupState())
    }

    const onDelete = async (userId: string) => {
        await ApiSingleton.courseGroupsApi
            .apiCourseGroupsByCourseIdRemoveStudentFromGroupByGroupIdDelete(props.courseId, props.id, userId)
            .then(() => getGroupState())
    }

    const classes = useStyles()

    const students = studentsWithoutGroup!.map((student: GroupMateDataDTO) => {
        const fullName = student.surname + ' ' + student.name
        return (
            <ListItem
                button
                onClick={() => addStudentInGroup(student.id!)}
            >
                <Typography style={{fontSize: '15px'}}>
                    {fullName}
                </Typography>
            </ListItem>
        )
    })

    return (
        <div>
            <Grid container justifyContent="center">
                <Grid item>
                    <Typography style={{fontSize: '20px', marginTop: '16px'}}>
                        Название группы: {group.name}
                    </Typography>
                </Grid>
                <Grid container xs={11} justifyContent="space-between" style={{marginTop: '40px'}}>
                    <Grid item>
                        <div className={classes.tools}>
                            <div>
                                <Typography>
                                    Состав группы
                                </Typography>
                            </div>
                        </div>
                        {group.groupMates!.length !== 0 &&
                        <List>
                            {currentGroupMates!.map((student) => {
                                return (
                                    <ListItem style={{padding: "0"}}>
                                        <div className={classes.tools}>
                                            <Typography style={{fontSize: '15px'}}>
                                                {student.surname}&nbsp;{student.name}
                                            </Typography>
                                            <IconButton
                                                onClick={() => onDelete(student.id!)}
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </div>
                                    </ListItem>
                                )
                            })}
                        </List>
                        }
                    </Grid>
                    {studentsWithoutGroup.length !== 0 && (
                        <Grid item>
                            <Grid container direction="column" alignItems="flex-end">
                                <Grid item>
                                    <Typography>
                                        Выберите студента для добавления в группу.
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <List
                                        component="nav"
                                    >
                                        {students}
                                    </List>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
                <Grid container xs={11} alignItems="flex-end" direction="column" style={{ marginTop: '100px'}}>
                    <Grid item>
                        <Button
                            onClick={openDialogDeleteGroup}
                            fullWidth
                            variant="contained"
                            style={{ color: '#8d8686'}}
                            startIcon={<DeleteIcon/>}
                        >
                            Удалить группу
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <DeletionConfirmation
                onCancel={closeDialogDeleteGroup}
                onSubmit={onDeleteGroup}
                isOpen={isOpenDialogDeleteGroup}
                dialogTitle={"Удаление группы"}
                dialogContentText={`Вы точно хотите удалить группу "${group.name}"?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </div>
    )
}

export default GroupEdit;