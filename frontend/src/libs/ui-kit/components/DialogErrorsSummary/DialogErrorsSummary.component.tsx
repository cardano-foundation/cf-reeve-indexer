import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { TickCircle } from 'iconsax-react'
import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonClose } from 'libs/ui-kit/components/ButtonClose/ButtonClose.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { ErrorDetail, WarningDetail } from 'modules/organization-setup/hooks/useOrganizationSetupForm.ts'

const isWarningDetail = (error: ErrorDetail | WarningDetail): error is WarningDetail => {
  return (error as WarningDetail).detail !== undefined && (error as WarningDetail).row !== undefined
}

interface DialogErrorsSummaryProps {
  errors: ErrorDetail[] | WarningDetail[] | null
  onCancel?: () => void
  isOpen: boolean
}

export const DialogErrorsSummary = ({ errors = [], onCancel, isOpen }: DialogErrorsSummaryProps) => {
  const [isCopied, setIsCopied] = useState(false)

  const timeoutId = useRef<number | null>(null)

  const { t } = useTranslations()

  const theme = useTheme()

  const renderMessage = (error: ErrorDetail | WarningDetail) => (isWarningDetail(error) ? t({ id: 'errorDetailMessage' }, { detail: error.detail, row: error.row }) : error.detail)

  const clipboardText = errors?.map(renderMessage).join('\n') ?? ''

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error)
    }
  }

  const handleCopy = async () => {
    await handleCopyToClipboard(clipboardText)
    setIsCopied(true)
  }

  useEffect(() => {
    if (isCopied) {
      timeoutId.current && window.clearTimeout(timeoutId.current)
      timeoutId.current = window.setTimeout(() => {
        setIsCopied(false)
      }, 3000)
    }

    return () => {
      timeoutId.current && window.clearTimeout(timeoutId.current)
    }
  }, [isCopied])

  return (
    <Dialog aria-label="dialog-alert-title" maxWidth="sm" open={isOpen} onClose={onCancel} fullWidth>
      <Box alignItems="center" display="flex" justifyContent="space-between" pt={2} pr={2} pb={1} pl={3}>
        <DialogTitle id="dialog-alert-title" sx={{ p: 0 }}>
          {t({ id: 'dialogErrorsSummaryTitle' })}
        </DialogTitle>
        <ButtonClose onClick={onCancel} />
      </Box>
      <DialogContent>
        <List sx={{ p: 0 }}>
          {errors?.map((error) => (
            <ListItem key={isWarningDetail(error) ? error.row : error.title} sx={{ p: '12px 0' }}>
              {renderMessage(error)}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <ButtonSecondary startIcon={isCopied ? <TickCircle color={theme.palette.success.dark} size={24} variant="Outline" /> : undefined} onClick={handleCopy}>
          {t({ id: isCopied ? 'copied' : 'copyErrorDetails' })}
        </ButtonSecondary>
      </DialogActions>
    </Dialog>
  )
}
