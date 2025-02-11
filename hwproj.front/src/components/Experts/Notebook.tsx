import React, {FC, useState, useEffect} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import SpeedDial from '@mui/material/SpeedDial';
import Box from '@mui/material/Box';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {Typography, Grid, Button, Checkbox, FormControlLabel, CircularProgress, Snackbar} from "@material-ui/core";
import {ExpertDataDTO, UpdateExpertTagsDTO} from 'api/api';
import ApiSingleton from "../../api/ApiSingleton";
import RegisterExpertModal from "./RegisterModal";
import InviteExpertModal from "./InviteModal";
import Chip from "@mui/material/Chip/Chip";
import InlineTags from "./InlineTags";
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import NameBuilder from './../Utils/NameBuilder';
import {Alert} from "@mui/material";

interface InviteExpertState {
    isOpen: boolean;
    email: string;
    fullName: string;
    id: string;
}

interface EditTagsState {
    isOpen: boolean;
    areTagsChanged: boolean;
}

export const ControlledExpertTip: FC = () =>
    <Tooltip arrow placement={"top"}
             PopperProps={{
                 modifiers: [
                     {
                         name: "offset",
                         options: {
                             offset: [0, -10],
                         },
                     },
                 ],
             }}
             title={<div style={{fontSize: "12px"}}>Эксперт был добавлен Вами</div>}>
        <sup style={{color: "#2979ff", "fontWeight": "bold", fontSize: "15px", cursor: "default"}}>*</sup>
    </Tooltip>

