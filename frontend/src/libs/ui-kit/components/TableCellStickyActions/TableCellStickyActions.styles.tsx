import { styled } from 'styled-components'

import { TableCell } from 'libs/ui-kit/components/TableCell/TableCell.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors'

interface TableCellStickyActionsStyledProps {
  $background?: string
}

export const TableCellStickyActionsStyled = styled(TableCell)<TableCellStickyActionsStyledProps>`
  && {
    position: sticky;
    padding: ${({ theme }) => theme.spacing(0.5, 2)};
    right: 0;
    background: ${({ $background }) => ($background ? $background : paletteColors.neutral[100])};
  }
`
