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

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean
}

interface ISolutionState {
    points: number,
    task: HomeworkTaskViewModel,
    lecturerComment: string,
    clickedForEdit: boolean,
}

export default class RatedSolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            points: 0,
            task: {},
            lecturerComment: "",
            clickedForEdit: false,
        }
    }

    public render() {
        const {solution} = this.props;
        const postedSolutionTime = new Date(solution.publicationDate!.toString()).toLocaleString("ru-RU");
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
                    <Grid container direction="column" justifyContent={"flex-end"} xs={12}>
                        <Grid item>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Typography>
                                        Информация о решении
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container direction="column">
                                        <Grid item>
                                            <Link href={solution.githubUrl} target="_blank">Ссылка на решение</Link>
                                        </Grid>
                                        {solution.comment &&
                                        <Grid item>
                                            <Typography className="antiLongWords">
                                                Комментарий к решению: {solution.comment}
                                            </Typography>
                                        </Grid>
                                        }
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                        {!this.state.clickedForEdit &&
                            <Grid item>
                                <Typography>
                                    Оценка за решение: {solution.rating}
                                </Typography>
                            </Grid>
                        }
                        {!this.state.clickedForEdit && solution.lecturerComment &&
                        <Grid item>
                            <Typography className="antiLongWords">
                                Комментарий преподавателя: {solution.lecturerComment}
                            </Typography>
                        </Grid>
                        }
                        {!this.state.clickedForEdit && this.props.forMentor &&
                        <Grid item style={{paddingTop:5}}>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => this.setState({clickedForEdit: true})}
                            >
                                Изменить оценку
                            </Button>
                        </Grid>
                        }
                        {this.state.clickedForEdit && this.props.forMentor &&
                        <Grid item>
                            <Box width={1/6}>
                                <TextField
                                    required
                                    label="Баллы за решение"
                                    variant="outlined"
                                    margin="normal"
                                    type="number"
                                    fullWidth
                                    InputProps={{
                                        readOnly: !this.props.forMentor,
                                        inputProps: { min: 0, max: this.state.task.maxRating },
                                    }}
                                    defaultValue={solution.rating!}
                                    onChange={(e) => this.setState({ points: +e.target.value })}
                                />
                            </Box>
                            <TextField
                                multiline
                                fullWidth
                                InputProps={{
                                    readOnly: !this.props.forMentor,
                                }}
                                rows="4"
                                rowsMax="15"
                                label="Комментарий лектора"
                                variant="outlined"
                                margin="normal"
                                value={this.state.lecturerComment}
                                onChange={(e) => this.setState({ lecturerComment: e.target.value })}
                            />
                        </Grid>
                        }
                        {this.state.clickedForEdit && this.props.forMentor &&
                        <Grid container item spacing={1}>
                            <Grid item>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => this.assignSolution()}
                                >
                                    Отправить
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => this.setState({clickedForEdit: false})}
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

    async componentDidMount() {
        this.setState({
            task: await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(this.props.solution.taskId!),
            lecturerComment: this.props.solution.lecturerComment!,
            points: this.props.solution.rating!,
        })
    }

    async assignSolution () {
        await ApiSingleton.solutionsApi.apiSolutionsRateSolutionBySolutionIdByNewRatingPost(this.props.solution.id!, this.state.points, this.state.lecturerComment)
        window.location.reload()
    }
}