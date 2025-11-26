import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { CSV_FILE_TYPE, DEFAULT_FILE_SIZE } from 'libs/const/files.ts'
import { ButtonClose } from 'libs/ui-kit/components/ButtonClose/ButtonClose.component.tsx'
import {
  CardActionsStyled,
  CardContentStyled,
  CardStyled,
  CheckIconStyled,
  FileIconStyled,
  FormHelperTextStyled
} from 'libs/ui-kit/components/UploadFileResults/UploadFileResults.styles.tsx'
import { formatNumber } from 'libs/utils/format.ts'

interface UploadFileResultsProps {
  error?: string
  file: File
  fileSize?: number
  fileType?: string
  onClose: () => void
  isDisabled?: boolean
}

export const UploadFileResults = ({ error, file, fileSize = DEFAULT_FILE_SIZE, fileType = CSV_FILE_TYPE, onClose, isDisabled }: UploadFileResultsProps) => {
  const theme = useTheme()

  const hasError = Boolean(error)

  const isFileSizeValid = file.size < fileSize
  const isFileTypeValid = file.type.includes(fileType)

  return (
    <Box mt={2} width="100%">
      <CardStyled $hasError={hasError}>
        <CardContentStyled>
          <FileIconStyled />
          <Box minWidth={0} width="100%">
            <Typography color={theme.palette.text.primary} variant="body1" noWrap>
              {file.name}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="body2">
              {`${formatNumber(file.size / (1000 * 1000), { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MB`}
            </Typography>
          </Box>
          {isFileSizeValid && isFileTypeValid ? <CheckIconStyled /> : null}
        </CardContentStyled>
        <CardActionsStyled>
          <ButtonClose onClick={onClose} disabled={isDisabled} />
        </CardActionsStyled>
      </CardStyled>
      {error && <FormHelperTextStyled error={hasError}>{error}</FormHelperTextStyled>}
    </Box>
  )
}
