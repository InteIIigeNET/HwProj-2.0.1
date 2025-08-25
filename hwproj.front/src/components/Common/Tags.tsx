import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {useState, useEffect, SyntheticEvent} from "react";
import { Tooltip } from "@mui/material";

interface TagsProps {
    tags: string[];
    suggestion?: string | undefined;
    onTagsChange: (tags: string[]) => void;
    requestTags: () => Promise<string[]>;
    isElementSmall: boolean;
}

export default function Tags({tags, suggestion, onTagsChange, requestTags, isElementSmall}: TagsProps) {
    const [allTags, setAllTags] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(suggestion !== undefined)
    const suggestionTag = "+ " + suggestion

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        setShowSuggestions(suggestion !== undefined);
    }, [suggestion])

    const fetchTags = async () => {
        try {
            const response = await requestTags();
            setAllTags(response);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    };
    const [value, setValue] = useState<string[]>(tags);
    const handleOptionSelect = (event: SyntheticEvent<Element, Event> | undefined, newValue: string[], reason: string, details: {
        option: string
    } | undefined) => {
        const formatted = newValue.map(t => t.trim().split(RegExp("\\s+")).join(" "))
        const filtered = formatted.filter(t => t.length > 0 && t !== suggestionTag)
        if (reason === "removeOption" && details && details.option === suggestionTag) setShowSuggestions(false)
        setValue(filtered);
        onTagsChange(filtered);
    };
    return (
        <Autocomplete
            multiple
            fullWidth
            id="tags-filled"
            options={allTags}
            value={showSuggestions ? [suggestionTag, ...value] : value}
            defaultValue={[]}
            onChange={handleOptionSelect}
            filterSelectedOptions
            freeSolo
            size={isElementSmall ? "small" : "medium"}
            renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => {
                    return option === suggestionTag ?
                        <Tooltip arrow title={"Предложение на основе названия"}>
                            <Chip variant="outlined" color={"info"} label={option} {...getTagProps({index})}
                                  style={{cursor: "pointer"}}
                                  onClick={() => handleOptionSelect(undefined, [...value, suggestion!], "removeOption", {option: option})}/>
                        </Tooltip> :
                        <Chip variant="filled" label={option} {...getTagProps({index})} />
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Свойства"
                    placeholder="Добавить свойство"
                />
            )}
        />
    )
}
