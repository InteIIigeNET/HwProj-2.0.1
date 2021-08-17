import ApiSingleton from "./ApiSingleton"

export module Token {
    export const getAuthOption = () => {
        return  {headers: {"Authorization": `Bearer ${ApiSingleton.authService.getToken()}`}}
    }
}