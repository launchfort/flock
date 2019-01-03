import { zeroPad } from './zero-pad'

/**
 * Attempts to format a Date object to a string.
 *
 * @param d The Date object to format
 * @param format The format string that contains tokens
 */
export function formatDate (d: Date, format = 'YYYY-MM-DD') {
  return format.replace(/YYYY/g, () => {
    return d.getFullYear().toString()
  }).replace(/DD/g, () => {
    return zeroPad(d.getDate(), 2)
  }).replace(/MM/g, () => {
    return zeroPad(d.getMonth() + 1, 2)
  })
}
