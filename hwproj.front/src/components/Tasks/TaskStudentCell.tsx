import * as React from "react";
import TableCell from "@material-ui/core/TableCell";
import {Redirect} from "react-router-dom";
import {Solution, StatisticsTaskSolutionModel} from "api";

interface ITaskStudentCellProps {
  studentId: string;
  taskId: number;
  forMentor: boolean;
  userId: string;
  solutions?: StatisticsTaskSolutionModel[];
}

interface ITaskStudentCellState {
  isLoaded: boolean;
  result: number;
  redirectForMentor: boolean;
  redirectForStudent: boolean;
  color: string;
}

export default class TaskStudentCell extends React.Component<
  ITaskStudentCellProps,
  ITaskStudentCellState
> {
  constructor(props: ITaskStudentCellProps) {
    super(props);
    this.state = {
      isLoaded: false,
      result: -1,
      redirectForMentor: false,
      redirectForStudent: false,
      color: "",
    };
  }

  public render() {
    if (this.state.redirectForMentor) {
      return (
        <Redirect
          to={
            "/task/" +
            this.props.taskId.toString() +
            "/" +
            this.props.studentId.toString()
          }
        />
      );
    }
    if (this.state.redirectForStudent) {
      return <Redirect to={"/task/" + this.props.taskId.toString()} />;
    }

    if (this.state.isLoaded) {
      let onClick = this.props.forMentor
        ? () => this.onMentorCellClick()
        : this.props.userId === this.props.studentId
        ? () => this.onStudentCellClick()
        : () => 0;
      const result = this.state.result !== -1
        ? this.state.result.toString()
        : ""
      return (
        <TableCell
          onClick={onClick}
          component="td"
          padding="none"
          scope="row"
          align="center"
          style={{backgroundColor:this.state.color}}
        >
          {result}
        </TableCell>
      );
    }

    return "";
  }

  onMentorCellClick() {
    this.setState({ redirectForMentor: true });
  }

  onStudentCellClick() {
    this.setState({ redirectForStudent: true });
  }

  getTheLastAssessedSolution = (solutions: Array<Solution>): Solution | null => {
    let maxPoints = 0
    let selectedSolution = null
    solutions
      // .filter((solution) => solution.state?.toString() == "Posted")
      .map((solution) => {
        if (solution.rating! >= maxPoints) {
          maxPoints = solution.rating!
          selectedSolution = solution
        }
      })
    return selectedSolution
  }

  getCellBackgroundColor = (rating: number|undefined, maxRating: number|undefined, state: Solution.StateEnum|undefined): string => {
    if (state == undefined || state == Solution.StateEnum.NUMBER_0)
      return ""
    if (rating! <= 0)
      return "#FF6347"
    if (rating! >= maxRating!)
      return "#00b600"
    return "#FFD700"
  }

  async componentDidMount() {
    const solution = this.getTheLastAssessedSolution(this.props.solutions!)
    if (solution === null){
      this.setState({
        isLoaded: true
      })
      return
    }
    this.setState({
      color: this.getCellBackgroundColor(solution.rating, solution.maxRating, solution.state),
      isLoaded: true,
      result: solution.rating!
    })
  }
}

