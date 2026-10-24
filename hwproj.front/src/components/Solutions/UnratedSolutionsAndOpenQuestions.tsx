import {AccountDataDto, QuestionsSummary, SolutionPreviewView, UnratedSolutionPreviews} from "@/api";
import * as React from "react";
import {NavLink} from "react-router-dom";
import {
    Box,
    Divider,
    Grid,
    Typography,
    Chip, Autocomplete, Stack,
    ListItemButton,
    Paper
} from "@mui/material";
import {EditOutlined, FactCheckOutlined, HelpOutline} from "@mui/icons-material";
import {UserInitialsAvatar} from "@/components/Common/UserInitialsAvatar";
import {FC, Fragment, ReactNode, useEffect, useState} from "react";
import Utils from "../../services/Utils";
import {RatingStorage} from "../Storages/RatingStorage";
import TextField from "@mui/material/TextField";
import ApiSingleton from "@/api/ApiSingleton";
import {TestTip} from "@/components/Common/HomeworkTags";
import {PanelConnector} from "@/components/Common/PanelConnector";

interface IUnratedSolutionsProps {
    unratedSolutionsPreviews: UnratedSolutionPreviews
}

interface IFiltersState {
    coursesFilter: string,
    homeworksFilter: string,
    tasksFilter: string,
    studentsFilter: string
    courses: string[],
    homeworks: string[],
    tasks: string[],
    students: string[]
}

const solutionPlurals = ["решение", "решения", "решений"]
const taskPlurals = ["задача содержит", "задачи содержат", "задач содержат"]

type FilterTitleName = "coursesFilter" | "homeworksFilter" | "tasksFilter" | "studentsFilter"

const panelBorderColor = "#c4cad2"
const sectionBorderColor = "#a8b0d8"
const sectionHeaderColor = "#3f51b5"
const sectionHeaderBackground = "#f3f4fb"
const emptyStateBorderColor = "#d7dbe0"

// Фильтры стоят в шапке карточки и должны читаться как её продолжение, а не как поля ввода поверх неё:
// рамок нет вообще, подчёркивание проступает под курсором, а у выбранного фильтра остаётся видимым —
// так сразу понятно, какими срезами сузили список, и в карточке не появляется второго контура
const filterSx = (active: boolean) => ({
    "& .MuiInputLabel-root": {
        color: "#7d86b8",
        "&.Mui-focused": {color: sectionHeaderColor},
    },
    "& .MuiInput-root": {
        color: "#212529",
        "& .MuiInput-input": {fontSize: "0.875rem"},
        "&:before": {borderBottomColor: active ? sectionHeaderColor : "transparent"},
        "&:hover:not(.Mui-disabled, .Mui-error):before": {borderBottomColor: sectionBorderColor},
        "& .MuiSvgIcon-root": {color: "#8a93bd"},
    },
})

const panelSx = {
    borderRadius: "14px",
    borderColor: panelBorderColor,
    overflow: "hidden",
}

const rowSx = {
    px: 2,
    py: 1.5,
    alignItems: "flex-start",
    gap: 1.5,
    color: "#212529",
    textDecoration: "none",
    // Bootstrap подчёркивает и перекрашивает ссылки на hover — строка списка не должна вести себя как текстовая ссылка
    "&:hover, &:focus": {color: "#212529", textDecoration: "none"},
}

/**
 * Карточка раздела: заголовок с иконкой, справа необязательное действие, ниже содержимое.
 * `toolbar` — продолжение заголовка на той же подложке (например, фильтры). Когда он есть,
 * границей содержимого работает край подложки, и разделитель уже не нужен.
 */
const SectionPanel: FC<{ icon: ReactNode, title: string, action?: ReactNode, toolbar?: ReactNode, children: ReactNode }> =
    ({icon, title, action, toolbar, children}) => (
        <Paper variant={"outlined"} sx={{...panelSx, borderColor: sectionBorderColor}}>
            <Box sx={{color: sectionHeaderColor, backgroundColor: sectionHeaderBackground}}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{px: 2, py: 1.25}}>
                    {icon}
                    <Typography variant={"body2"} sx={{fontWeight: 500, flexGrow: 1, minWidth: 0}}>{title}</Typography>
                    {action}
                </Stack>
                {toolbar}
            </Box>
            {toolbar ? null : <Divider/>}
            {children}
        </Paper>
    )

