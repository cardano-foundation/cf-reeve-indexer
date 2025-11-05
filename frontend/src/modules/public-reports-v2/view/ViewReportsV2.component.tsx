import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component'
import { DatumCard } from 'modules/public-reports-v2/components/DatumCard.component'
import { DatumHistoryChart } from 'modules/public-reports-v2/components/DatumHistoryChart.component'
import { RedeemerTable } from 'modules/public-reports-v2/components/RedeemerTable.component'
import { OrganisationTile } from 'modules/public-reports-v2/components/OrganisationTile.component'

export const ViewReportsV2 = () => {
  const theme = useTheme()
  const { contractApi } = backendReeveApi()

  const [selectedToken, setSelectedToken] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const tokenName = selectedToken

  // Helper for react-query refetch interval
  const refetchInterval = autoRefresh ? 30000 : false

  // Fetch available assets
  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['ASSETS'],
    queryFn: async () => {
      const result = await contractApi.getAssets()
      // Sort assets by name
      return result ? [...result].sort((a, b) => String(a).localeCompare(String(b))) : result
    },
    refetchInterval
  })

  // Preselect first asset when assets are loaded
  useEffect(() => {
    if (assets && assets.length > 0 && !selectedToken) {
      const firstAsset = assets[0] as string
      setSelectedToken(firstAsset)
    }
  }, [assets, selectedToken])

  const {
    data: currentDatum,
    isFetching: isFetchingCurrentDatum
  } = useQuery({
    queryKey: ['CONTRACT_CURRENT_DATUM', tokenName],
    queryFn: async () => contractApi.getCurrentDatum(tokenName),
    refetchInterval
  })

  const {
    data: datumHistory,
    isFetching: isFetchingDatumHistory
  } = useQuery({
    queryKey: ['CONTRACT_DATUM_HISTORY', tokenName],
    queryFn: async () => contractApi.getDatumHistory(tokenName),
    refetchInterval
  })

  const {
    data: currentRedeemer,
    isFetching: isFetchingRedeemer
  } = useQuery({
    queryKey: ['CONTRACT_CURRENT_REDEEMER', tokenName],
    queryFn: async () => contractApi.getCurrentRedeemer(tokenName),
    refetchInterval
  })

  const {
    data: organisation,
    isFetching: isFetchingOrganisation
  } = useQuery({
    queryKey: ['CONTRACT_ORGANISATION', tokenName],
    queryFn: async () => contractApi.getOrganisationByAssetName(tokenName),
    enabled: !!tokenName,
    refetchInterval
  })

  const handleTokenChange = (token: string) => {
    setSelectedToken(token)
  }

  return (
    <>
      <LayoutPublic.Header isPublic>
        <LayoutPublic.Header.Details
          description="Interactive dashboard for viewing contract data, datum history, and redeemer information"
          title="Contract Reports V2"
        />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              background: theme.palette.background.paper,
              p: 2,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              flex: 1,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="token-select-label">Select Asset</InputLabel>
              <Select
                labelId="token-select-label"
                id="token-select"
                value={selectedToken}
                label="Select Asset"
                onChange={(e) => handleTokenChange(e.target.value)}
                disabled={isLoadingAssets}
                endAdornment={
                  isLoadingAssets ? (
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                  ) : null
                }
              >
                {assets?.map((asset) => (
                  <MenuItem key={asset as string} value={asset as string}>
                    {asset as string}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <OrganisationTile organisation={organisation} isLoading={isFetchingOrganisation} />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <DatumCard data={currentDatum} isLoading={isFetchingCurrentDatum} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DatumHistoryChart data={datumHistory || []} isLoading={isFetchingDatumHistory} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RedeemerTable data={currentRedeemer} isLoading={isFetchingRedeemer} />
          </Grid>
        </Grid>
      </LayoutPublic.Main>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={() => setAutoRefresh((v) => !v)}
              size="small"
              color="primary"
            />
          }
          label={<span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>Auto-Refresh alle 30s</span>}
          sx={{ userSelect: 'none', opacity: 0.7 }}
        />
      </Box>
    </>
  )
}
