import React, { useState } from 'react';
import { Box, Typography, Button, TextField, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

interface Props {
  onScheduleChange: (scheduledFor: string | null) => void;
}

const ScheduleOrderPicker: React.FC<Props> = ({ onScheduleChange }) => {
  const [mode, setMode] = useState<'asap' | 'scheduled'>('asap');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleModeChange = (newMode: string) => {
    setMode(newMode as any);
    if (newMode === 'asap') {
      onScheduleChange(null);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date && newTime) {
      onScheduleChange(`${date}T${newTime}`);
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (newDate && time) {
      onScheduleChange(`${newDate}T${time}`);
    }
  };

  // Generate today and tomorrow dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AccessTime sx={{ color: '#b03160', fontSize: 20 }} />
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.95rem' }}>When do you want it?</Typography>
      </Box>

      <RadioGroup value={mode} onChange={(e) => handleModeChange(e.target.value)}>
        <FormControlLabel value="asap" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.9rem' }}>As soon as possible (~15 mins)</Typography>} />
        <FormControlLabel value="scheduled" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.9rem' }}>Schedule for later</Typography>} />
      </RadioGroup>

      {mode === 'scheduled' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, ml: 4 }}>
          <TextField type="date" size="small" value={date} onChange={(e) => handleDateChange(e.target.value)} inputProps={{ min: today, max: tomorrow }} label="Date" InputLabelProps={{ shrink: true }} />
          <TextField type="time" size="small" value={time} onChange={(e) => handleTimeChange(e.target.value)} inputProps={{ min: '12:00', max: '22:00', step: 900 }} label="Time" InputLabelProps={{ shrink: true }} />
        </Box>
      )}
    </Box>
  );
};

export default ScheduleOrderPicker;
