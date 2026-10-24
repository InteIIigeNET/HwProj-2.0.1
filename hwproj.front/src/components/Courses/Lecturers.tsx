import React, {FC, useState} from 'react'
import {Box, Chip, Divider, IconButton, Link, Paper, Stack, Tooltip, Typography} from "@mui/material";
import {AccountDataDto} from "../../api";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AddLecturerInCourse from "./AddLecturerInCourse";
import MentorWorkspaceModal from "./MentorWorkspaceModal";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";

interface LecturersProps {
    mentors: AccountDataDto[];
    courseId: string;
    isEditCourse: boolean;
    update: any;
}

interface EditMentorWorkspaceState {
    mentor: AccountDataDto | undefined;
    isOpen: boolean;
}

// Оформление панели согласовано с редизайном страницы курса и списка заданий
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const headerSx = {
    px: 1.5,
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const headerChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const rowSx = {
    px: 1.5,
    py: 1.25,
    alignItems: "center",
    transition: "background-color .15s",
    "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.04)"},
}

const emptyStateSx = {
    py: 3,
    px: 2,
    textAlign: "center" as const,
    color: "text.secondary",
}

const Lecturers: FC<LecturersProps> = (props) => {

    const [isOpenDialogAddLecturer, setIsOpenDialogAddLecturer] = useState<boolean>(false)

    const [mentorWorkspaceState, setMentorWorkspaceState] = useState<EditMentorWorkspaceState>({
        mentor: undefined,
        isOpen: false
    })

    const openDialogIconAddLecturer = () => {
        setIsOpenDialogAddLecturer(true)
    }

    const closeDialogIconAddLecturer = () => {
        setIsOpenDialogAddLecturer(false)
    }

    const handleOpenMentorControl = (mentor: AccountDataDto) => {
        setMentorWorkspaceState({
            mentor: mentor,
            isOpen: true
        })
    }

    const handleCloseMentorControl = () => {
        setMentorWorkspaceState({
            mentor: undefined,
            isOpen: false
        })
    }

    const {mentors} = props

    return (
        <>
            <Paper variant={"outlined"} sx={panelSx}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={headerSx}>
                    <SchoolOutlinedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Преподаватели</Typography>
                    {mentors.length > 0 && <Chip size={"small"} label={mentors.length} sx={headerChipSx}/>}
                    <Box sx={{flexGrow: 1}}/>
                    {props.isEditCourse &&
                        <Tooltip arrow title={"Добавить преподавателя"}>
                            <IconButton
                                size={"small"}
                                onClick={openDialogIconAddLecturer}
                                sx={{color: "#3f51b5"}}
                            >
                                <PersonAddIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>
                    }
                </Stack>
                <Divider/>
                {mentors.length === 0
                    ? <Typography variant={"body2"} sx={emptyStateSx}>Преподавателей пока нет</Typography>
                    : <Stack divider={<Divider/>}>
                        {mentors.map(mentor =>
                            <Stack key={mentor.userId} direction={"row"} spacing={1.5} sx={rowSx}>
                                <UserInitialsAvatar user={mentor} size={38}/>
                                <Box sx={{flexGrow: 1, minWidth: 0}}>
                                    <Link
                                        href={`mailto:${mentor.email}`}
                                        underline={"hover"}
                                        sx={{
                                            display: "block",
                                            fontSize: "0.9375rem",
                                            fontWeight: 500,
                                            lineHeight: 1.3,
                                            color: "#212529",
                                            "&:hover, &:focus": {color: "#3f51b5"},
                                        }}
                                    >
                                        {mentor.name}&nbsp;{mentor.surname}
                                    </Link>
                                    {mentor.email &&
                                        <Typography variant={"caption"} noWrap
                                                    sx={{display: "block", color: "text.secondary"}}>
                                            {mentor.email}
                                        </Typography>}
                                </Box>
                                <Tooltip arrow title={"Область работы преподавателя"}>
                                    <IconButton
                                        size={"small"}
                                        onClick={() => handleOpenMentorControl(mentor)}
                                        sx={{flexShrink: 0, color: "#3f51b5"}}
                                    >
                                        <ManageAccountsIcon fontSize={"small"}/>
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )}
                    </Stack>}
            </Paper>
            <AddLecturerInCourse
                onClose={closeDialogIconAddLecturer}
                courseId={props.courseId}
                isOpen={isOpenDialogAddLecturer}
                update={props.update}
            />
            {mentorWorkspaceState.isOpen && mentorWorkspaceState.mentor && (
                <MentorWorkspaceModal
                    isOpen={mentorWorkspaceState.isOpen}
                    onClose={handleCloseMentorControl}
                    courseId={+props.courseId}
                    mentor={mentorWorkspaceState.mentor}
                />)}
        </>
    )
}

export default Lecturers
