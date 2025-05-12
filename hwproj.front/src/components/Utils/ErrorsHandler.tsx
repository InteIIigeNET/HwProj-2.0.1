export default class ErrorsHandler {
    static defaultErrorMessage = 'Сервис недоступен';

    static isStringNullOrEmpty(str: string | undefined): boolean {
        return str === undefined || str.trim().length === 0;
    }

    static async getErrorMessages(response: Response, expectedJsonField?: string): Promise<string[]> {
        try {
            const contentType = response.headers.get("Content-Type");
            if (contentType?.includes("application/json")) {
                var errorJson = await response.json();
                return expectedJsonField ?
                    errorJson[expectedJsonField] ?? errorJson
                    : errorJson
            } else {
                return [await response.text()];
            }
        } catch (e) {
            return [this.defaultErrorMessage];
        }
    }
}