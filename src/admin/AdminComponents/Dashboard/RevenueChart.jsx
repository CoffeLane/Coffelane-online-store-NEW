import React, { useState, useMemo } from 'react';
import { Paper, Box, Typography, ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme} from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,Tooltip, ReferenceLine, ReferenceDot} from 'recharts';

const sampleData = [
  { time: '00:00', value: 120 },
  { time: '02:00', value: 320 },
  { time: '04:00', value: 260 },
  { time: '06:00', value: 1100 },
  { time: '08:00', value: 750 },
  { time: '10:00', value: 420 },
  { time: '12:00', value: 30 },
  { time: '14:00', value: 180 },
  { time: '16:00', value: 950 },
  { time: '18:00', value: 360 },
  { time: '20:00', value: 240 },
  { time: '22:00', value: 980 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const v = payload[0].value;
  return (
    <Box sx={{
      bgcolor: '#0f6b55',
      color: '#fff',
      p: { xs: '4px 8px', md: '6px 10px' },
      borderRadius: '8px',
      fontSize: { xs: 11, md: 13 },
      boxShadow: '0 6px 18px rgba(15,107,85,0.15)'
    }}>
      <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: '#fff', mb: 0.2 }}>${v}</Typography>
      <Typography sx={{ fontSize: { xs: 10, md: 11 }, opacity: 0.85 }}>{label}</Typography>
    </Box>
  );
}

export default function RevenueChartFancy({ data = sampleData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [range, setRange] = useState('Today'); 
  const [activePoint, setActivePoint] = useState({ index: 4, x: null }); 

  const handleRange = (_, val) => {
    if (val) setRange(val);

  };
  const maxY = useMemo(() => {
    const m = Math.max(...data.map(d => d.value));
    const base = Math.ceil(m / 200) * 200;
    return base || 1000;
  }, [data]);

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: { xs: 2, md: 0 }, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, fontWeight: 600, mb: 1 }}>Revenue</Typography>
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700 }}>USDT 7,852K</Typography>
          <Typography sx={{ color: '#02715C', mt: 1, mb: 1, fontSize: { xs: 12, md: 14 } }}>▲ 2.1% vs yesterday</Typography>
          <Typography sx={{ color: '#999', fontSize: { xs: 11, md: 13 } }}>Sales from 1-7 Sep, 2025</Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <ToggleButtonGroup
            value={range}
            exclusive
            onChange={handleRange}
            size="small"
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: 'none',
              display: 'flex',
              flexWrap: 'nowrap',
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                border: '1px solid #DDD',
                px: { xs: 0.8, md: 1.3 },
                py: { xs: 0.4, md: 0.4 },
                fontSize: { xs: 10, md: 13 },
                color: '#333',
                whiteSpace: 'nowrap'
              },
              '& .Mui-selected': {
                bgcolor: '#E9ECEB',
                borderColor: '#CCC'
              }
            }}
          >
            <ToggleButton value="Today">Today</ToggleButton>
            <ToggleButton value="Week">Week</ToggleButton>
            <ToggleButton value="Month">Month</ToggleButton>
            <ToggleButton value="Year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ height: { xs: 180, md: 220 }, mt: { xs: 1, md: 2 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: isMobile ? 10 : 20, right: isMobile ? 10 : 30, left: isMobile ? -10 : 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setActivePoint({ index: state.activeTooltipIndex, x: state.chartX });
              } else {
                setActivePoint(prev => ({ ...prev, x: null }));
              }
            }}
            onMouseLeave={() => setActivePoint(prev => ({ ...prev, x: null }))}
          >
            {}
            <defs>
              <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#02715C" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#02715C" stopOpacity={0}/>
              </linearGradient>

              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#02715C" floodOpacity="0.12"/>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E6E6E6" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: { xs: 10, md: 12 } }} />
            <YAxis domain={[0, maxY]} axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: { xs: 10, md: 12 } }} />

            {activePoint.index !== null && activePoint.x !== null && (
              <ReferenceLine
                x={data[activePoint.index].time}
                stroke="#02715C"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#0E6C59"
              strokeWidth={isMobile ? 3 : 6}
              fill="url(#fillGrad)"
              activeDot={null}
              dot={false}
              strokeLinecap="round"
              filter="url(#shadow)"
            />

            {activePoint.index !== null && activePoint.x !== null && (
              <>
                <ReferenceDot
                  x={data[activePoint.index].time}
                  y={data[activePoint.index].value}
                  r={6}
                  fill="#0E6C59"
                  stroke="#fff"
                  strokeWidth={2}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, alignItems: 'center', mt: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: { xs: 8, md: 10 }, height: { xs: 8, md: 10 }, borderRadius: '50%', bgcolor: '#0E6C59' }} />
          <Typography sx={{ fontSize: { xs: 11, md: 13 }, color: '#444' }}>This week</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: { xs: 8, md: 10 }, height: { xs: 8, md: 10 }, borderRadius: '50%', bgcolor: '#BDBDBD' }} />
          <Typography sx={{ fontSize: { xs: 11, md: 13 }, color: '#444' }}>Last Week</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

