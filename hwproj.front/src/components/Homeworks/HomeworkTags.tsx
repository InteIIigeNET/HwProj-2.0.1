import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import apiSingleton from "../../api/ApiSingleton";
import {useState, useEffect, SyntheticEvent} from "react";

interface TagsProps {
    tags: string[];
    courseId: number;
    onTagsChange: (tags: string[]) => void;
}

export default function Tags({tags, courseId, onTagsChange}: TagsProps) {
    const [allTags, setAllTags] = useState<string[]>([]);

    useEffect(() => {
            fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await apiSingleton.coursesApi.apiCoursesTagsByCourseIdGet(courseId);
            setAllTags(response);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    };
    const [value, setValue] = useState<string[]>(tags.filter(t => t != ''));
    const handleOptionSelect = (event: SyntheticEvent<Element, Event>, newValue: string[]) => {
        setValue(newValue);
        onTagsChange(newValue);
    };
    return (
        <Autocomplete
            multiple
            id="tags-filled"
            options={allTags}
            value={value}
            defaultValue={[]}
            onChange={handleOptionSelect}
            filterSelectedOptions
            freeSolo
            renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip variant="filled" label={option} {...getTagProps({index})} />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label = "Тэги"
                    placeholder = "Добавить тэг"
                />
            )}
        />
    )
}
