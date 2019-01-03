/**
 * Attempts to pad a number with zeros.
 *
 * @example zeroPad(10, 1) // "10"
 * @example zeroPad(10, 2) // "10"
 * @example zeroPad(10, 3) // "010"
 * @param n The integer to zero pad
 * @param miniumumDigits The minimum number of digits the output should have
 */
export declare function zeroPad(n: number, miniumumDigits?: number): string;
