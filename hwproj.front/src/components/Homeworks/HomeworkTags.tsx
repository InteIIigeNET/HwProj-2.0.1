import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import apiSingleton from "../../api/ApiSingleton";
import {useState, useEffect, SyntheticEvent} from "react";

interface TagsProps {
    editFlag: boolean;
    tags: string[];
    courseId: number;
    onTagsChange: (tags: string[]) => void;
}

export default function Tags({ editFlag, tags, courseId, onTagsChange} : TagsProps) {
    const [allTags, setAllTags] = useState<string[]>([]); // Указываем тип string[]

    useEffect(() => {
        if (editFlag) {
            fetchTags();
        }
    }, [editFlag]);

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
    if (allTags.length > 0) return (
        <Autocomplete
            multiple
            id="tags-filled"
            options={allTags}
            value = {value}
            defaultValue={[]}
            onChange={handleOptionSelect}
            readOnly={!editFlag}
            freeSolo
            renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip variant="filled" label={option} {...getTagProps({ index })} />

                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Тэги"
                    placeholder= {editFlag == true ? "Добавить тэг" : ""}
                />
            )}
        />
    )
    else return(<></>)
}

