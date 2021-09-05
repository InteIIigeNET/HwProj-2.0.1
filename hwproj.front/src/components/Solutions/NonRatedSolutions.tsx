import * as React from 'react';
import {Grid, Typography, Accordion, AccordionDetails, AccordionSummary, Button} from "@material-ui/core";
import Link from '@material-ui/core/Link'
import './style.css'
import {HomeworkTaskViewModel, Solution} from '../../api'
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ReactMarkdown from 'react-markdown'

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean,
    isExpanded: boolean
}

interface ISolutionState {
    points: number,
    task: HomeworkTaskViewModel,
    lecturerComment: string,
    clickedForRate: boolean,
}

export default class NonRatedSolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            points: 0,
            task: {},
            lecturerComment: "",
            clickedForRate: false,
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
                    <Grid container direction="column" justifyContent={"flex-end"}>
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
                        {this.props.forMentor &&
                            <Grid item>
                                <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                >
                                    Оценить решение
                                </Button>
                            </Grid>
                        }
                    </Grid>
                </AccordionDetails>
            </Accordion>
        )
    }
}