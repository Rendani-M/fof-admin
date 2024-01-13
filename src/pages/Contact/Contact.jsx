import "./contact.css";
import {  forwardRef, useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ref as databaseRef, onValue, set } from "firebase/database";
import { db } from "../../firebase.";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Contact() {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    zakariya_park: '',
    soweto_mofolo: '',
    rustervaal: '',
    facebook: '',
    youtube: '',
    instagram: ''
  });
  
  useEffect(() => {
    if (contact === null) {
      firebaseGet();
    }
  }, [contact]);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
    setOpen(false);
  };

  function firebaseWrite(inputContact) {
    return new Promise((resolve, reject) => {
      // Set contact in Firebase
      set(databaseRef(db, `admin/contacts`), inputContact)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error during firebaseWrite:", error);
          reject(error);
        });
    });
  }

  function firebaseGet() {
    const contactRef = databaseRef(db, `admin/contacts`);
    onValue(contactRef, (snapshot) => {
      const contactValue = snapshot.val();
      contactValue === null? 
      setContact({
        email: '',
        phone: '',
        whatsapp: '',
        zakariya_park: '',
        soweto_mofolo: '',
        rustervaal: '',
        facebook: '',
        youtube: '',
        instagram: ''
      })
      :
      setContact(contactValue);
    });
  }

  const submit = async () => {
    try {
      // If you submit but there's an image
      if (contact.name !== "") {
        await firebaseWrite(contact);
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
    <Box className="productList" sx={{ overflowY:'scroll', height:'100vh', p:{xs:'2em 1em', sm:'2em 1em', md:'2em'}, background:'#dfdfdf'}}>
      <Typography>Contacts</Typography>
        <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            Contact Details Saved Successfully!
          </Alert>
        </Snackbar>
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
          label="Email"
          defaultValue=""
          variant="outlined"
          name="email"
          value={contact.email || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Phone number"
          defaultValue=""
          variant="outlined"
          name="phone"
          value={contact.phone || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Whatsapp"
          name="whatsapp"
          variant="outlined"
          value={contact.whatsapp || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Zakariya Park"
          defaultValue=""
          variant="outlined"
          name="zakariya_park"
          value={contact.zakariya_park || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Soweto Mofolo"
          defaultValue=""
          variant="outlined"
          name="soweto_mofolo"
          value={contact.soweto_mofolo || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Rustervaal"
          name="rustervaal"
          variant="outlined"
          value={contact.rustervaal || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Facebook link"
          defaultValue=""
          variant="outlined"
          name="facebook"
          value={contact.facebook || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Youtube link"
          defaultValue=""
          variant="outlined"
          name="youtube"
          value={contact.youtube || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <TextField
          id="outlined-helperText"
          label="Instagram"
          name="instagram"
          variant="outlined"
          value={contact.instagram || ''}
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
