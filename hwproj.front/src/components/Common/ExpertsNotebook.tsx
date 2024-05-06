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
import {Typography, Grid, Button, Checkbox, FormControlLabel} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {User} from 'api/api';
import ApiSingleton from "../../api/ApiSingleton";
import RegisterExpertModal from "../../components/Auth/RegisterExpertModal";
import InviteExpertModal from "../../components/InviteExpertModal";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

interface InviteExpertState {
    isOpen: boolean;
    email: string;
}

const useStyles = makeStyles(() => ({
    info: {
        justifyContent: "space-between",
    },
}))

const ExpertsNotebook: FC = () => {
    const classes = useStyles();
    const [experts, setExperts] = useState<User[]>([]);

    const [isAllExpertsSelected, setIsAllExpertsSelected] = useState<boolean>(false)

    const [isOpenRegisterExpert, setIsOpenRegisterExpert] = useState<boolean>(false)
    
    const [inviteExpertState, setInviteExpertState] = useState<InviteExpertState>({
        isOpen: false,
        email: ""
    })
    
    const userId = ApiSingleton.authService.getUserId()

    useEffect(() => {
        const fetchExperts = async () => {
            const allExperts = isAllExpertsSelected
                ? await ApiSingleton.accountApi.apiAccountGetAllExpertsGet()
                : await ApiSingleton.accountApi.apiAccountGetExpertsGet(userId);
            setExperts(allExperts);
        };

        fetchExperts();
    }, [isAllExpertsSelected]);


    const handleIsAllExpertsSelectedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsAllExpertsSelected(event.target.checked)
    };
    
    const handleOpenExpertInvitation = (expertEmail : string) => {
        setInviteExpertState({
            email: expertEmail,
            isOpen: true
        })
    }

    const handleCloseExpertInvitation = () => {
        setInviteExpertState({
            email: "",
            isOpen: false
        })
    }

    return (
        <div className="container" style={{marginBottom: '50px'}}>
            <Grid container style={{marginTop: "15px"}} spacing={2}>
                <Grid item container className={classes.info} direction={"row"}>
                    <Grid item direction={"row"} spacing={2} style={{display: "flex"}}>
                        <Typography style={{fontSize: '22px'}}>
                            Эксперты
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container>
                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox size="small" onChange={handleIsAllExpertsSelectedChange}/>}
                            label="Показать всех"/>
                    </Grid>
                </Grid>

                <TableContainer>
                    <Table aria-label="table" size="medium" aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell>Почта</TableCell>
                                <TableCell>ФИО</TableCell>
                                <TableCell>Компания</TableCell>
                                <TableCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experts.map((row: User) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.surname + ' ' + row.name + ' ' + row.middleName}</TableCell>
                                    <TableCell>{row.companyName}</TableCell>
                                    <TableCell>
                                        <Grid container justifyContent="flex-end">
                                            <Grid item>
                                                <Button
                                                    onClick={() => handleOpenExpertInvitation(row.email!)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    Пригласить
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                                //onClickCapture={() => false}
                                open={false}
                                
                                sx={{'& .MuiFab-primary': {width: 45, height: 45}}}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
            {isOpenRegisterExpert && (
                <RegisterExpertModal isOpen={isOpenRegisterExpert} close={() => setIsOpenRegisterExpert(false)}/>
            )}
            {inviteExpertState.isOpen && (
                <InviteExpertModal isOpen={inviteExpertState.isOpen} close={handleCloseExpertInvitation} expertEmail={inviteExpertState.email}/>
            )}
        </div>
    );
}

export default ExpertsNotebook