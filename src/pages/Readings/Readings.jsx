import "./readings.css";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ref as databaseRef, get, onValue, remove, set } from "firebase/database";
import { db } from "../../firebase.";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export default function Readings() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [user, setUser] = useState({
        title: '',
        day: '',
        scripture: '',
        desc: ''
    });
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [dbUser, setDBUser] = useState({});
    
    useEffect(() => {
      firebaseGetAll();
    }, [user]);
  
    const handleChange = (e) => {
      setUser({ ...user, [e.target.name]: e.target.value });
    };
  
    function firebaseWrite(inputUser) {
      return new Promise((resolve, reject) => {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        const date = now.toISOString().slice(0,10).replace(/-/g,"");
        const time = now.toISOString().slice(11,19).replace(/:/g,"");
        const key= date+time;
        inputUser.key = key;
    
        // Set user in Firebase
        set(databaseRef(db, `admin/Scripture/${key}`), inputUser)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.error("Error during firebaseWrite:", error);
            reject(error);
          });
      });
    }
  
    function firebaseGetAll() {
      const usersRef = databaseRef(db, 'admin/Scripture');
      onValue(usersRef, (snapshot) => {
        const userArray = snapshot.val();
        setDBUser(userArray);
      });
    }
  
    function firebaseGet(key) {
      const userRef = databaseRef(db, `admin/Scripture/${key}`);
      onValue(userRef, (snapshot) => {
        const userValue = snapshot.val();
        setUser(userValue);
      });
    }
  
    function firebaseUpdate(inputUser) {
      const usersRef = databaseRef(db, 'admin/Scripture');
      onValue(usersRef, (snapshot) => {
        const userArray = snapshot.val();
        let updateOccurred = false; // Use a local variable to track the update status
        for (let obj in userArray) {
          if (userArray[obj].name === inputUser.name) {
            updateOccurred = true; // Update the local variable
            set(databaseRef(db, `admin/Scripture/${userArray[obj].key}`), inputUser);
            break;
          }
        }
    
        if (!updateOccurred) {
          window.alert("name Does not exist!");
          console.log("name Does not exist. Can't edit!", inputUser.name);
        }
      });
    }  
  
    async function firebaseDelete(key) {
      const dbRef = databaseRef(db, 'admin/Scripture/' + key);
    
      try {
        // Retrieve the user once
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const user = snapshot.val();
          setUser(user); 
    
          // Remove the object
          await remove(dbRef)
          .catch((error) => {
            console.error("Error during upload:", error);
          });
  
        } else {
          console.log("No user found at the specified reference.");
        }
      } catch (error) {
        console.log("Operation failed: " + error.message);
      }
    }
  
    function handleEdit(key){
      firebaseGet(key);
      setIsEditMode(true);
    }
  
    const handleDelete = (key) => {
      firebaseDelete(key);
    };
  
    const submit = async () => {
      try {
        // If you submit but there's an image
        if (user.name !== "") {
          isEditMode? await firebaseUpdate(user): await firebaseWrite(user);
          reset();
        } else {
          window.alert("Add a name!");
        }
      } catch (error) {
        console.error("Error during operation:", error);
      }
    };  
  
    const reset = () => {
      setUser({
        title: '',
        day: '',
        scripture: '',
        desc: ''
      });
      setIsEditMode(false);
    };
  
    const columns = [
      { field: "_id", headerName: "ID", width: 50 },
      { field: "title", headerName: "Title", width: 250 },
      { field: "day", headerName: "Day", width: 250 },
      { field: "scripture", headerName: "Scripture", width: 250 },
      { field: "desc", headerName: "Description", width: 250 },
      {
        field: "action",
        headerName: "Action",
        width: 150,
        renderCell: (params) => {
          return (
            <Box sx={{ display:'flex', justifyContent:'space-around' }}>
              <DeleteOutline
                className="productListDelete"
                sx={{ mr:'2em', cursor:'pointer' }}
                onClick={() => handleDelete(params.row.key)}
              />
              <Edit
                sx={{ cursor:'pointer' }}
                onClick={() => handleEdit(params.row.key)}/>
            </Box>
          );
        },
      },
    ];
  
    return (
      <Box className="productList" sx={{ overflowY:'scroll', height:'100vh', p:{xs:'2em 1em', sm:'2em 1em', md:'2em'}, background:'#dfdfdf'}}>
        <Typography>Weekly Scriptures</Typography>
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
                name="title"
                value={user?.title || ''}
                onChange={handleChange}
                sx={{ background:'#ededed' }}
            />
            <InputLabel id="demo-simple-select-label">Day</InputLabel>
            <Select
                id="outlined-helperText"
                value={user?.day || ''}
                name="day"
                label="Day of the Week"
                onChange={handleChange}
                sx={{ background:'#ededed' }}
            >
                {daysOfWeek.map((day, index) => (
                <MenuItem key={index} value={day}>
                    {day}
                </MenuItem>
                ))}
            </Select>
            <TextField
                id="outlined-helperText"
                label="Scripture"
                defaultValue=""
                variant="outlined"
                name="scripture"
                value={user?.scripture || ''}
                onChange={handleChange}
                sx={{ background:'#ededed' }}
            />
            <TextField
              id="outlined-multiline-static"
              label="Description"
              multiline
              rows={4}
              name="desc"
              variant="outlined"
              value={user?.desc || ''}
              onChange={handleChange}
              sx={{ background:'#ededed' }}
            />
          <Button variant="contained" component="span" onClick={submit} sx={{ mb:'4em' }}>
            Submit
          </Button>
        </Box>
        <DataGrid
          sx={{ mb: '5em', mt: '3em', background: '#ededed', height: '260px' }}
          rows={dbUser ? Object.values(dbUser) : []}
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
