import React, {FC, useState, useEffect} from "react";
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {Typography, CircularProgress, Grid, Tabs, Tab} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles(() => ({
    info: {
        justifyContent: "space-between",
    },
}))

const ExpertsNotebook: FC = () => {
    const classes = useStyles()

    return (
        <div className="container" style={{marginBottom: '50px'}}>
            <Grid container style={{marginTop: "15px"}} spacing={2}>
            <Grid item container className={classes.info} direction={"row"}>
                <Grid item direction={"row"} spacing={2} style={{display: "flex"}}>
                    <Grid item>
                        <Typography style={{fontSize: '22px'}}>
                            Эксперты
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
                <TableContainer>
            <Table aria-label="collapsible table" size="medium" aria-labelledby="tableTitle">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>ФИО</TableCell>
                        <TableCell>Стэк</TableCell>
                        {/*<TableCell align="right">Fat&nbsp;(g)</TableCell>*/}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/*{rows.map((row) => (*/}
                    {/*    <Row key={row.name} row={row} />*/}
                    {/*))}*/}
                </TableBody>
            </Table>
        </TableContainer>
            </Grid>
        </div>
        );
}

export default ExpertsNotebook