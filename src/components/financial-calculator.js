import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import axios, { endpoints } from 'src/utils/axios';

const fetchFinancialFigures = async (token) => {
  try {
    const response = await axios.get(endpoints.figures.list, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial figures:', error);
    return null;
  }
};

const FinancialCalculator = ({ token }) => {
  const [data, setData] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [fromDate, setFromDate] = useState('2021-07');
  const [toDate, setToDate] = useState('2023-12');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFinancialFigures(token);
      if (data) {
        setData(data.data);
        setMetaData(data.meta);
      }
    };

    fetchData();
  }, [token]);

  const handleCalculate = () => {
    const fromYear = parseInt(fromDate.split('-')[0]);
    const fromMonth = parseInt(fromDate.split('-')[1]);
    const toYear = parseInt(toDate.split('-')[0]);
    const toMonth = parseInt(toDate.split('-')[1]);

    const filteredData = data.filter((item) => {
      const { yearPeriod, monthPeriod } = item.attributes;
      const itemDate = new Date(yearPeriod, monthPeriod - 1); // monthPeriod is 1-based
      const fromDate = new Date(fromYear, fromMonth - 1); // fromMonth is 1-based
      const toDate = new Date(toYear, toMonth - 1); // toMonth is 1-based
      return itemDate >= fromDate && itemDate <= toDate;
    });

    const total = filteredData
      .reduce((sum, item) => sum + item.attributes.totalAmount, 0)
      .toFixed(2);

    setTotalAmount(total);
  };

  return (
    <Container>
      <Typography variant="h6">Financial Calculator</Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="From"
          type="month"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          label="To"
          type="month"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <Button variant="contained" onClick={handleCalculate}>
          Calculate
        </Button>
      </Box>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Total Amount: {totalAmount}
      </Typography>
    </Container>
  );
};

export default FinancialCalculator;
