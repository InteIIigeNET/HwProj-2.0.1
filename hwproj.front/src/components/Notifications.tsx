import * as React from "react";
import {FC, ReactElement, useEffect, useMemo, useState} from "react";
import {Box, Button, Chip, Divider, IconButton, Paper, Stack, Tooltip, Typography} from "@mui/material";
import ApiSingleton from "api/ApiSingleton";
import {CategorizedNotifications, CategoryState, NotificationViewModel} from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import NotificationSettings from "./NotificationSettings";
import Utils from "../services/Utils";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

// Оформление согласовано с редизайном страницы курса: те же радиусы, границы и мягкие плашки
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const headerSx = {
    px: {xs: 1.5, sm: 2},
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const headerChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 600},
}

// На заливке шапки кнопка светлая, иначе тонировка акцентом слилась бы с фоном
const headerButtonSx = {
    flexShrink: 0,
    borderRadius: "10px",
    textTransform: "none" as const,
    fontSize: "0.8125rem",
    fontWeight: 500,
    px: {xs: 1, sm: 1.5},
    minWidth: 0,
    color: "#3f51b5",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(63, 81, 181, 0.16)",
    transition: "background-color .15s, border-color .15s",
    "& .MuiButton-startIcon": {mr: {xs: 0, sm: 0.75}, ml: 0},
    "&:hover": {backgroundColor: "#fff", borderColor: "rgba(63, 81, 181, 0.32)"},
    "&.Mui-disabled": {color: "#aeb4c2", backgroundColor: "rgba(255, 255, 255, 0.5)", border: "1px solid #e6e8ec"},
}

const headerIconButtonSx = {
    flexShrink: 0,
    color: "#3f51b5",
    border: "1px solid rgba(63, 81, 181, 0.16)",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    "&:hover": {backgroundColor: "#fff"},
}

const filterBarSx = {
    px: {xs: 1.5, sm: 2},
    py: 1.25,
    backgroundColor: "#fbfcfe",
}

// Режим просмотра — один переключатель на два положения, а не две отдельные кнопки:
// выбранное положение выезжает белой таблеткой на серой дорожке
const segmentTrackSx = {
    display: "inline-flex",
    gap: 0.25,
    p: 0.25,
    borderRadius: "999px",
    backgroundColor: "#eaedf3",
}

const segmentSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.25,
    py: 0.375,
    border: 0,
    borderRadius: "999px",
    font: "inherit",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.4,
    cursor: "pointer",
    color: "text.secondary",
    backgroundColor: "transparent",
    transition: "background-color .2s, color .2s, box-shadow .2s",
    "&:hover": {color: "#3f51b5"},
    "&:focus-visible": {outline: "2px solid rgba(63, 81, 181, 0.4)", outlineOffset: "1px"},
}

const activeSegmentSx = {
    ...segmentSx,
    fontWeight: 600,
    color: "#3f51b5",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.14)",
}

// Счётчик внутри фильтра — полупрозрачная плашка: она одинаково читается и на заливке, и без неё
const filterCountSx = {
    ml: 0.625,
    px: 0.5,
    minWidth: 18,
    height: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    fontSize: "0.6875rem",
    fontWeight: 700,
    backgroundColor: "rgba(0, 0, 0, 0.07)",
}

const segmentCountSx = {...filterCountSx, ml: 0, mr: -0.25}

// Включённая категория заливается своим цветом — тем же, что у её иконки в ленте,
// поэтому по фильтрам видно, какого цвета уведомления останутся. Выключенная — только контур
const categoryChipSx = (tone: CategoryTone, isSelected: boolean) => ({
    height: 28,
    cursor: "pointer",
    transition: "background-color .2s, color .2s, box-shadow .2s",
    "& .MuiChip-label": {px: 1, fontSize: "0.8125rem", fontWeight: isSelected ? 600 : 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 15, color: "inherit"},
    ...(isSelected
        ? {
            color: tone.color,
            backgroundColor: tone.background,
            boxShadow: `inset 0 0 0 1px ${tone.border}`,
        }
        : {
            color: "#8b929f",
            backgroundColor: "transparent",
            boxShadow: "inset 0 0 0 1px #e0e3ea",
            "&:hover": {
                color: tone.color,
                backgroundColor: tone.background,
                boxShadow: `inset 0 0 0 1px ${tone.border}`,
            },
        }),
})

// Подпись дня: мелкие капсы читаются как служебный текст и не спорят с самими уведомлениями
const dayLabelSx = {
    px: {xs: 1.5, sm: 2},
    py: 0.75,
    display: "block",
    backgroundColor: "#fafbfe",
    color: "text.secondary",
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
}

