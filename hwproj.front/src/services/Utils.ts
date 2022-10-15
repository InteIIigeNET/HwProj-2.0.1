export default class Utils {
    static convertUTCDateToLocalDate(date: Date) {
        var newDate = new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60 * 1000);
        return newDate;
    }

    static toMoscowDate(date: Date) {
        return new Date(date.setHours(date.getHours() + 3));
    }

    static toIsoString(date: Date) {
        const pad = (num: number) => (num < 10 ? '0' : '') + num

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds())
    }
}
