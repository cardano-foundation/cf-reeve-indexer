import { type DatePickerProps as DatePickerMUIProps } from '@mui/x-date-pickers/DatePicker'
import { type Dayjs } from 'dayjs'

export interface DatePickerProps extends DatePickerMUIProps<Dayjs> {}

export interface DatePickerStyledProps extends DatePickerMUIProps<Dayjs> {}
