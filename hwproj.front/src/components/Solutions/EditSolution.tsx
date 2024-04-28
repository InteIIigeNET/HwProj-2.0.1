import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@material-ui/core";
import { Alert, Autocomplete } from "@mui/material";
import { AccountDataDto, SolutionViewModel } from "api";
import ApiSingleton from "api/ApiSingleton";
import * as React from "react";


interface IEditSolutionsProps {
    userId: string,
    solutionId : number,
    lastGroup: string[],
    taskId: number,
    supportsGroup: boolean,
    courseMates: AccountDataDto[],
    onCancel: () => void,
    onSubmit: () => void
}

const EditSolution : React.FC<IEditSolutionsProps> = (props) => {
    const [solution, setSolution] = React.useState<SolutionViewModel>({
        groupMateIds: props.lastGroup || [],
        id : props.solutionId  
    })
    const handleSubmit = async (e: any) => {
        e.preventDefault();
    
        await ApiSingleton.solutionsApi.apiSolutionsByTaskIdPost(props.taskId, solution);
        
        props.onSubmit();
        props.onCancel();
    }

    return (
        <Dialog open={true} onClose={() => props.onCancel()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                Добавить к решению группу 
            </DialogTitle>
            <DialogContent>
                <Grid style={{marginBottom: 20}} container xs={12}>
                    {props.supportsGroup && <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            id="tags-outlined"
                            options={props.courseMates}
                            value={props.courseMates.filter(s => solution.groupMateIds?.includes(s.userId!))}
                            getOptionLabel={(option) => option.surname! + ' ' + option.name! + " / " + option.email!}
                            filterSelectedOptions
                            onChange={(e, values) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    groupMateIds: values.map(x => x.userId!)
                                }))
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Команда"
                                    placeholder="Совместно с"
                                />
                            )}
                        />
                    </Grid>}                 
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    size="medium"
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth="true"
                    onClick={e => handleSubmit(e)}
                >
                    Обновить
                </Button>
                <Button
                    size="medium"
                    variant="contained"
                    color="primary"
                    fullWidth="true"
                    onClick={e => props.onCancel()}
                >
                    Отменить
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditSolution