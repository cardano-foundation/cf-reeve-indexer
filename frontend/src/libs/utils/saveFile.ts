export const saveFile = (content: BlobPart, fileName: string, mediaType: string) => {
  const blob = new Blob([content], { type: mediaType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