const SolutionRow: FC<{ solution: SolutionPreviewView }> = ({solution}) => {
    const student = solution.student!
    const studentName = `${student.surname} ${student.name}`
    const date = Utils.renderReadableDate(solution.publicationDate!)

    return (
        <ListItemButton
            component={NavLink}
            to={`/task/${solution.taskId}/${student.userId}`}
            sx={rowSx}
        >
            <UserInitialsAvatar user={student}/>
            <Box sx={{flexGrow: 1, minWidth: 0}}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} flexWrap={"wrap"} sx={{rowGap: 0.5}}>
                    <Typography component={"span"} sx={{fontSize: "1rem", fontWeight: 600}}>
                        {studentName}
                    </Typography>
                    <Typography
                        component={"span"}
                        sx={{fontSize: "1rem", color: solution.isTest ? "primary.main" : "inherit"}}
                    >
                        {solution.taskTitle}
                        {solution.isTest && <TestTip/>}
                    </Typography>
                    {solution.isFirstTry && solution.sentAfterDeadline &&
                        <Chip color="error" label="Дедлайн" size={"small"}/>}
                    {!solution.isFirstTry &&
                        <Chip color="secondary" label="Повторно" size={"small"}/>}
                    {solution.groupId &&
                        <Chip color="primary" label="Командное" size={"small"}/>}
                    {solution.isCourseCompleted &&
                        <Chip label="Курс завершён" size={"small"} sx={{color: "GrayText"}}/>}
                </Stack>
                <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                    <Box component={"span"} sx={{display: {xs: "inline", sm: "none"}}}>{date} · </Box>
                    {solution.courseTitle} • {solution.homeworkTitle}
                </Typography>
            </Box>
            <Typography
                variant={"caption"}
                sx={{
                    display: {xs: "none", sm: "block"},
                    flexShrink: 0,
                    pt: 0.5,
                    whiteSpace: "nowrap",
                    color: "text.secondary",
                }}
            >
                {date}
            </Typography>
        </ListItemButton>
    )
}

const EmptyState: FC<{ text: string, inset?: boolean }> = ({text, inset}) => (
    <Box
        sx={{
            py: inset ? 5 : 6,
            textAlign: "center",
            color: "text.secondary",
            ...(inset ? {} : {border: `1px dashed ${emptyStateBorderColor}`, borderRadius: "14px"}),
        }}
    >
        <Typography variant={"body1"}>{text}</Typography>
    </Box>
)

