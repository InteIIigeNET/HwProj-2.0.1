import ReactMarkdown from "react-markdown";
import * as React from "react";
import {FC, useState} from "react";
import {Tabs, Tab, TextField} from "@material-ui/core";
import {TextFieldProps} from "@material-ui/core/TextField/TextField";
import {Card, CardContent} from "@mui/material";
import SyntaxHighlighter from "react-syntax-highlighter";

interface CodeBlockProps {
    language: string;
    value: string;
}

const CodeBlock: FC<CodeBlockProps> = ({language, value}: CodeBlockProps) =>
    <SyntaxHighlighter language={language}>
        {value}
    </SyntaxHighlighter>

const ReactMarkdownWithCodeHighlighting: FC<{ value: string }> = (props) =>
    <ReactMarkdown renderers={{code: CodeBlock}}>{props.value}</ReactMarkdown>

const TextFieldWithPreview: FC<TextFieldProps & {
    isEditable?: boolean,
    previewStyle?: React.CSSProperties
}> = (props) => {
    const isEditable = props.isEditable === undefined ? true : props.isEditable;
    const [state, setState] = useState<{ isPreview: boolean }>({
        isPreview: !isEditable
    })

    const {isPreview} = state

    return <>
        {isEditable && <Tabs
            indicatorColor={"primary"}
            value={isPreview ? 1 : 0}
            onChange={(_, newValue) => setState(prevState => ({
                ...prevState,
                isPreview: newValue === 1
            }))}
        >
            <Tab label="Редактировать" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
            <Tab label="Превью" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
        </Tabs>}

        {isPreview
            ? <Card variant={props.previewStyle ? "outlined" : "elevation"}
                    style={props.previewStyle || {backgroundColor: "ghostwhite"}}>
                <CardContent style={{paddingBottom: 0, marginBottom: 0}}>
                    <ReactMarkdownWithCodeHighlighting value={props.value as string}/>
                </CardContent>
            </Card>
            : <TextField {...props}/>}
    </>
}

export {TextFieldWithPreview, ReactMarkdownWithCodeHighlighting}
