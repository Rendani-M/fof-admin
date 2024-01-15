import "./userList.css";
import { DataGrid } from "@mui/x-data-grid";
import {  useEffect, useState } from "react";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ref as databaseRef, get, onValue, remove, set } from "firebase/database";
import { db } from "../../firebase.";
const CryptoJS = require('crypto-js');

export default function UserList() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState({
    name: '',
    surname: '',
    password: ''
  });
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
      inputUser.status = process.env.REACT_APP_ADMIN_STATUS;
      inputUser.password = CryptoJS.AES.encrypt(
        inputUser.password,
        process.env.REACT_APP_SECRET_KEY
      ).toString()
  
      // Set user in Firebase
      set(databaseRef(db, `admin/Users/${key}`), inputUser)
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
    const usersRef = databaseRef(db, 'admin/Users');
    onValue(usersRef, (snapshot) => {
      const userArray = snapshot.val();
      setDBUser(userArray);
    });
  }

  function firebaseGet(key) {
    const userRef = databaseRef(db, `admin/Users/${key}`);
    onValue(userRef, (snapshot) => {
      const userValue = snapshot.val();
      const bytes = CryptoJS.AES.decrypt(userValue.password, process.env.REACT_APP_SECRET_KEY);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
      userValue.password= originalPassword;

      setUser(userValue);
    });
  }

  function firebaseUpdate(inputUser) {
    const usersRef = databaseRef(db, 'admin/Users');
    onValue(usersRef, (snapshot) => {
      const userArray = snapshot.val();
      let updateOccurred = false; // Use a local variable to track the update status
      for (let obj in userArray) {
        if (userArray[obj].name === inputUser.name) {
          updateOccurred = true; // Update the local variable
          set(databaseRef(db, `admin/Users/${userArray[obj].key}`), inputUser);
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
    const dbRef = databaseRef(db, 'admin/Users/' + key);
  
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
      name: '',
      surname: '',
      password: ''
    });
    setIsEditMode(false);
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 50 },
    { field: "name", headerName: "Name", width: 250 },
    { field: "surname", headerName: "Surname", width: 250 },
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
      <Typography>Users</Typography>
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
          label="Name"
          defaultValue=""
          variant="outlined"
          name="name"
          value={user.name || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Surname"
          defaultValue=""
          variant="outlined"
          name="surname"
          value={user.surname || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Password"
          name="password"
          variant="outlined"
          value={user.password || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <Button variant="contained" component="span" onClick={submit}>
          {isEditMode ? 'Save Changes' : 'Submit'}
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