const rowSx = {
    px: {xs: 1.5, sm: 2},
    py: 1.5,
    alignItems: "flex-start" as const,
    transition: "background-color .15s",
    "&:hover .MuiIconButton-root": {opacity: 1},
}

// Непрочитанное уведомление отмечено полосой у края и лёгкой заливкой: видно в потоке,
// но не выглядит предупреждением. У прочитанных полоса прозрачная, чтобы текст не съезжал
const unreadRowSx = {
    borderLeft: "3px solid #3f51b5",
    backgroundColor: "#f6f8ff",
    "&:hover": {backgroundColor: "#eff3ff"},
}

const readRowSx = {
    borderLeft: "3px solid transparent",
    "&:hover": {backgroundColor: "#fafbfe"},
}

// Текст уведомления приходит с сервера как HTML: приводим ссылки и выделения к стилю приложения,
// а pre-line сохраняет переносы строк, которые сервер вставляет вместе с деталями события
const bodySx = {
    fontSize: "0.9375rem",
    lineHeight: 1.45,
    color: "#2f3542",
    whiteSpace: "pre-line" as const,
    overflowWrap: "anywhere" as const,
    "& a": {
        color: "#3f51b5",
        fontWeight: 500,
        textDecoration: "none",
        "&:hover": {textDecoration: "underline"},
    },
    "& b": {fontWeight: 600},
    "& p": {m: 0},
}

const categoryTileSx = (tone: CategoryTone) => ({
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tone.background,
    color: tone.color,
})

// Действие появляется при наведении на строку, но остаётся доступным с клавиатуры
const rowActionSx = {
    flexShrink: 0,
    color: "#3f51b5",
    opacity: {xs: 1, sm: 0.35},
    transition: "opacity .15s",
    "&:focus-visible": {opacity: 1},
}

type CategoryTone = {
    background: string
    color: string
    border: string
}

type NotificationCategory = {
    value: CategoryState
    label: string
    icon: ReactElement
    tone: CategoryTone
}

// Категории приходят с сервера числами (Profile, Courses, Homeworks): свой цвет и иконка у каждой
// позволяют разобрать поток уведомлений, не вчитываясь в текст
const categories: NotificationCategory[] = [
    {
        value: CategoryState.NUMBER_1,
        label: "Профиль",
        icon: <PersonOutlineRoundedIcon fontSize={"small"}/>,
        tone: {background: "#f1ecfa", color: "#6b4fa8", border: "rgba(107, 79, 168, 0.24)"},
    },
    {
        value: CategoryState.NUMBER_2,
        label: "Курсы",
        icon: <SchoolOutlinedIcon fontSize={"small"}/>,
        tone: {background: "#e4e7f6", color: "#3f51b5", border: "rgba(63, 81, 181, 0.24)"},
    },
    {
        value: CategoryState.NUMBER_3,
        label: "Задания",
        icon: <AssignmentOutlinedIcon fontSize={"small"}/>,
        tone: {background: "#e3f2ee", color: "#1f7a6b", border: "rgba(31, 122, 107, 0.24)"},
    },
]

const unknownCategory = {
    label: "Уведомление",
    icon: <NotificationsNoneRoundedIcon fontSize={"small"}/>,
    tone: {background: "#eef0f5", color: "#5a6472", border: "rgba(90, 100, 114, 0.24)"},
}

const getCategory = (category: CategoryState | undefined) =>
    categories.find(c => c.value === category) ?? unknownCategory

const day = 24 * 60 * 60 * 1000

const startOfDay = (date: Date) => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result.getTime()
}

// Поток уведомлений разбит по дням: свежие события ищут по «сегодня», старые — по дате
const getDayLabel = (date: Date) => {
    const daysAgo = Math.round((startOfDay(new Date()) - startOfDay(date)) / day)
    if (daysAgo <= 0) return "Сегодня"
    if (daysAgo === 1) return "Вчера"

    const showYear = date.getFullYear() !== new Date().getFullYear()
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: showYear ? "numeric" : undefined,
    })
}

// Свежие события удобнее мерить в «сколько назад», у старых важнее время: дату уже сказал день
const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    if (diff < 60 * 1000) return "только что"
    if (diff <= 7 * day) return `${Utils.pluralizeDateTime(diff)} назад`
    return date.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})
}

