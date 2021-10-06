import React, {FC, useEffect, useState} from 'react';
import {AccountDataDto, GroupMateDataDTO, GroupMateViewModel, GroupViewModel} from "../../api";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import {Card, ListItem, Theme} from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import ApiSingleton from "../../api/ApiSingleton";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import StudentsWithoutGroup from "./StudentsWithoutGroup";
import DeleteIcon from "@material-ui/icons/Delete";

interface StudentState {
    id: string;
    name: string;
    surname: string;
}

interface GroupEditProps {
    group: GroupViewModel;
    studentsWithoutGroup: GroupMateDataDTO[];
    update: any;
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
    const [currentStudents, setCurrentStudents] = useState<StudentState[]>([])

    useEffect(() => {
        getStudents()
    })

    const getStudents = async () => {
        const groupMates = await Promise.all(props.group.groupMates!.map(async(gm) => {
            const student = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(gm.studentId!)
            return {
                id: gm.studentId!,
                name: student.name!,
                surname: student.surname!,
            }
        }))
        setCurrentStudents(groupMates)
    }

    const onDelete = async (userId: string) => {
        const result = await ApiSingleton.courseGroupsApi
            .apiCourseGroupsByCourseIdRemoveStudentFromGroupByGroupIdDelete(
                props.group.courseId!,
                props.group.id!,
                userId
            )
        debugger
        props.update()
    }

    const classes = useStyles()

    return (
        <div>
            <Grid container justifyContent="center">
                <Grid item>
                    <Typography style={{fontSize: '20px', marginTop: '16px'}}>
                        Название группы: {props.group.name}
                    </Typography>
                </Grid>
                <Grid container xs={11} justifyContent="space-between" style={{marginTop: '30px'}}>
                    <Grid item>
                        <div className={classes.tools}>
                            <div>
                                <Typography>
                                    Состав группы
                                </Typography>
                            </div>
                            <div>
                                <IconButton
                                    style={{color: '#212529'}}
                                    onClick={() => setIsAddGroupMates(!isAddGroupMates)}
                                >
                                    <AddIcon fontSize="small"/>
                                </IconButton>
                            </div>
                        </div>
                        {props.group.groupMates!.length !== 0 &&
                        <List>
                            {currentStudents!.map((student) => {
                                return (
                                    <ListItem style={{padding: "0"}}>
                                        <div className={classes.tools}>
                                            <Typography style={{ fontSize: '14px'}}>
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
                    {isAddGroupMates && (
                        <Grid item>
                            <Typography>
                                Выберите студенты для добавления в группу.
                            </Typography>
                            <StudentsWithoutGroup
                                studentsWithoutGroup={props.studentsWithoutGroup}
                                isEdit={true}
                                group={props.group}
                                update={props.update}
                            />
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </div>
    )
}

export default GroupEdit;