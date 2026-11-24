import { colors } from 'libs/ui-kit/theme/colors.ts'

export const AVATAR_COLORS = [colors.yellow[300], colors.purple[300], colors.green[300], colors.blue[300]]

export const getAvatarColor = (index: number) => AVATAR_COLORS[Math.max(index, 0) % AVATAR_COLORS.length]
