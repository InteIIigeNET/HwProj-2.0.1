import * as React from 'react';
import {Solution, SolutionsApi} from '../api/solutions/api'

interface ISolutionProps {
    id: number
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
            return solution.githubUrl;
        }

        return "";
    }

    componentDidMount() {
        let api = new SolutionsApi();
        api.getSolution(this.props.id)
            .then(res => res.json())
            .then(solution => this.setState({
                isLoaded: true,
                solution: solution
            }));
    }
}
