import { AutocompleteRenderGroupParams } from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import { Fragment } from 'react'

import { ListItemStyled, ListStyled, ListSubheaderStyled } from 'libs/ui-kit/components/InputAutocompleteDropdownGroup/InputAutocompleteDropdownGroup.styles.tsx'

interface InputAutocompleteDropdownGroupProps extends AutocompleteRenderGroupParams {}

export const InputAutocompleteDropdownGroup = ({ children, key, group }: InputAutocompleteDropdownGroupProps) => {
  return (
    <Fragment key={key}>
      <ListSubheaderStyled>
        <Typography component="span" variant="subtitle2">
          {group}
        </Typography>
      </ListSubheaderStyled>
      <ListItemStyled>
        <ListStyled>{children}</ListStyled>
      </ListItemStyled>
    </Fragment>
  )
}
