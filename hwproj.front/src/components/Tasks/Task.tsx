import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit'
import ReactMarkdown from 'react-markdown'
import { HomeworkTaskViewModel } from "../../api";
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";
import { Accordion, AccordionDetails, AccordionSummary, Button } from '@material-ui/core';

interface ITaskProp {
  task: HomeworkTaskViewModel,
  forMentor: boolean,
  forStudent: boolean,
  isExpanded: boolean,
  onDeleteClick: () => void,
  showForCourse: boolean
}

export default class Task extends React.Component<ITaskProp, {}> {
  public render() {
    let task = this.props.task;
    let deadlineDate
    if (task.hasDeadline) {
        deadlineDate = new Date(task.deadlineDate!.toString()).toLocaleString("ru-RU")   
    }
    let publicationDate = new Date(task.publicationDate!.toString()).toLocaleString("ru-RU")
    return (
      <div>
        <Accordion expanded={this.props.isExpanded ? true : undefined}>
          <AccordionSummary
            expandIcon={!this.props.isExpanded ? <ExpandMoreIcon /> : undefined}
            aria-controls="panel1a-content"
            id="panel1a-header"
            style={{backgroundColor: "#eceef8"}}
          >
            <Typography variant="subtitle1">
              {this.props.forStudent &&
                <RouterLink to={"/task/" + task.id!.toString()}>
                  {task.title}
                </RouterLink>
              }

              {!this.props.forStudent && task.title}
              {this.props.forMentor && 
                <IconButton aria-label="Delete" onClick={() => this.deleteTask()}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
                
              {this.props.forMentor && 
                <RouterLink to={'/task/' + task.id!.toString() + '/edit'}>
                  <EditIcon fontSize="small" />
                </RouterLink>
              }
            </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <Typography variant="body1">
                  <ReactMarkdown source={task.description} />
                </Typography>

                <Typography>
                    Максимальный балл: {task.maxRating}
                </Typography>
                <Typography>
                  Дата публикации: {publicationDate}
                </Typography>
                {(task.hasDeadline) &&
                  <Typography>
                      Дедлайн: {deadlineDate}
                  </Typography>
                }
                {!task.hasDeadline  &&
                <Typography>
                  Дедлайн: Отсутствует
                </Typography>
                }
                { this.props.showForCourse && this.props.forStudent &&
                  <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => window.location.assign("/task/" + task.id!.toString())}
                  >
                    Отправить решение
                  </Button>
                }
              </Typography>
            </AccordionDetails>
        </Accordion>
      </div>
    );
  }

  deleteTask(): void {
    ApiSingleton.tasksApi.apiTasksDeleteByTaskIdDelete(this.props.task.id!)
      .then(res => this.props.onDeleteClick())
  }
}