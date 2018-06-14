/**
 * Attempts to pad a number with zeros.
 *
 * @example zeroPad(10, 1) // "10"
 * @example zeroPad(10, 2) // "10"
 * @example zeroPad(10, 3) // "010"
 * @param n The integer to zero pad
 * @param miniumumDigits The minimum number of digits the output should have
 */
export function zeroPad (n: number, miniumumDigits = 1) {
  n = Math.round(n)
  miniumumDigits = miniumumDigits <= 0 || isNaN(miniumumDigits) || miniumumDigits === Infinity
    ? 1
    : miniumumDigits

  const s = Math.abs(n).toString().split('')
  const k = miniumumDigits - s.length

  if (k > 0) {
    let digits = new Array(miniumumDigits)
    for (let g = 0; g < miniumumDigits; g +=1 ) {
      if (g < k) {
        digits[g] = 0
      } else {
        digits[g] = s[g - k]
      }
    }
    return (n < 0 ? '-' : '') + digits.join('')
  } else {
    return n.toString()
  }
}
