import React, {FC, useState} from "react";
import TextField from "@material-ui/core/TextField";
import {Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../../api/ApiSingleton";
import {RegisterExpertViewModel} from "@/api";
import "../Auth/Styles/Register.css";
import Grid from "@material-ui/core/Grid";
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import Avatar from "@material-ui/core/Avatar";
import Tags from "../Common/Tags";
import ValidationUtils from "../Utils/ValidationUtils";

interface IRegisterExpertProps {
    isOpen: boolean;
    onClose: (isExpertRegistered: boolean) => void;
}

interface IRegisterExpertState {
    errors: string[];
}

const RegisterExpertModal: FC<IRegisterExpertProps> = (props) => {
    const [registerState, setRegisterState] = useState<RegisterExpertViewModel>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        companyName: "",
        bio: "",
        tags: []
    })

    const [commonState, setCommonState] = useState<IRegisterExpertState>({
        errors: [],
    })


    const handleTagsChange = (newValue: string[]) => {
        setRegisterState((prevState) => ({
            ...prevState,
            tags: newValue.filter(tag => !tag.includes(";"))
        }))
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!ValidationUtils.isCorrectEmail(registerState.email)) {
            setCommonState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты']
            }))
            return
        }
        try {
            const result = await ApiSingleton.expertsApi.expertsRegister(registerState);
            setCommonState((prevState) => ({
                ...prevState,
                errors: result!.errors ?? [],
            }));

            if (result.succeeded) {
                handleClose(result.succeeded!);
            }
        } catch (e) {
            setCommonState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен'],
            }))
        }
    }

    const handleClose = (isExpertRegistered: boolean) => {
        setRegisterState({
            name: "",
            surname: "",
            middleName: "",
            email: "",
            companyName: "",
            bio: ""
        })

        props.onClose(isExpertRegistered)
    }

    return (
        <div>
            <Dialog open={props.isOpen} onClose={() => handleClose(false)} aria-labelledby="form-dialog-title"
                    maxWidth="xs">
                <DialogTitle id="form-dialog-title">
                    <Grid container>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            <Avatar style={{color: 'white', backgroundColor: '#00AB00'}}>
                                <PersonAddOutlinedIcon/>
                            </Avatar>
                        </Grid>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            <Typography variant="h5">
                                Зарегистрировать эксперта
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            {commonState.errors.length > 0 && (
                                <p style={{color: "red", marginBottom: "0"}}>{commonState.errors}</p>
                            )}
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Имя"
                                    variant="outlined"
                                    name={registerState.name}
                                    onChange={(e) => {
                                        e.persist()
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            name: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Фамилия"
                                    variant="outlined"
                                    name={registerState.surname}
                                    onChange={(e) => {
                                        e.persist()
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            surname: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Отчество"
                                    variant="outlined"
                                    size="small"
                                    name={registerState.middleName}
                                    onChange={(e) => {
                                        e.persist()
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            middleName: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    type="email"
                                    label="Электронная почта"
                                    variant="outlined"
                                    size="small"
                                    name={registerState.email}
                                    onChange={(e) => {
                                        e.persist()
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            email: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Компания"
                                    variant="outlined"
                                    size="small"
                                    value={registerState.companyName}
                                    onChange={(e) => {
                                        e.persist()
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            companyName: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Tags tags={[]} onTagsChange={handleTagsChange} isElementSmall={true}
                                      requestTags={() => Promise.resolve([])}/>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    label="Дополнительная информация (био)"
                                    variant="outlined"
                                    size="small"
                                    value={registerState.bio}
                                    onChange={(e) => {
                                        e.persist()
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            bio: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Зарегистрировать
                        </Button>
                        <Button
                            onClick={() => handleClose(false)}
                            color="primary"
                            variant="text"
                        >
                            Закрыть
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default RegisterExpertModal