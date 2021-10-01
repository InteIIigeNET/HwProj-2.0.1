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
    lecturerComment: string,
}

export default class SolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            points: 0,
            task: {},
            lecturerComment: "",
        }
    }

    public render() {
        const { solution } = this.props;
        const postedSolutionTime = new Date(solution.publicationDate!.toString()).toLocaleString("ru-RU");
        return (
            <div>
                <Link href={solution.githubUrl} target="_blank">Ссылка на решение</Link>
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
                {(this.props.forMentor || (!this.props.forMentor && this.state.lecturerComment)) &&
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
                }
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
