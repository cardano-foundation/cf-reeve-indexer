import { Box, Typography } from 'features/mui/base'
import { useTheme } from '@mui/material'
import { Organisation } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi.types';

interface OrganisationTileProps {
  organisation?: Organisation;
  isLoading?: boolean;
}

export const OrganisationTile = ({ organisation, isLoading }: OrganisationTileProps) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: 600,
        minHeight: 64,
        color: theme.palette.text.primary,
        borderRadius: '0.5rem',
        background: theme.palette.background.default,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 0.5,
      }}
    >
      {isLoading ? (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>Loading organisation...</Typography>
      ) : organisation ? (
        <>
          <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 500, mb: 0.2 }}>Organisation: <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{organisation.name}</Typography></Typography>
        </>
      ) : (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>No organisation data</Typography>
      )}
    </Box>
  );
};
