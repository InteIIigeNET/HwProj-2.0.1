import {FC, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import ApiSingleton from "../../api/ApiSingleton";
import WrongPath from "../WrongPath";

// Отдельной страницы решений задачи больше нет — решения и вопросы показываются прямо на
// странице курса (CourseExperimental). Старые ссылки вида /task/:taskId (уведомления, письма,
// список дедлайнов, ведомость) продолжают работать: здесь мы определяем курс задачи
// и перенаправляем на страницу курса с уже открытой задачей.
const TaskRedirect: FC = () => {
    const {taskId} = useParams()
    const navigate = useNavigate()
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        const resolve = async () => {
            try {
                const userId = ApiSingleton.authService.getUserId()
                const pageData = await ApiSingleton.solutionsApi.solutionsGetStudentSolution(+taskId!, userId)
                if (pageData.courseId) {
                    navigate(`/courses/${pageData.courseId}/homeworks?taskId=${taskId}`, {replace: true})
                    return
                }
                setFailed(true)
            } catch {
                setFailed(true)
            }
        }
        resolve()
    }, [taskId])

    if (failed) return <WrongPath/>

    return (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    )
}

export default TaskRedirect
