import {FC} from "react";
import MDEditor, { PreviewType } from "@uiw/react-md-editor";
import {getCommands, getExtraCommands} from "./Styles/MarkdownEditorCommands.ru";
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import * as React from "react";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./Styles/MarkdownEditor.css";
import {Schema} from "rehype-sanitize/lib";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownEditorProps {
    label: string;
    maxHeight?: number;
    height?: number;
    value: string;
    previewMode?: PreviewType
    onChange: (value: string) => void;
}

interface MarkdownPreviewProps {
    value: string;
    backgroundColor?: string;
    textColor?: string;
}

const customRehypeSanitizeSchema: Schema = {
    ...defaultSchema,
    tagNames: [
        ...(defaultSchema.tagNames || []),
        // Базовые HTML-теги (разметка и подсветка кода)
        'span', 'code',
        // MathML Core:
        'math', 'mrow', 'mi', 'mo', 'mn', 'msub', 'msup', 'mfrac', 'msqrt',
        // MathML Advanced:
        'maction', 'maligngroup', 'malignmark', 'menclose', 'merror',
        'mfenced', 'mi', 'mlongdiv', 'mmultiscripts', 'mover',
        'mpadded', 'mphantom', 'mroot', 'ms', 'mscarries', 'mscarry',
        'msgroup', 'msline', 'mspace', 'msrow', 'mstack', 'mstyle',
        'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover',
        // Аннотации:
        'semantics', 'annotation', 'annotation-xml'
    ],
    attributes: {
        ...defaultSchema.attributes,
        '*': ['className'], // Стилизация KaTeX и подсветка синтаксиса
        math: ['xmlns'], // Пространство имен MathML
        annotation: ['encoding'], // Формат аннотации
    }
};

const MarkdownPreview: FC<MarkdownPreviewProps> = (props) => <MDEditor.Markdown
    className="markdown-preview"
    source={props.value}
    style={{
        backgroundColor: props.backgroundColor ?? "transparent",
        color: props.textColor ?? "inherit",
        paddingBottom: '15px'
    }}
    components={{
        a: ({ node, ...props }) => (
            <a
                {...props}
                style={{
                    wordBreak: 'break-all',
                    display: 'inline-block',
                    maxWidth: '100%'
                }}
            />
        ),
    }}
    wrapperElement={{
        "data-color-mode": "light"
    }}
    remarkPlugins={[remarkMath]}
    rehypePlugins={[
        [rehypeKatex as any, { output: 'mathml' }],
        [rehypeSanitize, customRehypeSanitizeSchema]
    ]}
/>

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const handleChange = (value: string | undefined) => {
        if (value !== undefined) props.onChange(value);
    };

    return (
        <div data-color-mode="light" style={{marginTop: '15px', marginBottom: '15px'}}>
            <MDEditor
                commands={[...getCommands()]}
                extraCommands={[...getExtraCommands()]}
                value={props.value}
                onChange={handleChange}
                previewOptions={{
                    className: "markdown-preview",
                    remarkPlugins: [remarkMath],
                    rehypePlugins: [
                        [rehypeKatex as any, { output: 'mathml' }],
                        [rehypeSanitize, customRehypeSanitizeSchema]
                    ],
                }}
                maxHeight={props.maxHeight ?? 400}
                height={props.height ?? 230}
                textareaProps={{placeholder: props.label}}
                preview={props.previewMode || "edit"}
            />
        </div>
    );
}

export {MarkdownEditor, MarkdownPreview}
