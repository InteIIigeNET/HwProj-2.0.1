export default class ErrorsHandler {
    static defaultErrorMessage = 'Сервис недоступен';

    static isStringNullOrEmpty(str: string | undefined): boolean {
        return str === undefined || str.trim().length === 0;
    }

    static async getErrorMessages(response: Response): Promise<string[]> {
        try {
            const contentType = response.headers.get("Content-Type");
            
            if (contentType?.includes("application/json")) {
                return await response.json();
            } else {
                return [await response.text()];
            }
        } catch (e) {
            return [this.defaultErrorMessage];
        }
    }
}