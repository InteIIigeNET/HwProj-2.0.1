interface ICompletedData{
    title?: string,
    teacher?: string,
    deadline?: string,
    scienceArea?: string,//
    description?: string,
    reportFile?: string,
    presentationFile?: string,
    consultantReportFile?: string,
    link?: string,
    teacherContacts?: string,
    consultant?: string,
    consultantContacts?: string,
    critic?: string,
    status?: string,
    teacherReview?: string,
    criticReview?: string,
    id?: number
}

let data : ICompletedData[] = [
    {
        title:'Тема курсовой 1',
        teacher:'Абстрактный преподаватель1',
        teacherContacts: 'abstract1@spbu.ru',
        teacherReview: 'Отзыв.pdf',
        deadline:'01.06.2018',
        scienceArea : 'Веб-приложения',
        description: 'Так говорила в июле 1805 года известная Анна Павловна Шерер, фрейлина и приближенная императрицы Марии Феодоровны, встречая важного и чиновного князя Василия, первого приехавшего на ее вечер.', 
        reportFile: 'Отчет.pdf',
        presentationFile: '',
        consultantReportFile:'',
        link: '',
        consultant : '',
        consultantContacts : '',
        critic : 'Николай Васильевич Гоголь',
        criticReview: 'Мертвые_души.pdf',
        status : 'защищена',
        id : 1
    },
    {
        title:'Тема курсовой 2',
        teacher:'Абстрактный преподаватель2',
        teacherReview : 'Отзыв.doc',
        teacherContacts: 'abstact2@spbu.ru',
        deadline:'01.06.2016',
        scienceArea : 'Веб-приложения',
        description: '«Si vous na\'vez rien de mieux à faire, Monsieur le comte (или mon prince), et si la perspective de passer la soirée chez une pauvre malade ne vous effraye pas trop, je serai charmée de vous voir chez moi entre 7 et 10 heures. Annette Scherer»', 
        reportFile: 'Отчет.pdf',
        presentationFile: 'Презентация.pptx',
        consultantReportFile:'',
        link: '',
        consultant : 'Пьер Безухов',
        consultantContacts : 'bezukhow@spbu.ru',
        critic : '',
        criticReview:'Массонство.pdf',
        status : 'защищена',
        id : 2
    },
    {
        title:'Тема курсовой 3',
        teacher:'Абстрактный преподаватель3',
        teacherContacts: 'abstact2@spbu.ru',
        teacherReview : 'Review.pdf',
        deadline:'01.06.2016',
        scienceArea : 'Веб-приложения',
        description: '«Si vous na\'vez rien de mieux à faire, Monsieur le comte (или mon prince), et si la perspective de passer la soirée chez une pauvre malade ne vous effraye pas trop, je serai charmée de vous voir chez moi entre 7 et 10 heures. Annette Scherer»', 
        reportFile: 'Отчет.pdf',
        presentationFile: 'Презентация.pptx',
        consultantReportFile:'',
        link: 'vk.com',
        consultant : 'Пьер Безухов',
        consultantContacts : 'bezukhow@spbu.ru',
        critic : '',
        criticReview:'рецензия.doc',
        status : 'защищена',
        id : 3 
    }
]

export default data