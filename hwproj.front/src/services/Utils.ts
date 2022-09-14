export default class Utils {
    static convertUTCDateToLocalDate(date: Date) {
        var newDate = new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60 * 1000);
        return newDate;
    }

    static toMoscowDate(date: Date) {
        return new Date(date.setHours(date.getHours() + 3));
    }
}
