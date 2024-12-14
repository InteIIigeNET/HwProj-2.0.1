import {ICommand} from '@uiw/react-md-editor/esm/commands';
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
} from '@uiw/react-md-editor/esm/commands';

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