const flatten = (data: CategorizedNotifications[]) => data.flatMap(group =>
    [...(group.notSeenNotifications ?? []), ...(group.seenNotifications ?? [])]
        .map(notification => ({...notification, category: notification.category ?? group.category})))

const Notifications: FC<{
    onMarkAsSeen: () => void;
}> = (props) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [notifications, setNotifications] = useState<NotificationViewModel[]>([])

    const [onlyUnread, setOnlyUnread] = useState(true)
    const [selectedCategories, setSelectedCategories] = useState<CategoryState[]>(categories.map(c => c.value))
    const [isMarking, setIsMarking] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    const isLecturer = ApiSingleton.authService.isLecturer()

    const loadNotifications = async () => {
        const data = await ApiSingleton.notificationsApi.notificationsGet()
        setNotifications(flatten(data ?? []))
        setIsLoaded(true)
    }

    useEffect(() => {
        loadNotifications()
    }, [])

    const unreadCount = notifications.filter(n => !n.hasSeen).length

    // Категория, которой нет в фильтрах, всегда видна: иначе такое уведомление нельзя было бы открыть
    const isCategoryVisible = (category: CategoryState | undefined) =>
        !categories.some(c => c.value === category) || selectedCategories.includes(category!)

    const visibleNotifications = useMemo(() => notifications
            .filter(n => (!onlyUnread || !n.hasSeen) && isCategoryVisible(n.category))
            .sort((first, second) => new Date(second.date!).getTime() - new Date(first.date!).getTime()),
        [notifications, onlyUnread, selectedCategories])

    // Счётчик у фильтра считает то, что фильтр покажет: с учётом режима «только непрочитанные»
    const getCategoryCount = (category: CategoryState) => notifications
        .filter(n => n.category === category && (!onlyUnread || !n.hasSeen)).length

    const notificationsByDay = useMemo(() => {
        const days: { label: string, items: NotificationViewModel[] }[] = []
        visibleNotifications.forEach(notification => {
            const label = getDayLabel(new Date(notification.date!))
            const lastDay = days[days.length - 1]
            if (lastDay?.label === label) lastDay.items.push(notification)
            else days.push({label: label, items: [notification]})
        })
        return days
    }, [visibleNotifications])

    const markAsSeen = async (ids: number[]) => {
        setIsMarking(true)
        try {
            await ApiSingleton.notificationsApi.notificationsMarkAsSeen(ids)
            await props.onMarkAsSeen()
            await loadNotifications()
        } finally {
            setIsMarking(false)
        }
    }

    const toggleCategory = (category: CategoryState) =>
        setSelectedCategories(prevState => prevState.includes(category)
            ? prevState.filter(c => c !== category)
            : [...prevState, category])

    const resetFilters = () => {
        setOnlyUnread(false)
        setSelectedCategories(categories.map(c => c.value))
    }

    const renderFilters = () => (
        <Stack direction={"row"} spacing={0.75} useFlexGap flexWrap={"wrap"} alignItems={"center"} sx={filterBarSx}>
            <Box sx={segmentTrackSx}>
                <Box
                    component={"button"}
                    type={"button"}
                    onClick={() => setOnlyUnread(true)}
                    sx={onlyUnread ? activeSegmentSx : segmentSx}
                >
                    Непрочитанные
                    {unreadCount > 0 && <Box component={"span"} sx={segmentCountSx}>{unreadCount}</Box>}
                </Box>
                <Box
                    component={"button"}
                    type={"button"}
                    onClick={() => setOnlyUnread(false)}
                    sx={onlyUnread ? segmentSx : activeSegmentSx}
                >
                    Все
                </Box>
            </Box>
            <Divider orientation={"vertical"} flexItem sx={{mx: 0.5, my: 0.25}}/>
            {categories.map(category => {
                const count = getCategoryCount(category.value)
                const isSelected = selectedCategories.includes(category.value)
                return <Chip
                    key={category.value}
                    size={"small"}
                    icon={category.icon}
                    label={<Box component={"span"} sx={{display: "inline-flex", alignItems: "center"}}>
                        {category.label}
                        {count > 0 && <Box component={"span"} sx={filterCountSx}>{count}</Box>}
                    </Box>}
                    onClick={() => toggleCategory(category.value)}
                    sx={categoryChipSx(category.tone, isSelected)}/>
            })}
        </Stack>
    )

    const renderEmptyState = () => (
        <Stack alignItems={"center"} spacing={1} sx={{px: 2, pt: 2, pb: 4}}>
            <Box sx={{width: "100%", maxWidth: 420, lineHeight: 0}}>
                <DotLottieReact
                    src="https://lottie.host/53cc9814-9917-415b-bf4e-70d23b0324f1/4MkyAbEh14.lottie"
                    loop
                    autoplay
                />
            </Box>
            <Typography variant={"body2"} sx={{color: "text.secondary", textAlign: "center"}}>
                {notifications.length === 0
                    ? "Уведомлений пока нет"
                    : selectedCategories.length === 0
                        ? "Все категории скрыты фильтром"
                        : onlyUnread
                            ? "Непрочитанных уведомлений нет"
                            : "По выбранным фильтрам ничего нет"}
            </Typography>
            {notifications.length > 0 &&
                <Button size={"small"} onClick={resetFilters} sx={{textTransform: "none", borderRadius: "10px"}}>
                    Показать все уведомления
                </Button>}
        </Stack>
    )

    const renderNotification = (notification: NotificationViewModel) => {
        const category = getCategory(notification.category)
        const date = new Date(notification.date!)
        const isUnread = !notification.hasSeen

        return (
            <Stack
                key={notification.id}
                direction={"row"}
                spacing={1.5}
                sx={{...rowSx, ...(isUnread ? unreadRowSx : readRowSx)}}
            >
                <Tooltip arrow placement={"right"} title={category.label}>
                    <Box sx={categoryTileSx(category.tone)}>{category.icon}</Box>
                </Tooltip>
                <Box sx={{flexGrow: 1, minWidth: 0}}>
                    <Box sx={bodySx}>{parse(notification.body ?? "")}</Box>
                    <Tooltip arrow placement={"right"} title={Utils.renderReadableDate(date)}>
                        <Typography
                            variant={"caption"}
                            sx={{display: "inline-block", mt: 0.5, color: "text.secondary", cursor: "default"}}
                        >
                            {getRelativeTime(date)}
                        </Typography>
                    </Tooltip>
                </Box>
                {isUnread &&
                    <Tooltip arrow placement={"left"} title={"Отметить прочитанным"}>
                        <IconButton
                            size={"small"}
                            disabled={isMarking}
                            onClick={() => markAsSeen([notification.id!])}
                            sx={rowActionSx}
                        >
                            <DoneRoundedIcon fontSize={"small"}/>
                        </IconButton>
                    </Tooltip>}
            </Stack>
        )
    }

    if (!isLoaded) return <div className={"container"}>
        <DotLottieReact
            src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
            loop
            autoplay
        />
    </div>

    return (
        <div className={"container"}>
            <Stack sx={{mt: 2, mb: 2}}>
                <Paper variant={"outlined"} sx={panelSx}>
                    <Stack direction={"row"} alignItems={"center"} spacing={1} sx={headerSx}>
                        <NotificationsNoneRoundedIcon fontSize={"small"}/>
                        <Typography variant={"body2"} sx={{fontWeight: 500}}>Уведомления</Typography>
                        {unreadCount > 0 && <Chip size={"small"} label={unreadCount} sx={headerChipSx}/>}
                        <Box sx={{flexGrow: 1}}/>
                        {unreadCount > 0 &&
                            <Button
                                size={"small"}
                                startIcon={<DoneAllIcon fontSize={"small"}/>}
                                disabled={isMarking}
                                onClick={() => markAsSeen(notifications.filter(n => !n.hasSeen).map(n => n.id!))}
                                sx={headerButtonSx}
                            >
                                <Box component={"span"} sx={{display: {xs: "none", sm: "inline"}}}>
                                    Прочитать все
                                </Box>
                            </Button>}
                        {isLecturer &&
                            <Tooltip arrow title={"Настройки уведомлений"}>
                                <IconButton size={"small"} onClick={() => setShowSettings(true)} sx={headerIconButtonSx}>
                                    <SettingsOutlinedIcon fontSize={"small"}/>
                                </IconButton>
                            </Tooltip>}
                    </Stack>
                    <Divider/>
                    {renderFilters()}
                    <Divider/>
                    {notificationsByDay.length === 0
                        ? renderEmptyState()
                        : <Stack divider={<Divider/>}>
                            {notificationsByDay.map(({label, items}) =>
                                <Box key={label}>
                                    <Typography sx={dayLabelSx}>{label}</Typography>
                                    <Divider/>
                                    <Stack divider={<Divider/>}>{items.map(renderNotification)}</Stack>
                                </Box>)}
                        </Stack>}
                </Paper>
            </Stack>
            {showSettings && <NotificationSettings onClose={() => setShowSettings(false)}/>}
        </div>
    )
}

export default Notifications
