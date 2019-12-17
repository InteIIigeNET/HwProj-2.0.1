import * as React from 'react';
import {Solution} from '../api/solutions/api'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import ApiSingleton from "../api/ApiSingleton";

interface ISolutionProps {
    id: number,
    forMentor: boolean
}

interface ISolutionState {
    isLoaded: boolean,
    solution: Solution
}

export default class SolutionComponent extends React.Component<ISolutionProps, ISolutionState> {
    constructor(props: ISolutionProps) {
        super(props);
        this.state = {
            isLoaded: false,
            solution: {}
        }
    }

    public render() {
        const { isLoaded, solution } = this.state;

        if (isLoaded) {
            return (
                <div>
                    <Link href={solution.githubUrl}>Ссылка на решение</Link>
                    <br />
                    {solution.comment!.length > 0 &&
                    <div>
                        Комментарий к решению: {solution.comment}
                        <br />
                    </div>
                    }
                    Статус решения: {solution.state}
                    {this.props.forMentor &&
                        <div>
                            <Button onClick={() => this.acceptSolution()} size="small" color="primary" variant="contained">
                                Принять
                            </Button>
                            &nbsp;
                            <Button onClick={() => this.rejectSolution()} size="small" color="primary" variant="contained">
                                Отклонить
                            </Button>
                        </div>
                    }
                </div>
            )
        }

        return "";
    }

    acceptSolution() {
        ApiSingleton.solutionsApi.acceptSolution(this.props.id)
            .then(res => this.componentDidMount())
    }

    rejectSolution() {
        ApiSingleton.solutionsApi.rejectSolution(this.props.id)
            .then(res => this.componentDidMount())
    }

    componentDidMount() {
        ApiSingleton.solutionsApi.getSolution(this.props.id)
            .then(res => res.json())
            .then(solution => this.setState({
                isLoaded: true,
                solution: solution
            }));
    }
}
