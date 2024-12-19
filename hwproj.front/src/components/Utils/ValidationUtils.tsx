export default class ValidationUtils {
    static isCorrectEmail(email: string) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,5}))$/;
        return re.test(email);
    }

    static isNullOrUndefined<T>(value: T | undefined | null): value is undefined | null {
        return value === undefined || value === null;
    }
}