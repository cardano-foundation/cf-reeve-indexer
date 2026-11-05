import dayjs from 'dayjs'

/** Truncates a hex hash/id for display, keeping enough of both ends to stay visually distinguishable. */
export const truncateHash = (value: string, headLength = 8, tailLength = 6): string =>
  value.length > headLength + tailLength + 1 ? `${value.slice(0, headLength)}…${value.slice(-tailLength)}` : value

/** Formats a Unix seconds timestamp (DocumentView.block_time) like the rest of the app's dayjs-based date formatting. */
export const formatBlockTime = (value: number | null | undefined): string => (value ? dayjs.unix(value).format('DD/MM/YYYY HH:mm') : '—')
