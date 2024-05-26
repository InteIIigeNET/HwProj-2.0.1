import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {useState, SyntheticEvent} from "react";

interface TagsProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
}

export default function InlineTags({tags, onTagsChange}: TagsProps) {
    const tagsOptions: string[] = []

    const [value, setValue] = useState<string[]>(tags.filter(t => t != ''));
    const handleOptionSelect = (event: SyntheticEvent<Element, Event>, newValue: string[]) => {
        setValue(newValue);
        onTagsChange(newValue);
    };

    return (
        <Autocomplete
            multiple
            id="tags-filled"
            options={tagsOptions}
            value={value}
            defaultValue={[]}
            onChange={handleOptionSelect}
            filterSelectedOptions
            freeSolo
            disableClearable
            size={"small"}
            fullWidth
            renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip size={"small"} variant="filled" label={option} {...getTagProps({index})} />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Добавить"
                />
            )}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        border: 'none',
                    },
                },
            }}
        />
    )
}