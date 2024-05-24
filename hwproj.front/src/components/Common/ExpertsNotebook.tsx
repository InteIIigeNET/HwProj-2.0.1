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

interface InviteExpertState {
    isOpen: boolean;
    email: string;
    id: string;
}

const ExpertsNotebook: FC = () => {
    const [experts, setExperts] = useState<User[]>([]);
    const [visibleInviteButtonRow, setVisibleInviteButtonRow] = useState<string>("");
    const [isAllExpertsSelected, setIsAllExpertsSelected] = useState<boolean>(false)
    const [isOpenRegisterExpert, setIsOpenRegisterExpert] = useState<boolean>(false)
    const [inviteExpertState, setInviteExpertState] = useState<InviteExpertState>({
        isOpen: false,
        email: "",
        id: ""
    })

    useEffect(() => {
        const fetchExperts = async () => {
            const allExperts = isAllExpertsSelected
                ? await ApiSingleton.accountApi.apiAccountGetAllExpertsGet()
                : await ApiSingleton.accountApi.apiAccountGetExpertsGet();
            setExperts(allExperts);
        };

        fetchExperts();
    }, [isAllExpertsSelected, isOpenRegisterExpert]);


    const handleAllExpertsSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsAllExpertsSelected(event.target.checked)
    };

    const handleOpenExpertInvitation = (expertEmail: string, id: string) => {
        setInviteExpertState({
            email: expertEmail,
            id: id,
            isOpen: true
        })
    }

    const handleCloseExpertInvitation = () => {
        setInviteExpertState({
            email: "",
            id: "",
            isOpen: false
        })
    }

    const handleCloseExpertRegistration = () => {
        setIsOpenRegisterExpert(false);
    }

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
                    <Table style={{tableLayout: 'fixed'}} aria-label="table" size="medium" aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell align={"left"}>
                                    <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                        Почта
                                    </Typography>
                                </TableCell>
                                <TableCell align={"left"}>
                                    <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                        ФИО
                                    </Typography>
                                </TableCell>
                                <TableCell align={"center"}>
                                    <Typography variant={"h6"} style={{fontSize: '18px'}}>
                                        Компания
                                    </Typography>
                                </TableCell>
                                <TableCell align={"center"}/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experts.map((row: User) => (
                                <TableRow
                                    key={row.id}
                                    onMouseEnter={() => setVisibleInviteButtonRow(row.id!)}
                                    // onMouseLeave={() => setVisibleInviteButtonRow("")}
                                >
                                    <TableCell align={"left"}>{row.email}</TableCell>
                                    <TableCell
                                        align={"left"}>{row.surname + ' ' + row.name + ' ' + row.middleName}</TableCell>
                                    <TableCell align={"center"}>{row.companyName}</TableCell>
                                    <TableCell align={"center"}>
                                        <Grid container justifyContent="flex-end">
                                            <Grid item style={{minHeight: 30}} alignContent={"center"}>
                                                {visibleInviteButtonRow === row.id &&
                                                    <Button
                                                        onClick={() => handleOpenExpertInvitation(row.email!, row.id!)}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        Пригласить
                                                    </Button>}
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
                                open={false}
                                sx={{'& .MuiFab-primary': {width: 42, height: 42}}}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
            {isOpenRegisterExpert && (
                <RegisterExpertModal isOpen={isOpenRegisterExpert} close={handleCloseExpertRegistration}/>
            )}
            {inviteExpertState.isOpen && (
                <InviteExpertModal isOpen={inviteExpertState.isOpen} close={handleCloseExpertInvitation}
                                   expertEmail={inviteExpertState.email} expertId={inviteExpertState.id}/>
            )}
        </div>
    );
}

export default ExpertsNotebook