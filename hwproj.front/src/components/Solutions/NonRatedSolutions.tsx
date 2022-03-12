import * as React from 'react';
import {
    Grid,
    Typography,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    TextField,
    Box
} from "@material-ui/core";
import Link from '@material-ui/core/Link'
import './style.css'
import {HomeworkTaskViewModel, Solution} from '../../api'
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ReactMarkdown from 'react-markdown'
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useState} from "react";
import {match} from "react-router-dom";

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean,
    isExpanded: boolean,
    maxRating: number,
}

interface ISolutionState {
    points: number,
    task: HomeworkTaskViewModel,
    lecturerComment: string,
    clickedForRate: boolean,
}

const NonRatedSolutionComponent: FC<ISolutionProps> = (props) => {

    const [nonRatedSolution, setNonRatedSolution] = useState<ISolutionState>({
        points: 0,
        task: {},
        lecturerComment: "",
        clickedForRate: false,
    })

    const assignSolution = async () => {
        await ApiSingleton.solutionsApi
            .apiSolutionsRateSolutionBySolutionIdByNewRatingPost(
                props.solution.id!,
                nonRatedSolution.points,
                nonRatedSolution.lecturerComment
            )
        window.location.reload()
    }

    const {solution} = props
    const postedSolutionTime = new Date(solution.publicationDate!.toString()).toLocaleString("ru-RU")

    return (
        <Accordion>
            <AccordionSummary
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{backgroundColor: "#eceef8"}}
            >
                <Typography>
                    Дата отправки: {postedSolutionTime}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container direction="column">
                    <Grid item>
                        <Link
                            href={solution.githubUrl}
                            target="_blank"
                            style={{color: '#212529'}}
                        >
                            Ссылка на решение
                        </Link>
                    </Grid>
                    {solution.comment &&
                    <Grid item style={{ marginTop: '16px' }}>
                        <Typography className="antiLongWords">
                            Комментарий к решению: {solution.comment}
                        </Typography>
                    </Grid>
                    }
                    {props.forMentor && !nonRatedSolution.clickedForRate &&
                    <Grid item style={{ marginTop: '16px' }}>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                                e.persist()
                                setNonRatedSolution((prevState) => ({
                                    ...prevState,
                                    clickedForRate: true
                                }))
                            }}
                        >
                            Оценить решение
                        </Button>
                    </Grid>
                    }
                    {props.forMentor && nonRatedSolution.clickedForRate &&
                    <Grid item style={{ marginTop: '16px' }}>
                        <Grid style={{ width: "200px" }}>
                            <TextField
                                required
                                label="Баллы за решение"
                                variant="outlined"
                                margin="normal"
                                type="number"
                                fullWidth
                                InputProps={{
                                    readOnly: !props.forMentor,
                                    inputProps: {max: props.maxRating, min: 0},
                                }}
                                defaultValue={solution.rating!}
                                maxRows={10}
                                onChange={(e) => {
                                    e.persist()
                                    setNonRatedSolution((prevState) => ({
                                        ...prevState,
                                        points: +e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid style={{ marginTop: '10px' }}>
                            <TextField
                                multiline
                                fullWidth
                                InputProps={{
                                    readOnly: !props.forMentor,
                                }}
                                rows="4"
                                rowsMax="15"
                                label="Комментарий преподавателя"
                                variant="outlined"
                                margin="normal"
                                value={nonRatedSolution.lecturerComment}
                                onChange={(e) => {
                                    e.persist()
                                    setNonRatedSolution((prevState) => ({
                                        ...prevState,
                                        lecturerComment: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                    </Grid>
                    }
                    {props.forMentor && nonRatedSolution.clickedForRate &&
                    <Grid container item spacing={1} style={{ marginTop: '10px' }}>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={assignSolution}
                            >
                                Отправить
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={(e) => {
                                    e.persist()
                                    setNonRatedSolution((prevState) => ({
                                        ...prevState,
                                        clickedForRate: false
                                    }))
                                }}
                            >
                                Отмена
                            </Button>
                        </Grid>
                    </Grid>
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>
    )
}

export default NonRatedSolutionComponent