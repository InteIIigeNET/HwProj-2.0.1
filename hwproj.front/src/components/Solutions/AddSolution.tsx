import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import {SolutionViewModel} from "../../api";
import {FC, useState} from "react";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";
import {Alert} from "@mui/material";

interface IAddSolutionProps {
    lastSolutionUrl: string | undefined,
    taskId: number,
    onAdd: () => void,
    onCancel: () => void,
}

const useStyles = makeStyles(theme => ({
    buttons: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    button: {
        marginRight: '16px',
    }
}))

const AddSolution: FC<IAddSolutionProps> = (props) => {

    const [solution, setSolution] = useState<SolutionViewModel>({
        githubUrl: props.lastSolutionUrl || "",
        comment: "",
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await ApiSingleton.solutionsApi.apiSolutionsByTaskIdPost(props.taskId, solution)
        props.onAdd()
    }

    const classes = useStyles()
    const {githubUrl} = solution

    return (
        <div>
            <form onSubmit={e => handleSubmit(e)}>
                <Grid container xs={12}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Ссылка на решение"
                            variant="outlined"
                            value={solution.githubUrl}
                            onChange={(e) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    githubUrl: e.target.value,
                                }))
                            }}
                        />
                        {githubUrl === props.lastSolutionUrl &&
                            <Alert sx={{paddingTop: 0, paddingBottom: 0}} severity="info">Ссылка взята из предыдущего решения</Alert>}
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '16px'}}>
                        <TextField
                            multiline
                            fullWidth
                            rows="4"
                            label="Комментарий"
                            variant="outlined"
                            value={solution.comment}
                            onChange={(e) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    comment: e.target.value,
                                }))
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '16px'}}>
                        <div className={classes.buttons}>
                            <div style={{marginRight: '16px'}}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Отправить решение
                                </Button>
                            </div>
                            <div>
                                <Button
                                    size="small"
                                    onClick={() => props.onCancel()}
                                    variant="contained"
                                    color="primary"
                                >
                                    Отменить
                                </Button>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </form>
        </div>
    )
}

export default AddSolution
