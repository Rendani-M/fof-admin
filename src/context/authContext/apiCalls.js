import { db } from "../../firebase.";
import { loginFailure, loginStart, loginSuccess, logoutAction } from "./AuthActions";
import { ref as databaseRef, onValue } from "firebase/database";
const CryptoJS = require('crypto-js');

let userData = {
  name: '',
  surname: '',
  password: ''
};

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    firebaseGet(user, dispatch);
  } catch (err) {
    dispatch(loginFailure());
  }
};

export const logout = async (dispatch) => {
  try {
    dispatch(logoutAction());
  } catch (err) {
    dispatch(loginFailure());
  }
};

function firebaseGet(user, dispatch) {
  const dataRef = databaseRef(db, `admin/Users`);
  onValue(dataRef, (snapshot) => {
    console.log("firebaseGet")
    const dataArray = snapshot.val();
    var isLoginSuccess= false;

    for(let dbUserkey in dataArray){
      let dbUser= dataArray[dbUserkey];
      // const bytes = CryptoJS.AES.decrypt(dbUser.password, "dog");
      // const originalPassword = bytes.toString(CryptoJS.enc.Utf8); 
      try {
        const bytes = CryptoJS.AES.decrypt(dbUser.password, process.env.REACT_APP_SECRET_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        if(user.name === dbUser.name && user.password === originalPassword){
        userData = {
          name: dbUser.name,
          surname: dbUser.surname,
          status: dbUser.status,
          key: dbUser.key
        };
        isLoginSuccess= true;
        console.log("found it", isLoginSuccess);
      }
      } catch (error) {
        console.error("Decryption error:", error);
      }
    }

    // console.log("isLoginSuccess", isLoginSuccess)
    if(isLoginSuccess){ 
      dispatch(loginSuccess(userData))
    } 
    else{
      window.alert("Login Failed, Please Try Again!");
      window.location.reload();
    }
  });
}
