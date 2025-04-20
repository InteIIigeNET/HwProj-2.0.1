import ApiSingleton from 'api/ApiSingleton';
import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

const idRegex = /^\d+$/
const uuidRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i

const TrackPageChanges = () => {
    const location = useLocation()

    const anonymizePath = (pathname: string) => {
        if (pathname.startsWith('/join')) return "/join/TOKEN"
        return pathname
            .split('/')
            .map(segment => {
                if (idRegex.test(segment)) return "ID"
                if (uuidRegex.test(segment)) return "USER_ID"
                return segment
            })
            .join('/')
    }

    useEffect(() => {
        // Отправляем данные о новом URL в Яндекс.Метрику
        if (window.ym) {
            window.ym(101061418, 'hit', anonymizePath(location.pathname), {
                params: {
                    user_role: ApiSingleton.authService.getRole()
                }
            })
        }
    }, [location.pathname])

    return null
}

export default TrackPageChanges;