/**
 * Formate un nombre de secondes en format MM:SS
 * @param {number} seconds - Le nombre total de secondes
 * @returns {string} - Le temps formaté (ex: "10:00")
 */
export function formatGameClock(seconds) {
    if (seconds === null || seconds === undefined) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate le temps pour le chronomètre des tirs
 * @param {number} seconds - Le nombre de secondes pour le chronomètre des tirs
 * @returns {string} - Le temps formaté
 */
export function formatShotClock(seconds) {
    if (seconds === null || seconds === undefined) return "";
    return Math.floor(seconds).toString();
}