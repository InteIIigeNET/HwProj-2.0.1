import * as React from 'react';
import { Grid, Typography } from "@material-ui/core";
import Link from '@material-ui/core/Link'
import {HomeworkTaskViewModel, Solution} from '../../api'

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean
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
            <Grid container direction="column" justifyContent="flex-start">
                <Grid item>
                    <Link href={solution.githubUrl} target="_blank">Ссылка на решение</Link>
                </Grid>
                <Grid item >
                    <Typography variant="body1">
                        Комментарий к решению: {solution.comment}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography>Время отправки решения: {postedSolutionTime}</Typography>
                </Grid>
            </Grid>
        )
    }
}