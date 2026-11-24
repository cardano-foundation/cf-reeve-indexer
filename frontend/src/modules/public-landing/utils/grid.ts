export const getGridColumns = (count: number) => (count === 4 ? 2 : Math.min(count, 3))
