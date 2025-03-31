const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE' // default mode
let selectedID = ''


const validateUserData = (userData) => {
   let errors = [];

   if (!userData.username) {
       errors.push('Please enter your name');
   }
   if (!userData.password) {
       errors.push('Please enter your password');
   }
   if (!userData.email) {
       errors.push('Please enter your email');
   }

   if (!userData.role) {
       errors.push('Please select your role');
   }
   
   return errors;
}

const submitUserData = async () => {
   let usernameDOM = document.querySelector('input[name=username]');
   let passwordDOM = document.querySelector('input[name=password]');
   let emailDOM = document.querySelector('input[name=email]');
   let roleDOM = document.querySelectorAll('input[name=role]:checked') || {};
   
   let messageDOM = document.getElementById('message');

   try {
       let role = '';
       for (let i = 0; i < roleDOM.length; i++) {
           role += roleDOM[i].value;
           if (i != roleDOM.length - 1) {
               role += ',';
           }
       }
       let userData = {
           username: usernameDOM.value,
           password: passwordDOM.value,
           email: emailDOM.value,
           role: role
       }

       console.log('submitData', userData);

       const errors = validateUserData(userData);

       if (errors.length > 0) {
           //มี error
           throw {
               message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
               errors: errors
           }
       }

       let message = 'บันทึกข้อมูลเรียบร้อย'
       if (mode === 'CREATE') {
           const response = await axios.post(`${BASE_URL}/users`, userData)
           console.log('response', response.data);
       } else {
           const response = await axios.put(`${BASE_URL}/users/${selectedID}`, userData)
           message = 'แก้ไขข้อมูลเรียบร้อย'
           console.log('response', response.data);
       }


       messageDOM.innerText = message
       messageDOM.className = 'message success'

   } catch (error) {
       console.log('error message', error.message);
       console.log('error', error.errors);

       if (error.response) {
           console.log(error.response);
           error.message = error.response.data.message;
           error.errors = error.response.data.errors;
       }

       let htmlData = '<div>';
       htmlData += `<div> ${error.message} </div>`
       htmlData += '<ul>';
       for (let i = 0; i < error.errors.length; i++) {
           htmlData += `<li> ${error.errors[i]} </li>`
       }
       htmlData += '</ul>';
       htmlData += '</div>';

       messageDOM.innerHTML = htmlData;
       messageDOM.className = 'message danger'
   }
}