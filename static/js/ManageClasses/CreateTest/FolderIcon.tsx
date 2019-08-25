import React from 'react';
import {Folder, FolderOpen} from '@material-ui/icons';

export function FolderIcon(props: {open: boolean; disabled: boolean}) {
    const folderHasQuestionsColor = props.disabled ? 'disabled' : 'action';
    return props.open ? (
        <FolderOpen color={folderHasQuestionsColor} />
    ) : (
        <Folder color={folderHasQuestionsColor} />
    );
}
