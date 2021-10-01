import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import {SolutionViewModel} from "../../api";
import {FC, useState} from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import {GridClassKey} from "@material-ui/core/Grid/Grid";
import makeStyles from "@material-ui/styles/makeStyles";

interface IAddSolutionProps {
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
        githubUrl: "",
        comment: "",
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await ApiSingleton.solutionsApi.apiSolutionsByTaskIdPost(props.taskId, solution)
        props.onAdd()
    }

    const classes = useStyles()

    return (
        <div>
            <form onSubmit={e => handleSubmit(e)}>
                <Grid container>
                    <Grid item xs={9}>
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
                    </Grid>
                    <Grid item xs={9} style={{ marginTop: '16px' }}>
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
                    <Grid item xs={9} style={{ marginTop: '16px' }}>
                        <div className={classes.buttons}>
                            <Grid xs={6} className={classes.button}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Добавить решение
                                </Button>
                            </Grid>
                            <Grid xs={6}>
                                <Button
                                    onClick={() => props.onCancel()}
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                >
                                    Отменить
                                </Button>
                            </Grid>
                        </div>
                    </Grid>
                </Grid>
            </form>
        </div>
    )
}

export default AddSolution