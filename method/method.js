export default function appLogger(tag, message, ...object) {
    const DEBUG = process.env.NODE_ENV === "development";
    if (DEBUG) {
        // eslint-disable-next-line no-console
        console.group();
        // eslint-disable-next-line no-console
        console.log("[" + tag.toUpperCase() + "] " + message, ...object);
        // eslint-disable-next-line no-console
        console.groupEnd();
    }
}
