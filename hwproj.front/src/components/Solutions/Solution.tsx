import * as React from 'react';
import {HomeworkTaskViewModel, Solution} from '../../api'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import ApiSingleton from "../../api/ApiSingleton";
import { Box, TextField, Typography } from '@material-ui/core';

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean
}

interface ISolutionState {
    points: number,
    task: HomeworkTaskViewModel,
}

export default class SolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            points: 0,
            task: {},
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
                <Typography>
                    Время отправки решения: {postedSolutionTime}
                </Typography>
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

    async componentDidMount() {
        this.setState({
            task: await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(this.props.solution.taskId!)
        })
    }

    async assignSolution () {
        const token = ApiSingleton.authService.getToken();
        await ApiSingleton.solutionsApi.apiSolutionsRateSolutionBySolutionIdByNewRatingPost(this.props.solution.id!, this.state.points, { headers: {"Authorization": `Bearer ${token}`} })
        window.location.reload()
    }
}
