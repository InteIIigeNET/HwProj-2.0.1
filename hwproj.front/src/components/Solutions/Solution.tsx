import * as React from 'react';
import {Solution} from '../../api'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import ApiSingleton from "../../api/ApiSingleton";
import { TextField, Typography } from '@material-ui/core';

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean
}

interface ISolutionState {
    points: number
}

export default class SolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            points: 0
        }
    }

    public render() {
        const { solution } = this.props;
        const postedSolutionTime = "15.15.15 15:15:15" // new Date(solution.date!.toString()).toLocaleDateString("ru-RU");
        return (
            <div>
                <Link href={solution.githubUrl}>Ссылка на решение</Link>
                <br />
                {solution.comment!.length > 0 &&
                    <Typography>
                    Комментарий к решению: {solution.comment}
                    <br />
                    </Typography>
                }
                {solution.state?.toString() === "Checked" &&
                    <Typography>
                        Текущее количество баллов: {solution.rating}
                    </Typography>
                }
                <Typography>
                    Время отправки решения: {postedSolutionTime}
                </Typography>
                <TextField
                    required
                    label="Баллы за решение"
                    variant="outlined"
                    margin="normal"
                    type="number"
                    InputProps={{
                        readOnly: !this.props.forMentor,
                      }}
                    value={this.state.points}
                    onChange={(e) => this.setState({ points: +e.target.value })}
                />
                {this.props.forMentor &&
                    <div>
                        <Button onClick={() => this.assignSolution ()} size="small" color="primary" variant="contained">
                            Отправить
                        </Button>
                    </div>
                }
            </div>
        )
    }

    async assignSolution () {
        await ApiSingleton.solutionsApi.apiSolutionsRateSolutionBySolutionIdByNewRatingPost(this.props.solution.id!, this.state.points)
    }
}
