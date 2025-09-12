export const validateDefault = (event: InputEvent, valueRegex: RegExp) => {
  const dataRegex = new RegExp(/^[0-9.-]?$/)

  const value = (event.target as HTMLInputElement).value
  const start = (event.target as HTMLInputElement).selectionStart || 0
  const end = (event.target as HTMLInputElement).selectionEnd || 0
  const nextValue = value.slice(0, start) + (event.data ?? '') + value.slice(end)

  const isDeleteTypeEvent = event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward'
  const isInsertFromPasteEvent = event.inputType === 'insertFromPaste'
  const isDataValid = !value && event.data && (dataRegex.test(event.data) || valueRegex.test(event.data))
  const isNegativeValueValid = value === '-' && valueRegex.test(nextValue)
  const isDataAndValuesValid = event.data && dataRegex.test(event.data) && valueRegex.test(value) && valueRegex.test(nextValue)

  if (isDeleteTypeEvent || isDataValid || isNegativeValueValid) {
    return
  }

  if (isInsertFromPasteEvent && event.data && valueRegex.test(event.data)) {
    ;(event.target as HTMLInputElement).value = event.data
  }

  if (!isDataAndValuesValid) {
    event.preventDefault()
  }
}
