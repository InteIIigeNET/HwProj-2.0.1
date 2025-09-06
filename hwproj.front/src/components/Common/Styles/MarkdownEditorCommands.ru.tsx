import {executeCommand, ExecuteState, ICommand, selectWord, TextAreaTextApi} from '@uiw/react-md-editor';
import {
    divider,
    group,
    code as codeInit,
    codeBlock as codeBlockInit,
    comment as commentInit,
    fullscreen as fullscreenInit,
    hr as hrInit,
    image as imageInit,
    italic as italicInit,
    bold as boldInit,
    link as linkInit,
    checkedListCommand as checkedListCommandInit,
    orderedListCommand as orderedListCommandInit,
    unorderedListCommand as unorderedListCommandInit,
    codeEdit as codeEditInit,
    codeLive as codeLiveInit,
    codePreview as codePreviewInit,
    quote as quoteInit,
    strikethrough as strikethroughInit,
    issue as issueInit,
    title as titleInit,
    title1 as title1Init,
    title2 as title2Init,
    title3 as title3Init,
    title4 as title4Init,
    title5 as title5Init,
    title6 as title6Init,
    table as tableInit,
    help as helpInit
} from '@uiw/react-md-editor';

let bold: ICommand = {
    ...boldInit,
    buttonProps: {'aria-label': 'Выделить жирным (ctrl + b)', title: 'Выделить жирным (ctrl + b)'},
};
let code: ICommand = {
    ...codeInit,
    buttonProps: {'aria-label': 'Вставить код (ctrl + j)', title: 'Вставить код (ctrl + j)'}
};
let codeBlock: ICommand = {
    ...codeBlockInit,
    buttonProps: {
        'aria-label': 'Вставить блок кода (ctrl + shift + j)',
        title: 'Вставить блок кода (ctrl + shift + j)'
    },
};
let comment: ICommand = {
    ...commentInit,
    buttonProps: {'aria-label': 'Закомментировать (ctrl + /)', title: 'Закомментировать (ctrl + /)'},
};
let fullscreen: ICommand = {
    ...fullscreenInit,
    buttonProps: {'aria-label': 'На весь экран (ctrl + 0)', title: 'На весь экран (ctrl + 0)'},
};
let hr: ICommand = {
    ...hrInit, buttonProps: {
        'aria-label': 'Вставить горизонтальную линию (ctrl + h)',
        title: 'Вставить горизонтальную линию (ctrl + h)'
    }
};
let image: ICommand = {
    ...imageInit,
    buttonProps: {'aria-label': 'Добавить изображение (ctrl + k)', title: 'Добавить изображение (ctrl + k)'},
};
let italic: ICommand = {
    ...italicInit,
    buttonProps: {'aria-label': 'Выделить курсивом (ctrl + i)', title: 'Выделить курсивом (ctrl + i)'},
};
let link: ICommand = {
    ...linkInit,
    buttonProps: {'aria-label': 'Добавить ссылку (ctrl + l)', title: 'Добавить ссылку (ctrl + l)'}
};
let checkedListCommand: ICommand = {
    ...checkedListCommandInit,
    buttonProps: {'aria-label': 'Добавить список (ctrl + shift + c)', title: 'Добавить список (ctrl + shift + c)'},
};
let orderedListCommand: ICommand = {
    ...orderedListCommandInit,
    buttonProps: {
        'aria-label': 'Добавить нумерованный список (ctrl + shift + o)',
        title: 'Добавить нумерованный список (ctrl + shift + o)'
    },
};
let unorderedListCommand: ICommand = {
    ...unorderedListCommandInit,
    buttonProps: {
        'aria-label': 'Добавить маркированный список (ctrl + shift + u)',
        title: 'Добавить маркированный список (ctrl + shift + u)',
    },
};
let codeEdit: ICommand = {
    ...codeEditInit,
    buttonProps: {'aria-label': 'В режим редактирования (ctrl + 7)', title: 'В режим редактирования (ctrl + 7)'},
};
let codeLive: ICommand = {
    ...codeLiveInit,
    buttonProps: {'aria-label': 'В дублированный режим (ctrl + 8)', title: 'В дублированный режим (ctrl + 8)'},
};
let codePreview: ICommand = {
    ...codePreviewInit,
    buttonProps: {'aria-label': 'В режим превью (ctrl + 9)', title: 'В режим превью (ctrl + 9)'},
};
let quote: ICommand = {
    ...quoteInit,
    buttonProps: {'aria-label': 'Вставить цитату (ctrl + 9)', title: 'Вставить цитату (ctrl + 9)'},
};
let strikethrough: ICommand = {
    ...strikethroughInit,
    buttonProps: {
        'aria-label': 'Выделить зачеркнутым (ctrl + shift + x)',
        title: 'Выделить зачеркнутым (ctrl + shift + x)',
    },
};
let title: ICommand = {
    ...titleInit,
    buttonProps: {'aria-label': 'Вставить заголовок (ctrl + 1)', title: 'Вставить заголовок (ctrl + 1)'},
};
let title1: ICommand = {
    ...title1Init,
    buttonProps: {'aria-label': 'Вставить заголовок 1 (ctrl + 1)', title: 'Вставить заголовок 1 (ctrl + 1)'},
};
let title2: ICommand = {
    ...title2Init,
    buttonProps: {'aria-label': 'Вставить заголовок 2 (ctrl + 2)', title: 'Вставить заголовок 2 (ctrl + 2)'},
};
let title3: ICommand = {
    ...title3Init,
    buttonProps: {'aria-label': 'Вставить заголовок 3 (ctrl + 3)', title: 'Вставить заголовок 3 (ctrl + 3)'},
};
let title4: ICommand = {
    ...title4Init,
    buttonProps: {'aria-label': 'Вставить заголовок 4 (ctrl + 4)', title: 'Вставить заголовок 4 (ctrl + 4)'},
};
let title5: ICommand = {
    ...title5Init,
    buttonProps: {'aria-label': 'Вставить заголовок 5 (ctrl + 5)', title: 'Вставить заголовок 5 (ctrl + 5)'},
};
let title6: ICommand = {
    ...title6Init,
    buttonProps: {'aria-label': 'Вставить заголовок 6 (ctrl + 6)', title: 'Вставить заголовок 6 (ctrl + 6)'},
};
let table: ICommand = {...tableInit, buttonProps: {'aria-label': 'Добавить таблицу', title: 'Добавить таблицу'}};
let mathFormula: ICommand = {
    ...codeInit,
    name: 'mathFormula',
    keyCommand: 'mathFormula',
    shortcuts: 'ctrlcmd+f',
    prefix: '$$',
    buttonProps: {'aria-label': 'Вставить формулу (ctrl + f)', title: 'Вставить формулу (ctrl + f)'},
    icon: (
        <svg width="14" height="14" role="img" viewBox="200 200 700 700">
            <path
                fill="currentColor"
                d="M566.272 217.088c-11.264-7.168-24.576-11.264-41.984-11.264-4.096 0-8.192 0-12.288 1.024-45.056 7.168-74.752 48.128-93.184 87.04-8.192 18.432-15.36 37.888-22.528 56.32-3.072 9.216-7.168 17.408-10.24 26.624 0 1.024-5.12 18.432-6.144 18.432h-46.08c-6.144 0-11.264 5.12-11.264 11.264 0 6.144 5.12 11.264 11.264 11.264h39.936l-22.528 96.256c-22.528 107.52-53.248 230.4-60.416 251.904-7.168 22.528-17.408 33.792-31.744 33.792-3.072 0-5.12-1.024-7.168-2.048-2.048-1.024-3.072-3.072-3.072-5.12s1.024-5.12 4.096-9.216c3.072-4.096 4.096-9.216 4.096-13.312 0-8.192-3.072-15.36-8.192-20.48-6.144-5.12-12.288-7.168-19.456-7.168s-14.336 3.072-20.48 8.192c-1.024 7.168-4.096 14.336-4.096 23.552 0 12.288 5.12 22.528 15.36 31.744 10.24 9.216 23.552 13.312 40.96 13.312 27.648 0 52.224-12.288 70.656-33.792 11.264-13.312 19.456-28.672 26.624-45.056 22.528-50.176 34.816-105.472 48.128-158.72 13.312-54.272 25.6-108.544 36.864-162.816h44.032c6.144 0 11.264-5.12 11.264-11.264 0-6.144-5.12-11.264-11.264-11.264h-40.96c22.528-84.992 48.128-143.36 53.248-151.552 8.192-14.336 17.408-21.504 27.648-21.504 4.096 0 6.144 1.024 7.168 3.072 1.024 2.048 2.048 4.096 2.048 5.12 0 1.024-1.024 4.096-4.096 9.216-3.072 5.12-4.096 10.24-4.096 15.36 0 7.168 3.072 13.312 8.192 18.432s12.288 8.192 19.456 8.192 14.336-3.072 19.456-8.192 8.192-12.288 8.192-21.504c-1.024-17.408-6.144-28.672-17.408-35.84z m204.8 258.048c16.384 0 48.128-13.312 48.128-56.32s-30.72-45.056-40.96-45.056c-18.432 0-37.888 13.312-54.272 41.984-16.384 28.672-34.816 61.44-34.816 61.44h-1.024c-4.096-20.48-7.168-36.864-9.216-45.056-3.072-17.408-23.552-56.32-66.56-56.32s-81.92 24.576-81.92 24.576c-7.168 4.096-12.288 12.288-12.288 21.504 0 14.336 11.264 25.6 25.6 25.6 4.096 0 8.192-1.024 11.264-3.072 0 0 32.768-18.432 38.912 0 2.048 5.12 4.096 11.264 6.144 17.408 8.192 27.648 15.36 60.416 22.528 90.112L596.992 593.92s-31.744-11.264-48.128-11.264-48.128 13.312-48.128 56.32 30.72 45.056 40.96 45.056c18.432 0 37.888-13.312 54.272-41.984 16.384-28.672 34.816-61.44 34.816-61.44 5.12 26.624 10.24 48.128 13.312 56.32 10.24 30.72 34.816 48.128 67.584 48.128 0 0 33.792 0 72.704-22.528 9.216-4.096 16.384-13.312 16.384-23.552 0-14.336-11.264-25.6-25.6-25.6-4.096 0-8.192 1.024-11.264 3.072 0 0-27.648 15.36-37.888 3.072-7.168-13.312-12.288-30.72-17.408-52.224-4.096-19.456-9.216-41.984-13.312-63.488l28.672-40.96c-1.024 1.024 30.72 12.288 47.104 12.288z"
            />
        </svg>),
    execute: (state: ExecuteState, api: TextAreaTextApi) => {
        if (state.selectedText.indexOf('\n') === -1) {
            codeInit.execute!(state, api)
        }
    }
};
let help: ICommand = {
    ...helpInit,
    buttonProps: {'aria-label': 'Открыть описание Markdown', title: 'Открыть описание Markdown'}
};

export const getCommands: () => ICommand[] = () => [
    bold,
    italic,
    strikethrough,
    hr,
    group([title1, title2, title3, title4, title5, title6], {
        name: 'title',
        groupName: 'title',
        buttonProps: {'aria-label': 'Вставить заголовок', title: 'Вставить заголовок'},
    }),
    divider,
    link,
    quote,
    mathFormula,
    code,
    codeBlock,
    comment,
    image,
    table,
    divider,
    unorderedListCommand,
    orderedListCommand,
    checkedListCommand,
    divider,
    help,
];
export const getExtraCommands: () => ICommand[] = () => [codeEdit, codeLive, codePreview, divider, fullscreen];
export {
    title,
    title1,
    title2,
    title3,
    title4,
    title5,
    title6,
    bold,
    codeBlock,
    comment,
    italic,
    strikethrough,
    hr,
    group,
    divider,
    link,
    quote,
    code,
    image,
    unorderedListCommand,
    orderedListCommand,
    checkedListCommand,
    table,
    help,
    codeEdit,
    codeLive,
    codePreview,
    fullscreen,
};