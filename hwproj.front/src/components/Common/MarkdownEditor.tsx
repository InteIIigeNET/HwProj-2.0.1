﻿import {ChangeEvent, FC} from "react";
import MDEditor from "@uiw/react-md-editor";
import { getCommands, getExtraCommands } from "./Styles/MarkdownEditorCommands.ru";
import rehypeSanitize from "rehype-sanitize";
import * as React from "react";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./Styles/MarkdownEditor.css";

interface MarkdownEditorProps {
    label: string;
    maxHeight?: number;
    height?: number;
    value: string;
    onChange: (value: string) => void;
}

interface MarkdownPreviewProps {
    value: string;
    backgroundColor?: string;
    textColor?: string;
}

const MarkdownPreview: FC<MarkdownPreviewProps> = (props) =>
    <MDEditor.Markdown
        className="markdown-preview"
        source={props.value}
        style={{
            backgroundColor: props.backgroundColor ?? "transparent",
            color: props.textColor ?? "inherit",
            paddingBottom: '15px'
        }}
        wrapperElement={{
            "data-color-mode": "light"
        }}
    />

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const handleChange = (value: string | undefined, event?: ChangeEvent<HTMLTextAreaElement>) => {
        if (value !== undefined) {
            props.onChange(value!);
        }
    };

    return (
        <div
            data-color-mode="light"
            style={{
                marginTop: '15px',
                marginBottom: '15px',
            }}
        >
            <MDEditor
                commands={[...getCommands()]}
                extraCommands={[...getExtraCommands()]}
                value={props.value}
                onChange={handleChange}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                    className: "markdown-preview"
                }}
                maxHeight={props.maxHeight ?? 400}
                height={props.height ?? 230}
                textareaProps={{
                    placeholder: props.label
                }}
                preview="edit"
            />
        </div>
    );
}

export {MarkdownEditor, MarkdownPreview}
