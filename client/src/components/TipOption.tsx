import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { Favorite } from '@mui/icons-material';

interface Props {
  onTipChange: (amount: number) => void;
}

const TipOption: React.FC<Props> = ({ onTipChange }) => {
  const [selected, setSelected] = useState<number | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const tips = [0.50, 1.00, 2.00, 3.00];

  const handleSelect = (amount: number) => {
    if (selected === amount) {
      setSelected(null);
      onTipChange(0);
    } else {
      setSelected(amount);
      onTipChange(amount);
    }
  };

  const handleCustom = (value: string) => {
    setCustomAmount(value);
    setSelected('custom');
    onTipChange(parseFloat(value) || 0);
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: '#fcf5f6', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Favorite sx={{ color: '#b03160', fontSize: 18 }} />
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.9rem' }}>Add a tip for the team</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {tips.map(amount => (
          <Button
            key={amount}
            size="small"
            variant={selected === amount ? 'contained' : 'outlined'}
            onClick={() => handleSelect(amount)}
            sx={{
              borderRadius: '100px', textTransform: 'none', fontSize: '0.85rem', minWidth: 60,
              ...(selected === amount ? { bgcolor: '#b03160' } : { borderColor: '#d4859a', color: '#b03160' })
            }}
          >
            £{amount.toFixed(2)}
          </Button>
        ))}
        <TextField
          size="small"
          placeholder="Other"
          value={customAmount}
          onChange={(e) => handleCustom(e.target.value)}
          sx={{ width: 80 }}
          inputProps={{ style: { textAlign: 'center' } }}
        />
      </Box>
    </Box>
  );
};

export default TipOption;
