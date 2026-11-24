import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import Pagination from '@mui/material/Pagination'
import { styled } from 'styled-components'

import { ICONSAX_NAMES, IconsaxIcon, type Icon } from 'features/iconsax'
import { opacityColors } from 'libs/ui-kit/theme/colors.ts'
import { LANDING_CARD_SHADOW } from 'modules/public-landing/components/LandingSection/LandingSection.styles.tsx'
import { HOVER_CAPABLE, MOTION_SAFE } from 'modules/public-landing/utils/animations.ts'

export const ToolbarStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 11rem;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};

    ${({ theme }) => theme.breakpoints.down('sm')} {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`

interface OrganisationGridStyledProps {
  $columns: number
  $pageRows: number | null
}

const getPageRows = (pageRows: number | null, columns: number) => (pageRows ? `grid-template-rows: repeat(${Math.ceil(pageRows / columns)}, 1fr);` : '')

export const OrganisationGridStyled = styled.ul<OrganisationGridStyledProps>`
  && {
    display: grid;
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
    ${({ $pageRows, $columns }) => getPageRows($pageRows, $columns)}
    gap: ${({ theme }) => theme.spacing(1.5)};
    margin: 0;
    padding: 0;
    list-style: none;

    ${({ theme }) => theme.breakpoints.down('smw')} {
      grid-template-columns: repeat(${({ $columns }) => Math.min($columns, 2)}, minmax(0, 1fr));
      ${({ $pageRows, $columns }) => getPageRows($pageRows, Math.min($columns, 2))}
    }

    ${({ theme }) => theme.breakpoints.down('sm')} {
      grid-template-columns: minmax(0, 1fr);
      ${({ $pageRows }) => getPageRows($pageRows, 1)}
    }
  }
`

export const OrganisationRowStyled = styled(Box)`
  && {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.palette.common.white};
  }
`

export const OrganisationCardStyled = styled(CardActionArea)`
  && {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};
    height: 100%;
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.palette.common.white};
    transition: ${({ theme }) => theme.transitions.create(['border-color', 'background-color'], { duration: theme.transitions.duration.short })};

    ${HOVER_CAPABLE} {
      &:hover {
        border-color: ${({ theme }) => theme.palette.text.secondary};
        background-color: ${opacityColors.button[2]};
      }
    }

    .MuiCardActionArea-focusHighlight {
      display: none;
    }

    &.Mui-focusVisible {
      outline: 2px solid ${({ theme }) => theme.palette.primary.main};
      outline-offset: 2px;
    }

    ${MOTION_SAFE} {
      .MuiAvatar-root {
        transition: transform 0.3s ease;
      }

      & > svg {
        transition: transform 0.2s ease;
      }
    }

    ${MOTION_SAFE} and (hover: hover) {
      &:hover .MuiAvatar-root {
        transform: rotate(-5deg) scale(1.1);
      }

      &:hover > svg {
        transform: translateX(3px);
      }
    }
  }
` as typeof CardActionArea

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

export const PaginationStyled = styled(Pagination)`
  && {
    .MuiPaginationItem-root {
      border: 1px solid transparent;
      border-radius: ${({ theme }) => theme.spacing(1)};
      color: ${({ theme }) => theme.palette.text.primary};
    }

    .MuiPaginationItem-root.Mui-selected {
      background: ${({ theme }) => theme.palette.common.white};
      border-color: ${({ theme }) => theme.palette.divider};
      box-shadow: ${LANDING_CARD_SHADOW};
    }
  }
`

interface EmptyStateStyledProps {
  $isCompact: boolean
}

export const EmptyStateStyled = styled(Box)<EmptyStateStyledProps>`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme, $isCompact }) => ($isCompact ? 0 : theme.spacing(4, 0))};
    text-align: center;

    ${({ theme }) => theme.breakpoints.down('smw')} {
      padding: ${({ theme }) => theme.spacing(4, 0)};
    }
  }
`

export const NoResultsStackStyled = styled(Box)`
  && {
    position: relative;
  }
`

export const RowOverlayStyled = styled(Box)`
  && {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    & > .MuiAlert-root {
      width: 100%;
      height: 100%;
      align-items: center;
    }
  }
`

export const NoResultsStyled = styled(Box)`
  && {
    position: absolute;
    inset: 0;
    container-type: size;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1, 2)};
    overflow: hidden;
    text-align: center;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};

    @container (max-height: 10rem) {
      & > svg {
        margin-bottom: ${({ theme }) => theme.spacing(-1)};
      }
    }

    @container (max-height: 6rem) {
      & > svg {
        display: none;
      }

      & > div {
        gap: ${({ theme }) => theme.spacing(0.25)};
      }
    }
  }
`
