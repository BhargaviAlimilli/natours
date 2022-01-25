/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};



























 
// const login = async (email, password) => {
//   console.log(email,password)
//     try {
//       var xhr = new XMLHttpRequest();
//       xhr.open("POST", "localhost:4000/api/v1/users/login", true);
//       xhr.setRequestHeader('Content-Type', 'application/json');
//       xhr.send(JSON.stringify({
//     value: {
//           email,
//           password
//         }
// }));
  
//     }catch(err){
//       console.log(err)
//     }
// }


// document.querySelector('.form--login').addEventListener('submit',e=>{
//   e.preventDefault()
//   console.log("1234")

//   const email= document.getElementById('email').value
//   const password= document.getElementById('password').value

//   console.log(email,password)

//   login(email,password)

// })










