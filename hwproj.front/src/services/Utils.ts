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

     static pluralizeDateTime(milliseconds: number) {
         const diffHours = milliseconds/ (1000 * 60 * 60);
         const diffDays = Math.trunc(diffHours / 24);
         return diffDays === 0 ? Math.trunc(diffHours) + " " + this.pluralizeHelper(["часов", "часа", "час"], diffHours) : diffDays + " " + this.pluralizeHelper(["дней", "дня", "день"], diffDays)
     }

    static pluralizeHelper(forms: Array<string>, n: number) {
        let idx;
        if (n % 10 === 1 && n % 100 !== 11) {
            idx = 0; // one
        } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
            idx = 1; // few
        } else {
            idx = 2; // many
        }
        return forms[idx] || '';

    }
}
