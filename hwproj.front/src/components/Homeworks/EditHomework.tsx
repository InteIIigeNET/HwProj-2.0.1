import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect, Link } from "react-router-dom";
import { RouteComponentProps } from "react-router-dom";
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ApiSingleton from "../../api/ApiSingleton";
import ReactMarkdown from "react-markdown";
import { Zoom, Box } from "@material-ui/core";

interface IEditHomeworkState {
  isLoaded: boolean;
  title: string;
  description: string;
  courseId: number;
  courseMentorId: string;
  edited: boolean;
  isPreview: boolean;
}

interface IEditHomeworkProps {
  homeworkId: string;
}

export default class EditHomework extends React.Component<
  RouteComponentProps<IEditHomeworkProps>,
  IEditHomeworkState
> {
  constructor(props: RouteComponentProps<IEditHomeworkProps>) {
    super(props);
    this.state = {
      isLoaded: false,
      title: "",
      description: "",
      courseId: 0,
      courseMentorId: "",
      edited: false,
      isPreview: false,
    };
  }

  public async handleSubmit(e: any) {
    e.preventDefault();

    let homeworkViewModel = {
      title: this.state.title,
      description: this.state.description,
    };
    const token = ApiSingleton.authService.getToken();
    ApiSingleton.homeworksApi
      .apiHomeworksUpdateByHomeworkIdPut(
        +this.props.match.params.homeworkId,
        homeworkViewModel,
        { headers: {"Authorization": `Bearer ${token}`} }
      )
      .then((res) => this.setState({ edited: true }));
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/courses/" + this.state.courseId} />;
    }
    if (this.state.isLoaded) {
      if (
        !ApiSingleton.authService.isLoggedIn() ||
        ApiSingleton.authService.getUserId() != this.state.courseMentorId
      ) {
        return (
          <Typography variant="h6" gutterBottom>
            Только преподаватель может редактировать домашку
          </Typography>
        );
      }
      return (
        <div>
          &nbsp;{" "}
          <Link to={"/courses/" + this.state.courseId.toString()}>
            Назад к курсу
          </Link>
          <br />
          <br />
          <div className="container">
            <Typography variant="h6" gutterBottom>
              Редактировать домашку
            </Typography>
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <TextField
                required
                label="Название домашки"
                variant="outlined"
                margin="normal"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
              <br />
              <TextField
                multiline
                fullWidth
                rows="4"
                //rowsMax="15"
                label="Описание домашки"
                variant="outlined"
                margin="normal"
                value={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <br />
              <Box display="flex" flexDirection="row">
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  type="submit"
                  >
                  Редактировать домашку
                </Button>
                <ClickAwayListener onClickAway={() => this.setState({isPreview: false})}>
                  <div>
                    <Tooltip
                      PopperProps={{
                        disablePortal: true,
                      }}
                      interactive
                      onClose={() => this.setState({isPreview: false})}
                      open={this.state.isPreview}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title={<ReactMarkdown>{this.state.description}</ReactMarkdown>} 
                      placement="bottom" 
                      TransitionComponent={Zoom}
                      >
                      <Button onClick={() => this.setState({isPreview: true})}>Preview</Button>
                    </Tooltip>
                  </div>
                </ClickAwayListener>
              </Box>
            </form>
          </div>
        </div>
      );
    }

    return "";
  }

  componentDidMount() {
    const token = ApiSingleton.authService.getToken();
    ApiSingleton.homeworksApi
      .apiHomeworksGetByHomeworkIdGet(+this.props.match.params.homeworkId, { headers: {"Authorization": `Bearer ${token}`} })
      .then((homework) =>
        ApiSingleton.coursesApi
          .apiCoursesByCourseIdGet(homework.courseId!)
          .then((course) =>
            this.setState({
              isLoaded: true,
              title: homework.title!,
              description: homework.description!,
              courseId: homework.courseId!,
              courseMentorId: course.mentorId!,
            })
          )
      );
  }
}
