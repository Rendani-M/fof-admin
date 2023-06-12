import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CalendarToday, LocationSearching, MailOutline, PermIdentity, PhoneAndroid, Publish } from "@mui/icons-material";
import "./user.css";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { makeRequest } from "../../axios";
import app from "../../firebase";

export default function User() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [update, setUpdate] = useState(false);
  const [imgPerc, setImgPerc] = useState(0);
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    profilePic: "",
  });

  //getting the user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch the movie information using the movie ID
        const res = await makeRequest.get(`/users/find/${userId}`); // Call the getMovie function with the movie ID and dispatch
        setUser(res.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchUser();
  }, [userId]);

  useEffect(() => {
    setInputs({
      username: user?.username || "",
      email: user?.email || "",
      profilePic: user?.profilePic || "",
    });
  }, [user]);

  const handleChange = (e) => {
      setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const field = e.target.name;
    setInputs((prev) => ({ ...prev, [field]: file }));
  };

  const handleUpdate = async (e) => {
    try {

      const updatedUser = await makeRequest.put(`/users/${userId}`, inputs, {
        headers: {
          token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
        },
      }); 
      
      setUser(updatedUser.data);
      setUpdate(false);
      setInputs((prevInputs) => ({
        ...prevInputs,
        profilePic: null,
      }));

      alert("User updated successfully!");
    } catch (error) {
      console.log(error);
      alert("Failed to update user.");
    }
  };

  const handleFileUpload = (file, field) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done for ${field}`);
          setImgPerc(Math.round(progress));
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log(`${field} available at:`, downloadURL);
              setInputs((prevInputs) => ({ ...prevInputs, [field]: downloadURL }));
              resolve();
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        }
      );
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
  
    try {
      if (inputs.profilePic && inputs.profilePic instanceof File) {
        await handleFileUpload(inputs.profilePic, 'profilePic');
      }
      setUpdate(true);
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    
    if(update){
      handleUpdate();
    }
  }, [inputs, update]);

  return (
    <div className="user">
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <Link to="/newUser">
          <button className="userAddButton">Create</button>
        </Link>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <img
              src={inputs.profilePic? inputs.profilePic: 'https://toppng.com/uploads/preview/app-icon-set-login-icon-comments-avatar-icon-11553436380yill0nchdm.png'}
              alt=""
              className="userShowImg"
            />
            <div className="userShowTopTitle">
              <span className="userShowUsername">{inputs?.username}</span>
              <span className="userShowUserTitle">Active</span>
            </div>
          </div>
          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentity className="userShowIcon" />
              <span className="userShowInfoTitle">{inputs?.username}</span>
            </div>
            <div className="userShowInfo">
              <CalendarToday className="userShowIcon" />
              <span className="userShowInfoTitle">10.12.1999</span>
            </div>
            <span className="userShowTitle">Contact Details</span>
            <div className="userShowInfo">
              <PhoneAndroid className="userShowIcon" />
              <span className="userShowInfoTitle">+1 123 456 67</span>
            </div>
            <div className="userShowInfo">
              <MailOutline className="userShowIcon" />
              <span className="userShowInfoTitle">{inputs?.email}</span>
            </div>
            <div className="userShowInfo">
              <LocationSearching className="userShowIcon" />
              <span className="userShowInfoTitle">New York | USA</span>
            </div>
          </div>
        </div>
        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <form className="userUpdateForm">
            <div className="userUpdateLeft">
              <div className="userUpdateItem">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder={inputs?.username}
                  className="userUpdateInput"
                  onChange={handleChange}
                />
              </div>
              <div className="userUpdateItem">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder={inputs?.username}
                  className="userUpdateInput"
                />
              </div>
              <div className="userUpdateItem">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  placeholder={inputs?.email}
                  className="userUpdateInput"
                  onChange={handleChange}
                />
              </div>
              <div className="userUpdateItem">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="+1 123 456 67"
                  className="userUpdateInput"
                />
              </div>
              <div className="userUpdateItem">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="New York | USA"
                  className="userUpdateInput"
                />
              </div>
            </div>
            <div className="userUpdateRight">
              <div className="userUpdateUpload">
                <img
                  className="userUpdateImg"
                  src={inputs.profilePic? inputs.profilePic : 'https://toppng.com/uploads/preview/app-icon-set-login-icon-comments-avatar-icon-11553436380yill0nchdm.png'}
                  alt=""
                />
                <label htmlFor="file">
                  <Publish className="userUpdateIcon" />
                </label>
                <input
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                  name="profilePic"
                  onChange={handleFileChange}
                />
              </div>
              <button className="userUpdateButton" onClick={handleUpload}>Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
