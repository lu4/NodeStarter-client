export interface Comparer<T> {
    /**
     * Compares two keys with each other.
     *
     * @private
     * @param {Object} a The first key to compare.
     * @param {Object} b The second key to compare.
     * @return {number} -1, 0 or 1 if a < b, a == b or a > b respectively.
     */
    (a: T, b: T): number;
}