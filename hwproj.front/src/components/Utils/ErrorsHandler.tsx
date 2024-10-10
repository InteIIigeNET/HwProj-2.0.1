export default class ErrorsHandler {
    static async getErrorMessages(response : Response) : Promise<string[]> {
        try {
            const message = await response.text();
            return [message];
        } catch {
            return ['Сервис недоступен'];
        }
    }
}