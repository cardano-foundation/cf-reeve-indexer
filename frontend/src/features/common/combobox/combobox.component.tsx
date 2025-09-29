import { Autocomplete, Box, Checkbox, Chip, TextField, Typography } from 'features/mui/base'

import { ListItemStyled, PaperStyled } from './combobox.styles'
import type { ComboboxProps } from './combobox.types'

export const Combobox = ({ limitTags, options, textField, ...props }: ComboboxProps) => {
  return (
    <Autocomplete
      options={options}
      slots={{
        paper: PaperStyled
      }}
      slotProps={{
        listbox: {
          sx: (theme) => ({
            maxHeight: '11.25rem',
            padding: theme.spacing(1)
          })
        }
      }}
      getLimitTagsText={(more) => <Chip label={`+${more}`} />}
      renderInput={(props) => <TextField {...props} {...textField} />}
      renderOption={({ key, ...props }, { description, label }, { selected }) => (
        <ListItemStyled key={key} {...props}>
          <Checkbox checked={selected} />
          <Box overflow="hidden">
            <Typography color="textPrimary" variant="body1">
              {label}
            </Typography>
            {description && (
              <Typography color="textSecondary" variant="body2" noWrap>
                {description}
              </Typography>
            )}
          </Box>
        </ListItemStyled>
      )}
      renderValue={(selected, getItemProps) => {
        if (selected.length === 0) return null

        const count = selected.length

        return (
          <>
            {selected.slice(0, limitTags).map((option, index) => {
              const { key, ...rest } = getItemProps({ index })

              const label = typeof option === 'string' ? option : option.label

              return <Chip key={key} {...{ label, ...rest }} sx={{ '&&': { maxWidth: limitTags ? '6.25rem' : 'initial' } }} />
            })}
            {limitTags && count > limitTags && <Chip label={`+${count - limitTags}`} />}
          </>
        )
      }}
      multiple
      {...{ limitTags, ...props }}
    />
  )
}
