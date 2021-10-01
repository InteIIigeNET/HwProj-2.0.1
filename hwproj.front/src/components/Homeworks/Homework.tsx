import * as React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Typography } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ReactMarkdown from 'react-markdown';
import { HomeworkViewModel } from "../../api";
import AddTask from'../Tasks/AddTask'
import HomeworkTasks from '../Tasks/HomeworkTasks'
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from '../../api/ApiSingleton';

interface IHomeworkProps {
  homework: HomeworkViewModel,
  forMentor: boolean,
  forStudent: boolean,
  onDeleteClick: () => void
}

interface IHomeworkState {
  createTask: boolean
}

export default class Homework extends React.Component<IHomeworkProps, IHomeworkState> {
  constructor(props : IHomeworkProps) {
    super(props);
    this.state = {
        createTask: false
    };
  }

  public render() {
    let homeworkDateString = new Date(this.props.homework.date!.toString()).toLocaleDateString("ru-RU");
    return (
        <div style={{width: '100%'}}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: "#c6cceb"}}
                >
                    <div className={classes.tools}>
                        <div className={classes.tool}>
                            <Typography style={{fontSize: '18px'}}>
                                Домашнее задание {props.homework.title}
                            </Typography>
                        </div>
                        <div>
                            <Typography>
                                {homeworkDateString}
                            </Typography>
                        </div>
                        <div>
                            {props.forMentor &&
                            <IconButton aria-label="Delete" onClick={openDialogDeleteHomework}>
                                <DeleteIcon fontSize="small"/>
                            </IconButton>
                            }
                        </div>
                        <div>
                            {props.forMentor &&
                            <RouterLink to={'/homework/' + props.homework.id!.toString() + '/edit'}>
                                <EditIcon fontSize="small"/>
                            </RouterLink>
                            }
                        </div>
                        <div>
                            {props.forMentor && deferredHomework!.length > 0 &&
                                <Typography>
                                    <HourglassEmpty/>
                                    {deferredHomework!.length}
                                </Typography>
                            }
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{width: '100%'}}>
                        <ReactMarkdown source={props.homework.description}/>
                        {(props.forMentor && homeworkState.createTask) &&
                        <div style={{width: '100%'}}>
                            <HomeworkTasks
                                onDelete={() => props.onDeleteClick()}
                                tasks={props.homework.tasks!}
                                forStudent={props.forStudent}
                                forMentor={props.forMentor}
                            />
                            <AddTask
                                id={props.homework.id!}
                                onAdding={() => window.location.reload()}
                                onCancel={() => setHomeworkState({
                                    createTask: false
                                })}
                                update={() => props.onDeleteClick()}
                            />
                        </div>
                        }
                        {(props.forMentor && !homeworkState.createTask) &&
                        <div style={{width: '100%'}}>
                            <HomeworkTasks
                                onDelete={() => props.onDeleteClick()}
                                tasks={props.homework.tasks!}
                                forStudent={props.forStudent}
                                forMentor={props.forMentor}
                            />
                            <Button
                                style={{marginTop: "10px"}}
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setHomeworkState({
                                        createTask: true
                                    })
                                }}
                            >
                                Добавить задачу
                            </Button>
                        </div>
                        }
                        {!props.forMentor &&
                        <HomeworkTasks
                            onDelete={() => props.onDeleteClick()}
                            tasks={props.homework.tasks!}
                            forStudent={props.forStudent}
                            forMentor={props.forMentor}
                        />
                        }
                    </div>
                </AccordionDetails>
            </Accordion>
            <DeletionConfirmation
                onCancel={closeDialogDeleteHomework}
                onSubmit={deleteHomework}
                isOpen={isOpenDialogDeleteHomework}
                dialogTitle={'Удаление домашнего задания'}
                dialogContentText={`Вы точно хотите удалить домашнее задание "${props.homework.title}"?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </div>
    )
  }

  deleteHomework = async () => {
    await ApiSingleton.homeworksApi.apiHomeworksDeleteByHomeworkIdDelete(this.props.homework.id!)
    this.props.onDeleteClick()
  }
}