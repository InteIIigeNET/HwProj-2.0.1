import * as React from 'react';
import {Solution, SolutionsApi} from '../api/solutions/api'
import CheckCircle from '@material-ui/icons/CheckCircle'
import HighlightOff from '@material-ui/icons/HighlightOff'
import IconButton from '@material-ui/core/IconButton'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { red, green } from '@material-ui/core/colors'

const redTheme = createMuiTheme({ palette: { primary: red } })
const greenTheme = createMuiTheme({ palette: { primary: green } })

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
            return (
                <div>
                    Link: {solution.githubUrl}
                    <br />
                    Status: {solution.state}
                    <br />
                    <MuiThemeProvider theme={greenTheme}>
                        <IconButton color="primary" onClick={() => this.acceptSolution()}>
                            <CheckCircle />
                        </IconButton>
                    </MuiThemeProvider>
                    <MuiThemeProvider theme={redTheme}>
                        <IconButton color="primary" onClick={() => this.rejectSolution()}>
                            <HighlightOff />
                        </IconButton>
                    </MuiThemeProvider>
                </div>
            )
        }

        return "";
    }

    acceptSolution() {
        let api = new SolutionsApi();
        api.acceptSolution(this.props.id)
            .then(res => this.componentDidMount())
    }

    rejectSolution() {
        let api = new SolutionsApi();
        api.rejectSolution(this.props.id)
            .then(res => this.componentDidMount())
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
