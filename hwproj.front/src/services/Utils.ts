export default class Utils {
    convertUTCDateToLocalDate(date: Date) {
        var newDate = new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset()*60*1000);
        return newDate;     
    }
}