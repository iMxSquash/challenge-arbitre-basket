/**
 * Formats a number of seconds to MM:SS format
 * @param {number} seconds - The total number of seconds
 * @returns {string} - The formatted time (e.g. "10:00")
 */
export function formatGameClock(seconds) {
    if (seconds === null || seconds === undefined) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats the time for the shot clock
 * @param {number} seconds - The number of seconds for the shot clock
 * @returns {string} - The formatted time
 */
export function formatShotClock(seconds) {
    if (seconds === null || seconds === undefined) return "";
    return Math.floor(seconds).toString();
}