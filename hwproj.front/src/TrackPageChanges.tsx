import ApiSingleton from 'api/ApiSingleton';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TrackPageChanges = () => {
    const location = useLocation();
    
    useEffect(() => {
        // Отправляем данные о новом URL в Яндекс.Метрику
        if (window.ym) {
            window.ym(101061418, 'hit', location.pathname, {
                params: {
                    user_role: ApiSingleton.authService.getRole()
                }
            });
        }
    }, [location.pathname]);

    return null;
};

export default TrackPageChanges;