import Typography from '@mui/material/Typography'

interface StatisticsProps {
  value: string
}

export const Statistics = ({ value }: StatisticsProps) => {
  return (
    <Typography component="span" mt="auto" variant="h5">
      {value}
    </Typography>
  )
}
