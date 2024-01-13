import "./user.css";
import {  forwardRef, useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ref as databaseRef, onValue, set } from "firebase/database";
import { db } from "../../firebase.";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { AuthContext } from "../../context/authContext/AuthContext";
const CryptoJS = require('crypto-js');

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function User() {
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { user } = useContext(AuthContext);

    const firebaseGet = useCallback(() => {
      const currentUserRef = databaseRef(db, `admin/Users/${user.key}`);
      onValue(currentUserRef, (snapshot) => {
        const currentUserValue = snapshot.val();
        const bytes = CryptoJS.AES.decrypt(currentUserValue.password, "dog");
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        currentUserValue.password= originalPassword;
    
        currentUserValue === null? 
        setCurrentUser({
            name: '',
            surname: '',
            password: ''
        })
        :
        setCurrentUser(currentUserValue);
      });
    }, [user.key]);
    
    useEffect(() => {
      if (currentUser === null) {
        firebaseGet();
      }
    }, [currentUser, firebaseGet]);
  
    const handleChange = (e) => {
      setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
      setOpen(false);
    };
  
    function firebaseWrite(inputCurrentUser) {
      return new Promise((resolve, reject) => {
        inputCurrentUser.password = CryptoJS.AES.encrypt(
            inputCurrentUser.password,
            "dog"
        ).toString();

        set(databaseRef(db, `admin/Users/${user.key}`), inputCurrentUser)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.error("Error during firebaseWrite:", error);
            reject(error);
          });
      });
    }
  
    const submit = async () => {
      try {
        // If you submit but there's an image
        if (currentUser.name !== "") {
          await firebaseWrite(currentUser);
        } else {
          window.alert("Add a name!");
        }
        handleSuccess();
      } catch (error) {
        console.error("Error during operation:", error);
      }
    }; 
  
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
    }; 
  
    const handleSuccess=()=>{
      setOpen(true);
    }
  
    return (
      <Box className="productList" sx={{ overflowY:'scroll', height:'100vh', p:'2em', background:'#dfdfdf'}}>
        <Typography>User</Typography>
          <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
              User Details Saved Successfully!
            </Alert>
          </Snackbar>
        <Box sx={{ display:'flex', 
                  flexDirection:'column', 
                  gap:'0.5em', 
                  py:'1em',  
                  // border:'1px solid red', 
                  p: 2, 
                  width:'50%',
                  borderRadius: 1 
                  }}>
          <TextField
          id="outlined-helperText"
          label="Name"
          defaultValue=""
          variant="outlined"
          name="name"
          value={currentUser?.name || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Surname"
          defaultValue=""
          variant="outlined"
          name="surname"
          value={currentUser?.surname || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Password"
          name="password"
          variant="outlined"
          value={currentUser?.password || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
          <Button variant="contained" component="span" onClick={submit} sx={{ mb:'4em' }}>
            Submit
          </Button>
        </Box>
      </Box>
    );
  }
