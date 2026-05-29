export const getInitials = (fullName) => {
    // fallback
    if (!fullName?.trim()) {
        return 'សយ';
    }

    // remove extra spaces
    const names = fullName
        .trim()
        .split(/\s+/);

    let initials = '';

    // one word
    if (names.length === 1) {
        initials = names[0]
            .slice(0, 2);
    }

    // multiple words
    else {
        initials =
            names[0][0] +
            names[names.length - 1][0];
    }

    // uppercase only for English
    const isEnglish =
        /^[a-zA-Z]+$/.test(initials);

    return isEnglish
        ? initials.toUpperCase()
        : initials;
};