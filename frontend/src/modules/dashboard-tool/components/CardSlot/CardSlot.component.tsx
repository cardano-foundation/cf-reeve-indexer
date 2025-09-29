import { Chart21 } from 'iconsax-react'
import { MouseEvent, useState } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { CardStyled, CardActionsStyled, CardContentStyled, IconStyled, MenuStyled, MenuItemStyled } from 'modules/dashboard-tool/components/CardSlot/CardSlot.styles.tsx'
import { useTemplateSlotContext } from 'modules/dashboard-tool/components/TemplateSlotContext/hooks/useTemplateSlotContext.ts'
import { SlotOption } from 'modules/dashboard-tool/types'

interface CardSlotProps {
  options: SlotOption[]
  size?: 'small' | 'medium' | 'large'
  onSelect: (event: MouseEvent<HTMLLIElement>) => void
}

export const CardSlot = ({ options, size, onSelect }: CardSlotProps) => {
  const { t } = useTranslations()

  const { name } = useTemplateSlotContext()

  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null)

  const handleClose = () => {
    setAnchorElement(null)
  }

  const handleSelect = (event: MouseEvent<HTMLLIElement>) => {
    onSelect(event)
    setAnchorElement(null)
  }

  const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget)
  }

  const isOpen = Boolean(anchorElement)

  return (
    <CardStyled $size={size}>
      <CardContentStyled>
        <IconStyled>
          <Chart21 size={24} variant="Bold" />
        </IconStyled>
        <CardActionsStyled>
          <ButtonSecondary
            aria-controls={isOpen ? 'dropdown-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isOpen ? 'true' : undefined}
            data-testid={`connect-data-button-${name.toLowerCase()}`}
            onClick={handleMenuToggle}
          >
            {t({ id: 'connectData' })}
          </ButtonSecondary>
          <MenuStyled anchorEl={anchorElement} id="dropdown-menu" open={isOpen} onClose={handleClose}>
            {options.map(({ id, label }) => (
              <MenuItemStyled key={id} id={id} onClick={handleSelect}>
                {label}
              </MenuItemStyled>
            ))}
          </MenuStyled>
        </CardActionsStyled>
      </CardContentStyled>
    </CardStyled>
  )
}
