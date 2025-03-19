import React, {useEffect, useState} from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {useNavigate, useParams} from 'react-router-dom';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import {Alert, Button, Chip, Typography} from "@mui/material";
import {grey} from "@material-ui/core/colors";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {BonusTag, DefaultTags, TestTag} from "../Common/HomeworkTags";
import Lodash from "lodash"

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface IStudentStatsState {
    searched: string
}

const greyBorder = grey[300]

const StudentStats: React.FC<IStudentStatsProps> = (props) => {
    const [state, setSearched] = useState<IStudentStatsState>({
        searched: ""
    });
    const {courseId} = useParams();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/statistics/${courseId}/charts`)
    }

    const {searched} = state

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.altKey) return
            if (searched && event.key === "Escape") {
                setSearched({searched: ""});
            } else if (searched && event.key === "Backspace") {
                setSearched({searched: searched.slice(0, -1)})
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Zа-яА-Я\s]/i)
            ) {
                setSearched({searched: searched + event.key})
            }
        };

        document.addEventListener('keydown', keyDownHandler);
        return () => document.removeEventListener('keydown', keyDownHandler);
    }, [searched]);

    const homeworks = props.homeworks.filter(h => h.tasks && h.tasks.length > 0)
    const solutions = searched
        ? props.solutions.filter(cm => (cm.surname + " " + cm.name).toLowerCase().includes(searched.toLowerCase()))
        : props.solutions

    const borderStyle = `1px solid ${greyBorder}`
    const testHomeworkStyle = {
        backgroundColor: "#3f51b5",
        borderLeftColor: "#3f51b5",
        color: "white",
    }

    const homeworkStyles = (homeworks: HomeworkViewModel[], idx: number): React.CSSProperties | undefined => {
        if (homeworks[idx].tags?.includes(TestTag))
            return testHomeworkStyle
        if (idx !== 0 && homeworks[idx - 1].tags?.includes(TestTag))
            return {borderLeftColor: testHomeworkStyle.borderLeftColor}
        return undefined
    }

    //TODO: Bonus tag?
    const groupTestsByTags = (homeworks: HomeworkViewModel[]) =>
        Lodash(homeworks.filter(h => h.tags!.includes(TestTag)))
            .groupBy((h: HomeworkViewModel) => {
                const key = h.tags!.find(t => !DefaultTags.includes(t))
                return key || h.id!.toString();
            })
            .values()
            .value();

    const homeworksMaxSum = homeworks.filter(h => !h.tags!.includes(BonusTag))
        .filter(h => !h.tags!.includes(TestTag))
        .flatMap(homework => homework.tasks)
        .reduce((sum, task) => {
            return sum + (task!.maxRating || 0);
        }, 0)

    const testGroups = groupTestsByTags(homeworks)

    const testsMaxSum = testGroups
        .map(h => h[0])
        .flatMap(homework => homework.tasks)
        .reduce((sum, task) => sum + (task!.maxRating || 0), 0)

    const hasHomeworks = homeworksMaxSum > 0
    const hasTests = testsMaxSum > 0

    return (
        <div>
            {searched &&
                <Alert style={{marginBottom: 5}} severity="info"><b>Поиск: </b>
                    {searched.replaceAll(" ", "·")}
                </Alert>}
            <TableContainer style={{maxHeight: "100vh", marginBottom: -50}}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{zIndex: -4, color: ""}} align="center"
                                       padding="none"
                                       component="td">
                            </TableCell>
                            {(hasHomeworks || hasTests) && <TableCell
                                padding="checkbox"
                                colSpan={(hasHomeworks ? 1 : 0) + (hasTests ? 1 : 0)}
                                align="center"
                                component="td"
                                style={{
                                    zIndex: -5,
                                    borderLeft: borderStyle,
                                }}
                            >
                                Итоговые баллы
                            </TableCell>}
                            {homeworks.map((homework, idx) =>
                                <TableCell
                                    padding="checkbox"
                                    component="td"
                                    align="center"
                                    style={{
                                        zIndex: -5,
                                        borderLeft: borderStyle,
                                        ...homeworkStyles(homeworks, idx)
                                    }}
                                    colSpan={homework.tasks!.length}
                                >
                                    {homework.title}
                                </TableCell>)}
                        </TableRow>
                        <TableRow>
                            <TableCell style={{zIndex: 10}}
                                       component="td">
                                {solutions.length > 0 &&
                                    <Button startIcon={<ShowChartIcon/>} color="primary"
                                            style={{backgroundColor: 'transparent'}} size='medium'
                                            onClick={handleClick}>
                                        Графики
                                    </Button>
                                }
                            </TableCell>
                            {hasHomeworks && <TableCell padding="checkbox" component="td" align="center"
                                                        style={{
                                                            minWidth: 70,
                                                            paddingLeft: 5,
                                                            paddingRight: 5,
                                                            borderLeft: borderStyle,
                                                        }}>
                                ДЗ ({homeworksMaxSum})
                            </TableCell>}
                            {hasTests && <TableCell padding="checkbox" component="td" align="center"
                                                    style={{
                                                        minWidth: 70,
                                                        paddingLeft: 5,
                                                        paddingRight: 5,
                                                        borderLeft: borderStyle,
                                                    }}>
                                КР ({testsMaxSum})
                            </TableCell>}
                            {homeworks.map((homework, idx) =>
                                homework.tasks!.map((task, i) => (
                                    <TableCell padding="checkbox" component="td" align="center"
                                               style={{
                                                   minWidth: "75px",
                                                   paddingLeft: 10,
                                                   paddingRight: 10,
                                                   borderLeft: i === 0 ? borderStyle : "",
                                                   ...homeworkStyles(homeworks, idx)
                                               }}
                                               key={task.id}>
                                        {task.title}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions.map((cm, index) => {
                            const homeworksSum = homeworks
                                .filter(h => !h.tags!.includes(TestTag))
                                .flatMap(homework =>
                                    solutions
                                        .find(s => s.id === cm.id)?.homeworks!
                                        .find(h => h.id === homework.id)?.tasks!
                                        .flatMap(t => StudentStatsUtils.calculateLastRatedSolution(t.solution || [])?.rating || 0) || 0
                                )
                                .reduce((sum, rating) => sum + rating, 0)

                            const testsSum = testGroups
                                .map(group => {
                                    const testRatings = group
                                        .map(homework =>
                                            solutions
                                                .find(s => s.id === cm.id)?.homeworks!
                                                .find(h => h.id === homework.id)?.tasks!
                                                .flatMap(t => StudentStatsUtils.calculateLastRatedSolution(t.solution || [])?.rating || 0)!
                                        )
                                    return testRatings[0]!
                                        .map((_, columnId) => testRatings.map(row => row[columnId]))
                                        .map(taskRatings => Math.max(...taskRatings))
                                })
                                .flat()
                                .reduce((sum, rating) => sum + rating, 0)

                            return (
                                <TableRow key={index} hover style={{height: 50}}>
                                    <TableCell
                                        align="left"
                                        padding="checkbox"
                                        style={{paddingRight: 10, paddingLeft: 10}}
                                        component="td"
                                        scope="row"
                                        variant={"head"}
                                    >
                                        {cm.surname} {cm.name}
                                        <Typography
                                            style={{
                                                color: "GrayText",
                                                fontSize: "12px",
                                                lineHeight: '1.2'
                                            }}
                                        >
                                            {cm.reviewers && cm.reviewers
                                                .filter(r => r.userId !== props.userId)
                                                .map(r => `${r.name} ${r.surname}`)
                                                .join(', ')}
                                        </Typography>
                                    </TableCell>
                                    {hasHomeworks && <TableCell
                                        align="center"
                                        padding="none"
                                        style={{
                                            borderLeft: borderStyle,
                                            backgroundColor: "white"
                                        }}
                                        component="td"
                                        scope="row"
                                        variant={"body"}
                                    >
                                        <Chip size={"small"}
                                              style={{
                                                  backgroundColor: StudentStatsUtils.getRatingColor(homeworksSum, homeworksMaxSum),
                                                  fontSize: 16
                                              }}
                                              label={homeworksSum}/>
                                    </TableCell>}
                                    {hasTests && <TableCell
                                        align="center"
                                        padding="none"
                                        style={{
                                            borderLeft: borderStyle,
                                            backgroundColor: "white"
                                        }}
                                        component="td"
                                        scope="row"
                                        variant={"body"}
                                    >
                                        <Chip size={"small"}
                                              style={{
                                                  backgroundColor: StudentStatsUtils.getRatingColor(testsSum, testsMaxSum),
                                                  fontSize: 16
                                              }}
                                              label={testsSum}/>
                                    </TableCell>}
                                    {homeworks.map((homework, idx) =>
                                        homework.tasks!.map((task, i) => {
                                            const additionalStyles = i === 0 && homeworkStyles(homeworks, idx)
                                            return <StudentStatsCell
                                                solutions={solutions
                                                    .find(s => s.id === cm.id)!.homeworks!
                                                    .find(h => h.id === homework.id)!.tasks!
                                                    .find(t => t.id === task.id)!.solution!}
                                                userId={props.userId}
                                                forMentor={props.isMentor}
                                                studentId={String(cm.id)}
                                                taskId={task.id!}
                                                taskMaxRating={task.maxRating!}
                                                {...additionalStyles}/>;
                                        })
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default StudentStats;
