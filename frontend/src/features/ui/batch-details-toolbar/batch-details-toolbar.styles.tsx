import { SearchNormal1, Sort, type IconProps } from 'iconsax-react'
import { styled } from 'styled-components'

export const SearchIconStyled = styled((props: IconProps) => <SearchNormal1 size={24} variant="Outline" {...props} />)(
  ({ theme }) => `
  && {
    display: flex;
    margin: ${theme.spacing(0, 0.5, 0, 0)};
    flex: 1 0 auto;
    color: ${theme.palette.primary.light};
  }
`
)

export const SortIconStyled = styled(() => <Sort size={24} variant="Outline" />)``
