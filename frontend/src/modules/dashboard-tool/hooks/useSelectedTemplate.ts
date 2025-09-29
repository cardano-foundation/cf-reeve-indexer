import { useCallback, useState } from 'react'

import { Template } from 'modules/dashboard-tool/types'

export const useSelectedTemplate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const handleSelectedTemplate = useCallback(
    (template: Template) => {
      setSelectedTemplate(template)
    },
    [setSelectedTemplate]
  )

  const handleResetSelectedTemplate = useCallback(() => {
    setSelectedTemplate(null)
  }, [setSelectedTemplate])

  return {
    selectedTemplate,
    handleSelectedTemplate,
    handleResetSelectedTemplate
  }
}
