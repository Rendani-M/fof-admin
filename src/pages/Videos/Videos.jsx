import "./videos.css";
import {  forwardRef, useEffect, useState } from "react";
import { Box, Button, LinearProgress, TextField, Typography } from "@mui/material";
import { ref as storageRef, getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
import { ref as databaseRef, onValue,  set } from "firebase/database";
import { app, db } from "../../firebase.";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Videos() {
    const [video, setVideo] = useState(null);
    const [videoDisplay, setVideoDisplay] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState(null);
    const [progress, setProgress] = useState(0);
    const [open, setOpen] = useState(false);
    
    useEffect(() => {
        if (data === null) {
          firebaseGet();
        }
    }, [data]);
  
    const handleChange = (e) => {
      setData({ ...data, [e.target.name]: e.target.value });
      setOpen(false);
    };
  
    const handleVideoChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        setVideo(e.target.files[0]);
        setVideoDisplay(URL.createObjectURL(e.target.files[0]));
      }
      setOpen(false);
    };
  
    const upload = () => {
      return new Promise((resolve, reject) => {
        setUploading(true);
        const storage = getStorage(app);
        const storageRefVar = storageRef(storage, `/videos/Videos`);
        
        const uploadTask = uploadBytesResumable(storageRefVar, video);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(progress));
          },
          (error) => {
            console.log(error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setData((prev) => {
                return { ...prev, video: downloadURL };
              });
              resolve(downloadURL);
            });
          }
        );
      });
    };
  
    function firebaseWrite(inputData) {
      return new Promise((resolve, reject) => {
        // const now = new Date();
        // now.setHours(now.getHours() + 2);
        // const date = now.toISOString().slice(0,10).replace(/-/g,"");
        // const time = now.toISOString().slice(11,19).replace(/:/g,"");
        // const key= date+time;
        // inputData.key = key;
    
        // Set data in Firebase
        set(databaseRef(db, `admin/Videos`), inputData)
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
      const dataRef = databaseRef(db, `admin/Videos`);
      onValue(dataRef, (snapshot) => {
        const dataValue = snapshot.val();
        dataValue === null? 
        setData({
          title: '',
          video: '',
          desc: ''
        })
        :
        setData(dataValue);
        setVideoDisplay(dataValue?.video || null);
      });
    }
  
    const submit = async () => {
      try {
        // If you submit but there's an image
        if (video !== null && data.title!=="") {
          await upload(data)
          .then((downloadURL) => {
            data.video= downloadURL;
            firebaseWrite(data);
          })
          .catch((error) => {
            console.error("Error during upload:", error);
          });
        } else if (data.title !== "") {
          await firebaseWrite(data);
        } else {
          window.alert("Add a title!");
        }

        handleSuccess();
      } catch (error) {
        console.error("Error during operation:", error);
      }
    }

    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
    };

    const handleSuccess=()=>{
      setUploading(false);
      setOpen(true);
    }
  
    return (
      <Box className="productList" sx={{ overflowY:'scroll', height:'100vh', p:{xs:'2em 1em', sm:'2em 1em', md:'2em'}, background:'#dfdfdf'}}>
        <Typography>Videos</Typography>
        <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            Video Saved Successfully!
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
                label="Title"
                defaultValue=""
                variant="outlined"
                name="title"
                value={data?.title || ''}
                onChange={handleChange}
                sx={{ background:'#ededed' }}
            />

          {videoDisplay ? 
            <video src={videoDisplay} style={{maxWidth: '100%', height: 200, objectFit: 'contain'}} controls /> : 
            <Box sx={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed gray' }}>
                No video selected
            </Box>
            }
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em', m:'1em 0' }}>
            <input
                accept="video/*"
                id="contained-button-file"
                type="file"
                hidden
                name="video"
                onChange={handleVideoChange}
            />
            <label htmlFor="contained-button-file">
              <Button variant="contained" component="span" sx={{ display:{xs:'none', sm:'block'} }}>
                Upload Video
              </Button>
              <Button variant="contained" size="small" component="span" sx={{ display:{xs:'block', sm:'none'}, fontSize:'10px' }}>
                Upload Video
              </Button>
            </label>
            <Box component="span" sx={{ fontSize: '0.875rem' }}>No file chosen</Box>
          </Box>

          <TextField
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={4}
            name="desc"
            variant="outlined"
            value={data?.desc || ''}
            onChange={handleChange}
            sx={{ background:'#ededed' }}
          />
          <Box sx={{ mb:'4em', display:'flex', justifyContent:'flex-end' }}>
              <Button variant="contained" sx={{ mb:'0.5em' }} component="span" onClick={submit}>
                  Submit
              </Button>
              <div className="progress">
                  {uploading && (
                  <>
                      <LinearProgress variant="determinate" value={progress} />
                      <span>{progress}% Completed</span>
                  </>
                  )}
              </div>
          </Box>
          
        </Box>
      </Box>
    );
  }
