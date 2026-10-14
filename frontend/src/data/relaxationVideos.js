
export const VIDEO_BY_TYPE = {
    CROSSED_MOVEMENTS: "crossed-movements.mp4",
    BALANCE_LEFT: "integration-1.mp4",
    BALANCE_RIGHT: "integration-2.mp4",
    FOLLOW_OBJECT: "follow-object.mp4",
    LAZY_EIGHT: "lazy-eight.mp4"
};

export function normalizeGender(value) {

    const gender = String(value ?? "")
        .trim()
        .toLowerCase();

    if (
        ["male", "m", "машко", "masko", "boy"]
            .includes(gender)
    ) {
        return "male";
    }

    if (
        ["female", "f", "женско", "zensko", "girl"]
            .includes(gender)
    ) {
        return "female";
    }

    return null;
}

export function getExerciseVideo(type, gender) {

    const filename = VIDEO_BY_TYPE[type];
    const normalizedGender = normalizeGender(gender);

    if (!filename || !normalizedGender) {
        return null;
    }

    return `/videos/relaxation/${normalizedGender}/${filename}`;
}
