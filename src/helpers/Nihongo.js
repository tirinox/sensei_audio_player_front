export function parenthesesToRuby(text) {
    // Regular expression pattern to match [original](translated)
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;

    // Replace function
    const newText = text.replace(pattern, function (match, original, translated) {
        return '<ruby>' + original + '<rt>' + translated + '</rt></ruby>';
    });

    return newText;
}

export function stripFurigana(text) {
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(pattern, (_, original) => original);
}

export function extractFurigana(text) {
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(pattern, (_, __, reading) => reading);
}