function tagToColor(label: string) {
    let hash = 0;
    let i;

    for (i = 0; i < label.length; i += 1) {
        hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    const lightness = 30 + Math.abs(hash % 20);

    return `hsl(${hue}, 50%, ${lightness}%)`;
}

const ExpertsNotebook: FC = () => {
    const [isLoaded, setLoadedState] = useState<boolean>(false);
    const [allExperts, setAllExperts] = useState<ExpertDataDTO[]>([]);
    const [mouseHoveredRow, setMouseHoveredRow] = useState<string>("");
    const [isAllExpertsSelected, setIsAllExpertsSelected] = useState<boolean>(false)
    const [isOpenRegisterExpert, setIsOpenRegisterExpert] = useState<boolean>(false)
    const [expertWasRegistered, setExpertWasRegistered] = useState<boolean>(false)

    const [tagsEditingState, setTagsEditingState] = useState<EditTagsState>({
        isOpen: false,
        areTagsChanged: false
    })

    const [inviteExpertState, setInviteExpertState] = useState<InviteExpertState>({
        isOpen: false,
        email: "",
        fullName: "",
        id: ""
    })

    const userId = ApiSingleton.authService.getUserId();
    const isExpertControlled = (expertLecturerId: string) => expertLecturerId === userId;

    useEffect(() => {
        const fetchExperts = async () => {
            const allExperts = await ApiSingleton.expertsApi.expertsGetAll();
            setAllExperts(allExperts);
            setLoadedState(true);
        };

        fetchExperts();
    }, [isOpenRegisterExpert]);

    const handleAllExpertsSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsAllExpertsSelected(event.target.checked)
    };

    const handleOpenExpertInvitation = (expert: ExpertDataDTO) => {
        setInviteExpertState({
            email: expert.email!,
            fullName: NameBuilder.getUserFullName(expert.name, expert.surname, expert.middleName),
            id: expert.id!,
            isOpen: true
        })
    }

    const handleCloseExpertInvitation = () => {
        setInviteExpertState({
            email: "",
            fullName: "",
            id: "",
            isOpen: false
        })
    }

    const handleCloseExpertRegistration = (isExpertRegistered: boolean) => {
        setExpertWasRegistered(isExpertRegistered)
        setIsOpenRegisterExpert(false);
    }

    const handleOpenTagsEditing = () => {
        setTagsEditingState(prevState => ({
            ...prevState,
            isOpen: true
        }));
    }

    const handleCloseTagsEditing = (expert: ExpertDataDTO) => {
        if (tagsEditingState.areTagsChanged) {
            const dto: UpdateExpertTagsDTO = {
                expertId: expert.id,
                tags: expert.tags
            }
            ApiSingleton.expertsApi.expertsUpdateTags(dto);
        }
        setTagsEditingState({
            isOpen: false,
            areTagsChanged: false
        });
    }

    const handleTagsChange = (expert: ExpertDataDTO, newTags: string[]) => {
        setTagsEditingState(prevState => ({
            ...prevState,
            areTagsChanged: true
        }));

        expert.tags = newTags.filter(tag => !tag.includes(";"))
    }

    const getExpertRows = () => {
        const visibleExperts = isAllExpertsSelected ?
            allExperts : allExperts.filter(expert => expert.lecturerId === userId);

        return visibleExperts.map((expert: ExpertDataDTO) => (
            <TableRow
                key={expert.id}
                onMouseEnter={() => setMouseHoveredRow(expert.id!)}
            >
                <TableCell align={"left"} sx={{ fontWeight: 500 }}>
                    {NameBuilder.getUserFullName(expert.name, expert.surname, expert.middleName)}
                    {isExpertControlled(expert.lecturerId!) && <ControlledExpertTip/>}
                </TableCell>
                <TableCell align={"center"}>{expert.email}</TableCell>
                <TableCell align={"center"}>{expert.companyName}</TableCell>
                <TableCell align={"center"} onMouseLeave={() => handleCloseTagsEditing(expert)}>
                    <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
                        {mouseHoveredRow === expert.id && tagsEditingState.isOpen ?
                            <InlineTags tags={expert.tags!} onTagsChange={(value) => handleTagsChange(expert, value)}/>
                            :
                            (expert.tags?.filter(t => t !== '').map((tag, index) => (
                                <Grid item>
                                    <Chip key={index}
                                          variant={"outlined"}
                                          label={tag}
                                          size={"small"}
                                          style={{
                                              cursor: isExpertControlled(expert.lecturerId!) ? "text" : "default",
                                              backgroundColor: tagToColor(tag),
                                              color: "white"
                                          }}
                                    />
                                </Grid>)))}
                        {mouseHoveredRow === expert.id && !tagsEditingState.isOpen && (
                            <Grid item>
                                <Chip
                                    variant={"outlined"}
                                    label={<EditIcon fontSize={"small"} color={"action"}/>}
                                    onClick={handleOpenTagsEditing}
                                    size={"small"}
                                    style={{
                                        cursor: "pointer"
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </TableCell>
                <TableCell align={"right"}>
                    <Grid container justifyContent="flex-end">
                        <Grid item style={{minHeight: 32}} alignContent={"center"}>
                            {mouseHoveredRow === expert.id &&
                                <Button
                                    onClick={() => handleOpenExpertInvitation(expert)}
                                    color="primary"
                                    size="small"
                                >
                                    Пригласить
                                </Button>}
                        </Grid>
                    </Grid>
                </TableCell>
            </TableRow>
        ))
    }

    if (isLoaded) {
        return (
            <div className="container" style={{marginBottom: '50px'}}>
                <Grid container style={{marginTop: "15px"}} spacing={2}>
                    <Grid item container justifyContent={"space-between"} direction={"row"}>
                        <Grid item direction={"row"} spacing={2} style={{display: "flex"}}>
                            <Typography style={{fontSize: '22px'}}>
                                Эксперты
                            </Typography>
                        </Grid>
                        <Grid item justify-content={"flex-to-end"}>
                            <FormControlLabel
                                control={<Checkbox size="small" onChange={handleAllExpertsSelection}/>}
                                label="Показать всех"/>
                        </Grid>
                    </Grid>
                    <TableContainer>
                        <Table style={{tableLayout: 'fixed'}} aria-label="table" size="medium"
                               aria-labelledby="tableTitle">
                            <TableHead>
                                <TableRow>
                                    <TableCell align={"left"}>
                                        <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                            ФИО
                                        </Typography>
                                    </TableCell>
                                    <TableCell align={"center"}>
                                        <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                            Почта
                                        </Typography>
                                    </TableCell>
                                    <TableCell align={"center"}>
                                        <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                            Компания
                                        </Typography>
                                    </TableCell>
                                    <TableCell align={"center"}>
                                        <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                            Тэги
                                        </Typography>
                                    </TableCell>
                                    <TableCell align={"center"}/>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getExpertRows()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid item container>
                        <Grid item>
                            <Box sx={{fontSize: 100}}>
                                <SpeedDial
                                    ariaLabel="SpeedDial example"
                                    icon={<SpeedDialIcon/>}
                                    onClick={() => setIsOpenRegisterExpert(true)}
                                    open={false}
                                    sx={{'& .MuiFab-primary': {width: 42, height: 42}}}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
                {isOpenRegisterExpert && (
                    <RegisterExpertModal isOpen={isOpenRegisterExpert} onClose={handleCloseExpertRegistration}/>)}
                {inviteExpertState.isOpen && (
                    <InviteExpertModal isOpen={inviteExpertState.isOpen} onClose={handleCloseExpertInvitation}
                                       expertEmail={inviteExpertState.email} expertId={inviteExpertState.id}
                                       expertFullName={inviteExpertState.fullName}
                    />)}
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    open={expertWasRegistered}
                    onClose={() => setExpertWasRegistered(false)}
                    key={'top center'}
                    autoHideDuration={5000}
                    style={{marginTop: "40px"}}
                >
                    <Alert severity="success">Эксперт успешно зарегистрирован</Alert>
                </Snackbar>
            </div>
        )
    }
    return (
        <div className="container">
            <p>Загрузка...</p>
            <CircularProgress/>
        </div>
    )
}

export default ExpertsNotebook