import "./service.css";
import { DataGrid } from "@mui/x-data-grid";
import {  useEffect, useState } from "react";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { Box, Button, LinearProgress, TextField, Typography } from "@mui/material";
import { ref as storageRef, getDownloadURL, getStorage, uploadBytesResumable, deleteObject } from "firebase/storage";
import { ref as databaseRef, get, onValue, remove, set } from "firebase/database";
import { app, db } from "../../firebase.";

export default function Service() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [img, setImg] = useState(null);
  const [imgDisplay, setImgDisplay] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState({
    title: '',
    img: '',
    desc: ''
  });
  const [dbData, setDBData] = useState({});
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    firebaseGetAll();
  }, [data]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg(e.target.files[0]);
      setImgDisplay(URL.createObjectURL(e.target.files[0]));
    }
  };

  const upload = (data) => {
    return new Promise((resolve, reject) => {
      setUploading(true);
      const storage = getStorage(app);
      const storageRefVar = storageRef(storage, `/img/Service/${data.title}`);
      
      const uploadTask = uploadBytesResumable(storageRefVar, img);
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
              return { ...prev, img: downloadURL };
            });
            resolve(downloadURL);
          });
        }
      );
    });
  };

  function firebaseWrite(inputData) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      now.setHours(now.getHours() + 2);
      const date = now.toISOString().slice(0,10).replace(/-/g,"");
      const time = now.toISOString().slice(11,19).replace(/:/g,"");
      const key= date+time;
      inputData.key = key;
  
      // Set data in Firebase
      set(databaseRef(db, `admin/Service/${key}`), inputData)
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
    const usersRef = databaseRef(db, 'admin/Service');
    onValue(usersRef, (snapshot) => {
      const dataArray = snapshot.val();
      setDBData(dataArray);
    });
  }

  function firebaseGet(key) {
    const dataRef = databaseRef(db, `admin/Service/${key}`);
    onValue(dataRef, (snapshot) => {
      const dataValue = snapshot.val();
      setData(dataValue);
      setImgDisplay(dataValue.img)
    });
  }

  function firebaseUpdate(inputData) {
    const usersRef = databaseRef(db, 'admin/Service');
    onValue(usersRef, (snapshot) => {
      const dataArray = snapshot.val();
      let updateOccurred = false; // Use a local variable to track the update status
      for (let obj in dataArray) {
        if (dataArray[obj].title === inputData.title) {
          updateOccurred = true; // Update the local variable
          set(databaseRef(db, `admin/Service/${dataArray[obj].key}`), inputData);
          break;
        }
      }
  
      if (!updateOccurred) {
        window.alert("Title Does not exist!");
        console.log("Title Does not exist. Can't edit!", inputData.title);
      }
    });
  }  

  async function firebaseDelete(key) {
    const dbRef = databaseRef(db, 'admin/Service/' + key);
  
    try {
      // Retrieve the data once
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setData(data); 
  
        // Remove the object
        await remove(dbRef)
        .then(() => {
          if(data.img){
            return StorageDelete(data)
          }
        })
        .catch((error) => {
          console.error("Error during upload:", error);
        });

      } else {
        console.log("No data found at the specified reference.");
      }
    } catch (error) {
      console.log("Operation failed: " + error.message);
    }
  }

  function StorageDelete(data){
    const storage = getStorage(app);
    const desertRef = storageRef(storage, `/img/Service/${data.title}`);

    deleteObject(desertRef).then(() => {
    }).catch((error) => {
      console.log(error);
    });
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
      if (img !== null && data.title!=="") {
        await upload(data)
        .then((downloadURL) => {
          data.img= downloadURL;
          return isEditMode?firebaseUpdate(data): firebaseWrite(data);
        })
        .then(() => {
          reset();
        })
        .catch((error) => {
          console.error("Error during upload:", error);
        });
      } else if (data.title !== "") {
        isEditMode? await firebaseUpdate(data): await firebaseWrite(data);
        reset();
      } else {
        window.alert("Add a title!");
      }
    } catch (error) {
      console.error("Error during operation:", error);
    }
  };  

  const reset = () => {
    setImgDisplay(null);
    setImg(null);
    setData({
      title: '',
      img: '',
      desc: ''
    });
    setIsEditMode(false);
    setUploading(false);
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 50 },
    { field: "title", headerName: "title", width: 250 },
    { field: "desc", headerName: "description", width: 250 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <Box sx={{ display:'flex', justifyContent:'space-around' }}>
            <DeleteOutline
              className="productListDelete"
              sx={{ mr:'2em' }}
              onClick={() => handleDelete(params.row.key)}
            />
            <Edit
              onClick={() => handleEdit(params.row.key)}/>
          </Box>
        );
      },
    },
  ];

  return (
    <Box className="productList" sx={{ overflowY:'scroll', height:'100vh', p:{xs:'2em 1em', sm:'2em 1em', md:'2em'}, background:'#dfdfdf'}}>
      <Typography>Service</Typography>
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
          value={data.title || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        {imgDisplay ? <img src={imgDisplay} alt="Selected"  style={{maxWidth: '100%', height: 200, objectFit: 'contain'}} /> : <Box sx={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed gray' }}>No image selected</Box>}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em', m:'1em 0' }}>
          <input
            accept="image/*"
            id="contained-button-file"
            type="file"
            hidden
            name="img"
            onChange={handleImageChange}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" component="span" sx={{ display:{xs:'none', sm:'block'} }}>
              Upload Image
            </Button>
            <Button variant="contained" size="small" component="span" sx={{ display:{xs:'block', sm:'none'}, fontSize:'10px' }}>
              Upload Image
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
          value={data.desc || ''}
          onChange={handleChange}
          sx={{ background:'#ededed' }}
        />
        <Button variant="contained" component="span" onClick={submit}>
          {isEditMode ? 'Save Changes' : 'Submit'}
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
  