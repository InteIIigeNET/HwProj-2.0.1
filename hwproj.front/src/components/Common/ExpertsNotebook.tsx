import React, {FC, useState, useEffect} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {Typography, Grid, Button, Checkbox, FormControlLabel} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {User} from 'api/api';
import ApiSingleton from "../../api/ApiSingleton";

interface ICommonState {
    showAllExperts: boolean
}

const useStyles = makeStyles(() => ({
    info: {
        justifyContent: "space-between",
    },
}))

const ExpertsNotebook: FC = () => {
    const classes = useStyles();
    const [experts, setExperts] = useState<User[]>([]);

    const [state, setState] = useState<ICommonState>({
        showAllExperts: false
    })

    const userId = ApiSingleton.authService.getUserId()

    useEffect(() => {
        const fetchExperts = async () => {
            const allExperts = state.showAllExperts
                ? await ApiSingleton.accountApi.apiAccountGetAllExpertsGet()
                : await ApiSingleton.accountApi.apiAccountGetExpertsGet(userId);
            setExperts(allExperts);
        };

        fetchExperts();
    }, [state]);


    const handleShowAllExpertsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            showAllExperts: event.target.checked,
        });
    };

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

                <TableContainer>
                    <Table aria-label="table" size="medium" aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell>Почта</TableCell>
                                <TableCell>ФИО</TableCell>
                                <TableCell>Компания</TableCell>

                                <TableCell>
                                    <Grid container justifyContent="flex-end">
                                        <Grid item>
                                            <FormControlLabel
                                                control={<Checkbox size="small" onChange={handleShowAllExpertsChange}/>}
                                                label="Показать всех"/>
                                        </Grid>
                                    </Grid>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experts.map((row: User) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.surname + ' ' + row.name + ' ' + row.middleName}</TableCell>
                                    <TableCell>{row.companyName}</TableCell>
                                    <TableCell>
                                        <Grid container>
                                            <Grid item>
                                                <Button
                                                    //onClick={}
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
            </Grid>
        </div>
    );
}

export default ExpertsNotebook