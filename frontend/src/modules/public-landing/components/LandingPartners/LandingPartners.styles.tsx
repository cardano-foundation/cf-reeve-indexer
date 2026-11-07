import Link from '@mui/material/Link'
import { styled } from 'styled-components'

import { opacityColors } from 'libs/ui-kit/theme/colors.ts'
import { HOVER_CAPABLE, MOTION_SAFE } from 'modules/public-landing/utils/animations.ts'

interface PartnerListStyledProps {
  $columns: number
}

export const PartnerListStyled = styled.ul<PartnerListStyledProps>`
  && {
    display: grid;
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing(1.5)};
    margin: 0;
    padding: 0;
    list-style: none;

    ${({ theme }) => theme.breakpoints.down('smw')} {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`

export const PartnerLinkStyled = styled(Link)`
  && {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};
    height: 100%;
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.palette.text.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.create(['border-color', 'background-color'], { duration: theme.transitions.duration.short })};

    ${HOVER_CAPABLE} {
      &:hover {
        border-color: ${({ theme }) => theme.palette.text.secondary};
        background-color: ${opacityColors.button[2]};
      }
    }

    ${MOTION_SAFE} {
      .MuiAvatar-root {
        transition: transform 0.3s ease;
      }
    }

    ${MOTION_SAFE} and (hover: hover) {
      &:hover .MuiAvatar-root {
        transform: rotate(-5deg) scale(1.1);
      }
    }
  }
`
