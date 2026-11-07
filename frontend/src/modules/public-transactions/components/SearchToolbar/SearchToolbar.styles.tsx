import { DocumentDownload } from 'iconsax-react'
import { styled } from 'styled-components'

import { ICONSAX_NAMES, IconsaxIcon, type Icon } from 'features/iconsax'
import { ToggleButton } from 'features/mui/base'

export const ColumnsToggleButtonStyled = styled(ToggleButton)`
  &&[aria-expanded='true'] {
    background-color: ${({ theme }) => theme.palette.action.selected};
  }
`

export const ComingSoonToggleButtonStyled = styled(ToggleButton)`
  && {
    opacity: 0.5;
    cursor: default;
  }
`

export const SearchIconStyled = styled((props: Icon) => <IconsaxIcon name={ICONSAX_NAMES.SEARCH_NORMAL1} size={24} variant="Outline" {...props} />)(
  ({ theme }) => `
  && {
    display: flex;
    margin: ${theme.spacing(0, 0.5, 0, 0)};
    flex: 1 0 auto;
    color: ${theme.palette.primary.light};
  }
`
)

export const SortIconStyled = styled(() => <IconsaxIcon name={ICONSAX_NAMES.SORT} size={24} variant="Outline" />)``

export const ColumnsIconStyled = styled(() => <IconsaxIcon name={ICONSAX_NAMES.GRID_EDIT} size={24} variant="Outline" />)``

export const ExportIconStyled = styled(() => <DocumentDownload size={24} variant="Outline" />)``
