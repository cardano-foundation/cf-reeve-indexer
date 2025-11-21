import { Fragment } from 'react'

import { VirtualizedDropdownList } from 'features/common'
import { Autocomplete, Box, Checkbox, Chip, TextField, Typography } from 'features/mui/base'

import { ListItemGroupedStyled, ListItemStyled, ListStyled, ListSubheaderStyled, PaperStyled } from './combobox.styles'
import type { ComboboxProps } from './combobox.types'

export const Combobox = <Multiple extends boolean | undefined, DisableClearable extends boolean | undefined, FreeSolo extends boolean | undefined>({
  limitTags,
  options,
  textField,
  value,
  onChange,
  multiple,
  isGroupRendered,
  ...props
}: ComboboxProps<Multiple, DisableClearable, FreeSolo>) => {
  return (
    <Autocomplete
      options={options}
      slotProps={{
        listbox: {
          component: VirtualizedDropdownList,
          sx: {
            maxHeight: '11.25rem',
            padding: 0
          }
        },
        paper: {
          component: PaperStyled
        }
      }}
      getLimitTagsText={(more) => <Chip label={`+${more}`} />}
      groupBy={isGroupRendered ? (option) => (option.group ? option.group : '') : undefined}
      renderGroup={({ children, key, group }) => (
        <Fragment key={key}>
          <ListSubheaderStyled>
            <Typography component="span" variant="subtitle2">
              {group}
            </Typography>
          </ListSubheaderStyled>
          <ListItemGroupedStyled>
            <ListStyled>{children}</ListStyled>
          </ListItemGroupedStyled>
        </Fragment>
      )}
      renderInput={(props) => <TextField {...props} {...textField} />}
      renderOption={({ key, ...props }, { description, label }, { selected }, { multiple }) => (
        <ListItemStyled key={key} $isMultiple={multiple} {...props}>
          {multiple && <Checkbox id={key} name={key} checked={selected} />}
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
      renderValue={
        multiple
          ? (selected, getItemProps, { limitTags }) => {
              if (typeof selected === 'string' || !Array.isArray(selected) || selected.length === 0) return null

              const count = selected.length

              return (
                <>
                  {selected.slice(0, limitTags).map((option, index) => {
                    // @ts-expect-error - key seems to be only available for multiple select
                    const { key, ...rest } = getItemProps({ index })

                    const label = typeof option === 'string' ? option : option.label

                    return <Chip key={key} {...{ label, ...rest }} sx={{ '&&': { maxWidth: limitTags ? '6.25rem' : 'initial' } }} />
                  })}
                  {limitTags && count > limitTags && <Chip label={`+${count - limitTags}`} />}
                </>
              )
            }
          : undefined
      }
      {...{ limitTags, value, onChange, multiple, ...props }}
    />
  )
}
