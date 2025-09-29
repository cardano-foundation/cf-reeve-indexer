import { Add, Minus } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { ListItemStyled, ListItemButtonStyled, ListItemIconStyled, ListItemTextStyled } from 'libs/layout-kit/components/ButtonNavSubItem/ButtonNavSubItem.styles.tsx'

interface ButtonNavSubItemProps {
  label: string
  route: string
  getCurrentPage: (route: string) => boolean
  onClick?: () => void
  isOpen?: boolean
}

export const ButtonNavSubItem = ({ label, route, onClick, getCurrentPage, isOpen }: ButtonNavSubItemProps) => {
  const isCurrentPage = getCurrentPage(route)

  return (
    <ListItemStyled>
      <ListItemButtonStyled onClick={onClick} selected={isCurrentPage} {...{ component: RouterLink, to: route }}>
        <ListItemIconStyled>{isOpen ? <Minus size={20} variant="Outline" /> : <Add size={20} variant="Outline" />}</ListItemIconStyled>
        <ListItemTextStyled primary={label} />
      </ListItemButtonStyled>
    </ListItemStyled>
  )
}
