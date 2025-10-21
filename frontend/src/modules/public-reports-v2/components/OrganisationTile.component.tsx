import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { chartColors } from 'libs/ui-kit/theme/colors';
import { Organisation } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi.types';

interface OrganisationTileProps {
  organisation?: Organisation;
  isLoading?: boolean;
}

export const OrganisationTile = ({ organisation, isLoading }: OrganisationTileProps) => {
  return (
    <Box
      sx={{
        minWidth: 260,
        maxWidth: 400,
        minHeight: 64,
        background: `linear-gradient(90deg, ${chartColors.blue[700]}, ${chartColors.cyan[600]})`,
        color: 'white',
        borderRadius: 2,
        p: 2.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
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
          <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 500, mb: 0.2 }}>Organisation</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{organisation.name}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Country: {organisation.country_code}</Typography>
        </>
      ) : (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>No organisation data</Typography>
      )}
    </Box>
  );
};
