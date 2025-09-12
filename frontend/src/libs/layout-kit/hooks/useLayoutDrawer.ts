import { useCallback, useEffect, useState } from 'react'

import { DRAWER_TYPES, type DrawerType } from 'consts'
import { useLocationState, useMediaQueries } from 'hooks'

export const useLayoutDrawer = () => {
  const [drawerType, setDrawerType] = useState<DrawerType | null>(null)
  const [dialogType, setDialogType] = useState<DrawerType | null>(null)

  const { isMobile } = useMediaQueries()

  const { pathname } = useLocationState()

  const type = isMobile ? dialogType : drawerType

  const isFiltersDrawerOpen = type === DRAWER_TYPES.FILTERS
  const isInsightsDrawerOpen = type === DRAWER_TYPES.INSIGHTS
  const isDrawerOpen = isFiltersDrawerOpen || isInsightsDrawerOpen

  const handleCloseDrawer = useCallback(() => {
    isMobile ? setDialogType(null) : setDrawerType(null)
  }, [isMobile])

  const handleOpenDrawer = useCallback(
    (value: DrawerType) => {
      isMobile ? setDialogType(value) : setDrawerType(value)
    },
    [isMobile]
  )

  useEffect(() => {
    handleCloseDrawer()
  }, [pathname])

  return { type, handleCloseDrawer, handleOpenDrawer, isDrawerOpen, isFiltersDrawerOpen, isInsightsDrawerOpen }
}
