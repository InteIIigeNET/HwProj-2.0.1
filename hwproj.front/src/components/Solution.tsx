import * as React from 'react';
import {Solution} from '../api/solutions/api'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import ApiSingleton from "../api/ApiSingleton";
import { TextField, Typography } from '@material-ui/core';

interface ISolutionProps {
    id: number,
    forMentor: boolean
}

interface ISolutionState {
    isLoaded: boolean,
    solution: Solution,
    points: number
}

export default class SolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solution: {},
            points: 0
        }
    }

    public render() {
        const { isLoaded, solution } = this.state;

        if (isLoaded) {
            const postedSolutionTime = new Date(solution.date!.toString()).toLocaleDateString("ru-RU");
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
                    {solution.state === "checked" &&
                      <Typography>
                          Текущее количество баллов: {solution.points}
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

        return "";
    }

    async assignSolution () {
        await ApiSingleton.solutionService.assignPointsBySolutionId(this.props.id, this.state.points)
        await this.componentDidMount()
    }

    async componentDidMount() {
        const solution = await ApiSingleton.solutionService.getSolutionBySolutionId(this.props.id)
        this.setState({
            isLoaded: true,
            solution: solution
        })
    }
}