const UnratedSolutionsAndOpenQuestions: FC<IUnratedSolutionsProps> = (props) => {
    const [openQuestions, setOpenQuestions] = useState<QuestionsSummary[]>([])
    useEffect(() => {
        ApiSingleton.tasksApi.tasksGetOpenQuestions().then(res => setOpenQuestions(res))
    }, []);

    const unratedSolutions = props.unratedSolutionsPreviews.unratedSolutions!
    const semiRatedSolutions = unratedSolutions.filter(x => RatingStorage.tryGet({
        solutionId: x.solutionId,
        taskId: x.taskId!,
        studentId: x.student!.userId!
    }) != null)
    const renderStudent = (s: AccountDataDto) => `${s.surname} ${s.name}`
    const prepareStrings = (arr: string[]) => [...new Set(arr)].sort()
    const courses = new Set(unratedSolutions.map(s => s.courseTitle!))
    const homeworks = new Set(unratedSolutions.map(s => s.homeworkTitle!))
    const tasks = new Set(unratedSolutions.map(s => s.taskTitle!))
    const students = new Set(unratedSolutions.map(t => renderStudent(t.student!)))
    const getFilterSetting = (key: FilterTitleName) => {
        const filterValue = localStorage.getItem(key)
        if (!filterValue) {
            return ""
        }
        if (key === "coursesFilter" && !courses.has(filterValue)) {
            localStorage.removeItem("homeworksFilter")
            localStorage.removeItem("tasksFilter")
            localStorage.removeItem("studentsFilter")
        } else if (key === "homeworksFilter" && !homeworks.has(filterValue)) {
            localStorage.removeItem("tasksFilter")
            localStorage.removeItem("studentsFilter")
        } else if (key === "tasksFilter" && !tasks.has(filterValue)) {
            localStorage.removeItem("studentsFilter")
        } else if (key === "studentsFilter" && !students.has(filterValue)) {
        } else {
            return filterValue
        }
        localStorage.removeItem(key)
        return ""
    }

    const coursesFilter = getFilterSetting("coursesFilter")
    const homeworksFilter = getFilterSetting("homeworksFilter")
    const tasksFilter = getFilterSetting("tasksFilter")
    const studentsFilter = getFilterSetting("studentsFilter")

    const filteredHomeworks = coursesFilter === "" ? unratedSolutions : unratedSolutions.filter(t => t.courseTitle === coursesFilter)
    const filteredTasks = homeworksFilter === "" ? filteredHomeworks : filteredHomeworks.filter(t => t.homeworkTitle === homeworksFilter)
    const filteredStudents = tasksFilter === "" ? filteredTasks : filteredTasks.filter(t => t.taskTitle === tasksFilter)

    const [filtersState, setFiltersState] = useState<IFiltersState>({
        coursesFilter: coursesFilter,
        homeworksFilter: homeworksFilter,
        tasksFilter: tasksFilter,
        studentsFilter: studentsFilter,
        courses: [...courses].sort(),
        homeworks: prepareStrings(filteredHomeworks.map(t => t.homeworkTitle!)),
        tasks: prepareStrings(filteredTasks.map(t => t.taskTitle!)),
        students: prepareStrings(filteredStudents.map(t => renderStudent(t.student!)))
    })

    const filteredUnratedSolutions = unratedSolutions
        .filter(t => !filtersState.coursesFilter || t.courseTitle === filtersState.coursesFilter)
        .filter(t => !filtersState.homeworksFilter || t.homeworkTitle === filtersState.homeworksFilter)
        .filter(t => !filtersState.tasksFilter || t.taskTitle === filtersState.tasksFilter)
        .filter(t => !filtersState.studentsFilter || renderStudent(t.student!) === filtersState.studentsFilter)

    const handleFilterChange = (filterName: FilterTitleName, value: string) => {
        let courseFilter = filtersState.coursesFilter
        let homeworkFilter = filtersState.homeworksFilter
        let taskFilter = filtersState.tasksFilter
        let studentFilter = filtersState.studentsFilter

        if (filterName === "coursesFilter") {
            courseFilter = value
            homeworkFilter = ""
            taskFilter = ""
            studentFilter = ""
        } else if (filterName === "homeworksFilter") {
            homeworkFilter = value
            taskFilter = ""
            studentFilter = ""
        } else if (filterName === "tasksFilter") {
            taskFilter = value
            studentFilter = ""
        } else if (filterName === "studentsFilter") {
            studentFilter = value
        }

        const filteredHomeworks = courseFilter === "" ? unratedSolutions : unratedSolutions.filter(t => t.courseTitle === courseFilter)
        const filteredTasks = homeworkFilter === "" ? filteredHomeworks : filteredHomeworks.filter(t => t.homeworkTitle === homeworkFilter)
        const filteredStudents = taskFilter === "" ? filteredTasks : filteredTasks.filter(t => t.taskTitle === taskFilter)
        localStorage.setItem("coursesFilter", courseFilter)
        localStorage.setItem("homeworksFilter", homeworkFilter)
        localStorage.setItem("tasksFilter", taskFilter)
        localStorage.setItem("studentsFilter", studentFilter)
        setFiltersState(prevState => ({
            ...prevState,
            coursesFilter: courseFilter,
            homeworksFilter: homeworkFilter,
            tasksFilter: taskFilter,
            studentsFilter: studentFilter,
            homeworks: prepareStrings(filteredHomeworks.map(t => t.homeworkTitle!)),
            tasks: prepareStrings(filteredTasks.map(t => t.taskTitle!)),
            students: prepareStrings(filteredStudents.map(t => renderStudent(t.student!)))
        }))
    }

    const renderSelect = (name: string, filterName: FilterTitleName, value: string, options: string[]) => {
        return (<Autocomplete
            fullWidth
            size={"small"}
            options={options}
            value={value}
            sx={filterSx(value !== "")}
            renderInput={params => <TextField
                {...params}
                fullWidth
                variant={"standard"}
                label={name}
                placeholder={"Все"}
                InputLabelProps={{shrink: true}}
            />}
            key={name}
            onChange={(_, newValue) => handleFilterChange(filterName, newValue || "")}
        />)
    }

    // Сколько решений ждёт проверки, а под фильтром — сколько из них осталось видно
    const unratedTitle = filteredUnratedSolutions.length < unratedSolutions.length
        ? `${filteredUnratedSolutions.length} из ${unratedSolutions.length} ${Utils.pluralizeHelper(solutionPlurals, unratedSolutions.length)} по фильтру`
        : `${unratedSolutions.length} ${Utils.pluralizeHelper(solutionPlurals, unratedSolutions.length)} на проверке`

    const renderFilters = () => (
        <Box sx={{px: 2, pt: 0.5, pb: 1.5}}>
            <Grid container columnSpacing={2.5} rowSpacing={0.5}>
                <Grid item xs={12} sm={6} lg={3}>
                    {renderSelect("Курс", "coursesFilter", filtersState.coursesFilter, filtersState.courses)}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    {renderSelect("Задание", "homeworksFilter", filtersState.homeworksFilter, filtersState.homeworks)}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    {renderSelect("Задача", "tasksFilter", filtersState.tasksFilter, filtersState.tasks)}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    {renderSelect("Студент", "studentsFilter", filtersState.studentsFilter, filtersState.students)}
                </Grid>
            </Grid>
        </Box>
    )

    const renderSolutions = (solutions: SolutionPreviewView[]) => (
        <Stack divider={<Divider/>}>
            {solutions.map((solution, i) => <SolutionRow key={i} solution={solution}/>)}
        </Stack>
    )

    // Вопросы, незаконченные проверки, фильтры и список решений — одна ветка работы преподавателя,
    // поэтому карточки соединяем перемычками; зазор между ними задаёт сама перемычка
    const panels: { key: string, color: string, node: ReactNode }[] = []

    if (openQuestions.length > 0) panels.push({
        key: "questions",
        color: sectionBorderColor,
        node: <SectionPanel
            icon={<HelpOutline fontSize={"small"}/>}
            title={`${openQuestions.length} ${Utils.pluralizeHelper(taskPlurals, openQuestions.length)} вопросы от студентов`}
        >
            <Stack divider={<Divider/>}>
                {openQuestions.sort((a, b) => b.count! - a.count!).map((taskQuestions, i) => (
                    <ListItemButton
                        key={"question" + i}
                        component={NavLink}
                        to={`/task/${taskQuestions.taskId}/undefined`}
                        sx={{...rowSx, alignItems: "center"}}
                    >
                        <Typography sx={{flexGrow: 1, minWidth: 0}}>
                            {taskQuestions.taskTitle}
                        </Typography>
                        <Chip label={taskQuestions.count} size={"small"} color={"primary"}
                              sx={{flexShrink: 0}}/>
                    </ListItemButton>
                ))}
            </Stack>
        </SectionPanel>
    })

    if (semiRatedSolutions.length > 0) panels.push({
        key: "semiRated",
        color: sectionBorderColor,
        node: <SectionPanel
            icon={<EditOutlined fontSize={"small"}/>}
            title={`${semiRatedSolutions.length} ${Utils.pluralizeHelper(solutionPlurals, semiRatedSolutions.length)} с незаконченной проверкой`}
        >
            {renderSolutions(semiRatedSolutions)}
        </SectionPanel>
    })

    panels.push(unratedSolutions.length === 0
        ? {key: "allRated", color: emptyStateBorderColor, node: <EmptyState text={"Все решения проверены."}/>}
        : {
            key: "unrated",
            color: sectionBorderColor,
            node: <SectionPanel
                icon={<FactCheckOutlined fontSize={"small"}/>}
                title={unratedTitle}
                toolbar={renderFilters()}
            >
                {filteredUnratedSolutions.length === 0
                    ? <EmptyState inset text={"По заданному фильтру ничего не найдено."}/>
                    : renderSolutions(filteredUnratedSolutions)}
            </SectionPanel>
        })

    return (
        <Stack>
            {panels.map(({key, color, node}, i) => (
                <Fragment key={key}>
                    {i > 0 && <PanelConnector from={panels[i - 1].color} to={color}/>}
                    {node}
                </Fragment>
            ))}
        </Stack>
    )
}

export default UnratedSolutionsAndOpenQuestions;
