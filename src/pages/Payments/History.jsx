import { Box, Typography, TextField } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from 'react';
import { ref as databaseRef, onValue } from "firebase/database";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { db } from '../../firebase.';

export default function History() {
    const [data, setData] = useState({
      title: '',
      img: '',
      desc: '',
      date: '',
      time: ''
    });
    const [dbData, setDBData] = useState({});
    
    useEffect(() => {
      firebaseGetAll();
    }, [data]);
  
    function firebaseGetAll() {
        const usersRef = databaseRef(db, 'admin/Payment/history');
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          let dataArray = [];
          for(let date in data){
            for(let time in data[date]){
              dataArray.push(data[date][time]);
            }
          }
          dataArray.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
          
          // Convert date format to 'yyyy-MMM-dd'
          dataArray = dataArray.map(item => {
            const date = new Date(item.date.slice(0, 4) + '-' + item.date.slice(4, 6) + '-' + item.date.slice(6, 8));
            const formattedDate = date.getFullYear() + '-' + date.toLocaleString('default', { month: 'long' }) + '-' + String(date.getDate()).padStart(2, '0');
            
            // Convert time format to 'HH-mm-ss'
            const formattedTime = item.time.slice(0, 2) + '-' + item.time.slice(2, 4) + '-' + item.time.slice(4, 6);
            
            return { ...item, date: formattedDate, time: formattedTime, originalDate: item.date, originalTime: item.time };
          });
          
          setDBData(dataArray);
        });
    }
      
  
    function firebaseGet(date, time) {
      const dataRef = databaseRef(db, `admin/Payment/history/${date}/${time}`);
      onValue(dataRef, (snapshot) => {
        const dataValue = snapshot.val();
        setData(dataValue);
      });
    }
  
    function handleView(formattedDate, formattedTime){
        // Convert formatted date back to original format 'yyyymmdd'
        const dateParts = formattedDate.split('-');
        const monthIndex = 'january february march april may june july august september october november december'.split(' ').indexOf(dateParts[1].toLowerCase());
        const originalDate = dateParts[0] + (monthIndex !== -1 ? (monthIndex + 1).toString().padStart(2, '0') : '') + dateParts[2];
    
        // Convert formatted time back to original format 'hhmmss'
        const originalTime = formattedTime.replace(/-/g, '');
        firebaseGet(originalDate, originalTime);
    }    
  
    const columns = [
      { field: "key", headerName: "ID", width: 50 },
      { field: "desc", headerName: "Title", width: 250 },
      { field: "amount", headerName: "Amount", width: 250 },
      { field: "date", headerName: "Date", width: 250 },
      { field: "time", headerName: "Time", width: 250 },
      {
        field: "action",
        headerName: "Action",
        width: 150,
        renderCell: (params) => {
          return (
              <VisibilityIcon
                sx={{ cursor:'pointer' }}
                onClick={() => handleView(params.row.date, params.row.time)}/>
          );
        },
      },
    ];
  
    return (
      <Box className="productList" sx={{ overflowY:'scroll', height:'100vh', p:{xs:'2em 1em', sm:'2em 1em', md:'2em'}, background:'#dfdfdf'}}>
        <Typography>Payment History</Typography>
        <Box sx={{ display:'flex', 
                  flexDirection:'column', 
                  gap:'0.5em', 
                  py:'1em',  
                  // border:'1px solid red', 
                  p: 2,  
                  width:{xs:'95%', sm:'80%', md:'50%'},
                  borderRadius: 1 
                  }}>
          <TextField
            id="outlined-helperText"
            label="Title"
            defaultValue=""
            variant="outlined"
            name="desc"
            value={data?.desc || ''}
            sx={{ background:'#ededed' }}
          />
          <TextField
            id="outlined-helperText"
            label="Amount"
            defaultValue=""
            variant="outlined"
            name="amount"
            value={data?.amount || ''}
            sx={{ background:'#ededed' }}
          />
          <TextField
            id="outlined-helperText"
            label="Date"
            defaultValue=""
            variant="outlined"
            name="date"
            value={data?.date || ''}
            sx={{ background:'#ededed' }}
          />
          <TextField
            id="outlined-helperText"
            label="Time"
            defaultValue=""
            variant="outlined"
            name="time"
            value={data?.time || ''}
            sx={{ background:'#ededed' }}
          />
        </Box>
        <DataGrid
          sx={{ mb: '5em', mt: '3em', background: '#ededed', height: '260px' }}
          rows={dbData ? Object.values(dbData) : []}
          columns={columns}
          getRowId={(row) => row.key}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 100]}
        />
      </Box>
    );
  }
