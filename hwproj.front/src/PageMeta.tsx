import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

const SITE_URL = "https://hwproj.ru"

const DEFAULT_DESCRIPTION = "HwProj — веб-сервис, который автоматизирует учебный процесс: курсы и задания, " +
    "дедлайны и уведомления, сдача решений, проверка и обратная связь, статистика успеваемости."

interface IPageMeta {
    title: string
    description: string
    // Адрес, который поисковик должен считать основным для страницы:
    // корень сайта — тот же лендинг, поэтому склеиваем их каноническим адресом
    canonicalPath: string
}

// Страницы, открытые для индексации. Список согласован с public/robots.txt
// и public/sitemap.xml — правки нужно вносить во все три места.
const publicPages: Record<string, IPageMeta> = {
    // Для гостя корень редиректит на лендинг (src/AuthLayout.tsx), для авторизованного
    // это личный кабинет — отсюда нейтральный заголовок и canonical на лендинг
    "/": {
        title: "HwProj",
        description: DEFAULT_DESCRIPTION,
        canonicalPath: "/welcome"
    },
    "/welcome": {
        title: "HwProj — сервис для учебных курсов, заданий и проверки решений",
        description: DEFAULT_DESCRIPTION,
        canonicalPath: "/welcome"
    },
    "/login": {
        title: "Вход — HwProj",
        description: "Войдите в HwProj, чтобы работать с курсами, заданиями и решениями.",
        canonicalPath: "/login"
    },
    "/register": {
        title: "Регистрация — HwProj",
        description: "Зарегистрируйтесь в HwProj, чтобы записаться на курс или создать свой.",
        canonicalPath: "/register"
    }
}

const findMeta = (attribute: string, value: string) => {
    const selector = `meta[${attribute}="${value}"]`
    const existingTag = document.head.querySelector<HTMLMetaElement>(selector)
    if (existingTag) return existingTag

    const tag = document.createElement("meta")
    tag.setAttribute(attribute, value)
    document.head.appendChild(tag)
    return tag
}

const setMeta = (attribute: string, value: string, content: string) =>
    findMeta(attribute, value).setAttribute("content", content)

const removeMeta = (attribute: string, value: string) =>
    document.head.querySelector(`meta[${attribute}="${value}"]`)?.remove()

const setCanonical = (href: string | null) => {
    const existingLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (href == null) {
        existingLink?.remove()
        return
    }

    const link = existingLink ?? document.head.appendChild(Object.assign(
        document.createElement("link"), {rel: "canonical"}))
    link.href = href
}

// Приложение одностраничное: разметку из index.html видят все маршруты сразу,
// поэтому на каждой навигации переписываем её под текущую страницу.
const PageMeta = () => {
    const location = useLocation()

    useEffect(() => {
        const path = location.pathname.length > 1
            ? location.pathname.replace(/\/+$/, "").toLowerCase()
            : location.pathname
        const meta = publicPages[path]

        document.title = meta?.title ?? "HwProj"

        if (meta === undefined) {
            // Личный кабинет: содержимое за авторизацией, индексировать нечего.
            // robots.txt закрывает такие адреса от обхода, но по внешней ссылке
            // страница всё равно может попасть в индекс — noindex это исключает
            setMeta("name", "robots", "noindex, nofollow")
            setCanonical(null)
            return
        }

        removeMeta("name", "robots")
        setMeta("name", "description", meta.description)
        setCanonical(SITE_URL + meta.canonicalPath)
        setMeta("property", "og:url", SITE_URL + meta.canonicalPath)
        setMeta("property", "og:title", meta.title)
        setMeta("property", "og:description", meta.description)
    }, [location.pathname])

    return null
}

export default PageMeta;
