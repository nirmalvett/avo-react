export function editText(event: any) {
    let {key, ctrlKey, target} = event;
    if (ctrlKey && (key === 'd' || key === 'e')) {
        let {selectionStart, selectionEnd} = target;
        event.preventDefault();
        document.execCommand(
            'insertText',
            false,
            key === 'e'
                ? '\\[' + target.value.substring(selectionStart, selectionEnd) + '\\]'
                : '\\(' + target.value.substring(selectionStart, selectionEnd) + '\\)',
        );
        target.selectionStart = selectionStart + 2;
        target.selectionEnd = selectionEnd + 2;
    }
}
