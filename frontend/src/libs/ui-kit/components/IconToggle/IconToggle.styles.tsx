import { ArrowDown2, ArrowUp2 } from 'iconsax-react'
import { styled } from 'styled-components'

interface IconProps {
  $isCurrentPage: boolean
}

export const ArrowDownIcon = styled(({ ...props }) => <ArrowDown2 size={18} variant="Outline" {...props} />)<IconProps>`
  && {
    color: ${({ theme, $isCurrentPage }) => ($isCurrentPage ? theme.palette.text.primary : theme.palette.action.active)};
  }
`

export const ArrowUpIcon = styled(({ ...props }) => <ArrowUp2 size={18} variant="Outline" {...props} />)<IconProps>`
  && {
    color: ${({ theme, $isCurrentPage }) => ($isCurrentPage ? theme.palette.text.primary : theme.palette.action.active)};
  }
`
