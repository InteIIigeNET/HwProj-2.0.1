export default class Utils {
    static convertLocalDateToUTCDate(d: Date) {
        let date = new Date(d)
        return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
    }

    static toMoscowDate(date: Date) {
        return new Date(date.setHours(date.getHours() + 3))
    }

    static toISOString(date: Date | undefined) {
        if (date == undefined) return undefined

        const pad = (num: number) => (num < 10 ? '0' : '') + num

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds())
    }

    static pluralizeDateTime(milliseconds: number) {
        const diffHours = milliseconds / (1000 * 60 * 60)
        const diffHoursInt = Math.trunc(diffHours)

        if (diffHoursInt === 0) {
            const diffMinutes = Math.trunc(milliseconds / (1000 * 60))
            return diffMinutes + " " + this.pluralizeHelper(["минуту", "минуты", "минут"], diffMinutes)
        }

        const diffDays = Math.trunc(diffHours / 24)
        if (diffDays === 0) {
            return diffHoursInt + " " + this.pluralizeHelper(["час", "часа", "часов"], diffHoursInt)
        } else {
            return diffDays + " " + this.pluralizeHelper(["день", "дня", "дней"], diffDays)
        }
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

    static renderReadableDate = (date: Date) => {
        const options = {month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}
        return (new Date(date)).toLocaleString("ru-RU", options)
    }

    static renderDateWithoutSeconds = (date: Date) => {
        const options = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}
        return (new Date(date)).toLocaleString("ru-RU", options)
    }
}
