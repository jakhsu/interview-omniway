'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

import { useSettingsContext } from 'src/components/settings';
import axios, { endpoints } from 'src/utils/axios';
import { getRefreshToken } from 'src/auth/context/jwt/utils';

// ----------------------------------------------------------------------

export default function TwoView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Page Two </Typography>

      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6">Two View</Typography>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const response = await axios.get(endpoints.figures.list);
              console.log(response.data);
            } catch (error) {
              console.error('Error fetching two:', error);
            }
          }}
        >
          Fetch Two
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const { jwt, refreshToken } = getRefreshToken();
              console.log('jwt:', jwt);
              console.log('refreshToken:', refreshToken);
            } catch (error) {
              console.error('Error fetching two:', error);
            }
          }}
        >
          refresh token function
        </Button>
      </Box>
    </Container>
  );
}
