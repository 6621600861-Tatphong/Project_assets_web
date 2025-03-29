const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE' // default mode
let selectedID = ''

window.onload = async () => {
   const urlParams = new URLSearchParams(window.location.search);
   const id = urlParams.get('id');
   console.log('id', id);
   if (id) {
      mode = 'EDIT'
      selectedID = id

      //1. ดึงข้อมูล user ที่ต้องการแก้ไข
      try {
         const response = await axios.get(`${BASE_URL}/assets/${id}`);
         const asset = response.data;

         //2. นำข้อมูลของ user ที่ดึงมาแสดงใน form
         let asset_codeDOM = document.querySelector('input[name=asset_code]');
         let asset_nameDOM = document.querySelector('input[name=asset_name]');
         let categoryDOM = document.querySelector('input[name=category]');
         let brandDOM = document.querySelector('input[name=brand]');
         let modelDOM = document.querySelector('input[name=model]');
         let serial_numberDOM = document.querySelector('input[name=serial_number]');
         let purchase_dateDOM = document.querySelector('input[name=purchase_date]');
         let purchase_priceDOM = document.querySelector('input[name=purchase_price]');
         let statusDOM = document.querySelectorAll('input[name=status]');

         // กำหนดค่าจากอ็อบเจกต์ user ที่จะดึงมาจากฐานข้อมูลหรือ API
         asset_codeDOM.value = asset.asset_code;
         asset_nameDOM.value = asset.asset_name;
         categoryDOM.value = asset.category;
         brandDOM.value = asset.brand;
         modelDOM.value = asset.model;
         serial_numberDOM.value = asset.serial_number;
         purchase_dateDOM.value = asset.purchase_date;
         purchase_priceDOM.value = asset.purchase_price;

         // กำหนดค่าของ status (หากใช้ radio buttons)
         for (let i = 0; i < statusDOM.length; i++) {
            if (statusDOM[i].value === asset.status) {
               statusDOM[i].checked = true;
            }
         }


      } catch (error) {
         console.log('error', error);
      }
   }
}

const validateAddData = (assetData) => {
   let errors = [];

   if (!assetData.asset_code) {
      errors.push('กรุณากรอกรหัสทรัพย์สิน');
   }

   if (!assetData.asset_name) {
      errors.push('กรุณากรอกชื่อทรัพย์สิน');
   }

   if (!assetData.category) {
      errors.push('กรุณากรอกหมวดหมู่ทรัพย์สิน');
   }

   if (!assetData.brand) {
      errors.push('กรุณากรอกยี่ห้อ');
   }

   if (!assetData.model) {
      errors.push('กรุณากรอกข้อมูลรุ่น');
   }

   if (!assetData.serial_number) {
      errors.push('กรุณากรอกหมายเลขเครื่อง');
   }

   if (!assetData.purchase_date) {
      errors.push('กรุณากรอกวันที่ซื้อ');
   }

   if (!assetData.purchase_price) {
      errors.push('กรุณากรอกราคาซื้อ');
   }

   if (!assetData.status) {
      errors.push('กรุณาเลือกสถานะการใช้งาน');
   }

   return errors;
}

const submitData = async () => {
   let asset_codeDOM = document.querySelector('input[name=asset_code]');
   let asset_nameDOM = document.querySelector('input[name=asset_name]');
   let categoryDOM = document.querySelector('input[name=category]');
   let brandDOM = document.querySelector('input[name=brand]');
   let modelDOM = document.querySelector('input[name=model]');
   let serial_numberDOM = document.querySelector('input[name=serial_number]');
   let purchase_dateDOM = document.querySelector('input[name=purchase_date]');
   let purchase_priceDOM = document.querySelector('input[name=purchase_price]');
   let statusDOM = document.querySelectorAll('input[name=status]:checked') || {};

   let messageDOM = document.getElementById('message');

   try {
      let status = '';
      for (let i = 0; i < statusDOM.length; i++) {
         status += statusDOM[i].value;
         if (i !== statusDOM.length - 1) {
            status += ',';
         }
      }
      let assetData = {
         asset_code: asset_codeDOM.value,
         asset_name: asset_nameDOM.value,
         category: categoryDOM.value,
         brand: brandDOM.value,
         model: modelDOM.value,
         serial_number: serial_numberDOM.value,
         purchase_date: purchase_dateDOM.value,
         purchase_price: parseFloat(purchase_priceDOM.value), // ตรวจสอบให้แน่ใจว่าค่าราคาเป็นตัวเลข
         status : status // หากไม่มีการเลือกสถานะ จะส่งค่าว่าง
      };

      console.log('submitData', assetData);

      const errors = validateAddData(assetData);

      if (errors.length > 0) {
         //มี error
         throw {
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            errors: errors
         }
      }

      let message = 'บันทึกข้อมูลเรียบร้อย'
      if (mode === 'CREATE') {
         const response = await axios.post(`${BASE_URL}/assets`, assetData)
         console.log('response', response.data);
      } else {
         const response = await axios.put(`${BASE_URL}/assets/${selectedID}`, assetData)
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

window.onload = async () => {
   await loadData()
}

const loadData = async () => {
   console.log('user page load')

   // 1. load user ทั้งหมดจาก api ที่เตรียมไว้
   const response = await axios.get(`${BASE_URL}/assets`);
   
   console.log(response.data);

   const userDOM = document.getElementById('asset');

   // 2.นำ user ทั้งหมด โหลดกลับเข้าไปใน HTML(แสดงผล)
   
   let htmlData = '<div>'
   for(let i=0; i< response.data.length; i++){
      let user = response.data[i];
      htmlData += `<div>
         <table>
            <tr>
               <td class='balance'>${user.asset_code}</td> 
               <td > 
                  ${user.name}
               </td>
               <td >
                  ${user.category} 
               </td>
               <td > 
                  ${user.brand}
               </td>
               <td > 
                  ${user.model}
               </td>
               <td > 
                  ${user.serial_number}
               </td>
               <td > 
                  ${user.purchase_date}
               </td>
               <td > 
                  ${user.purchase_price}
               </td>
               <td > 
                  ${user.status}
               </td>

               <td class='balance '>
                  <a href = 'add.html?id=${user.id}' ><button>Edit</button></a>
                  <button class="delete" data-id="${user.id}">Delete</button>
               </td>
            </tr>
         </table>
      </div>`
   }
   htmlData += '</div>'
   userDOM.innerHTML = htmlData;

   // 3. ลบ user
   const deleteDOMs = document.getElementsByClassName('delete');
   for(let i=0; i<deleteDOMs.length; i++){
      deleteDOMs[i].addEventListener('click', async (e) => {
         //ดึง id ของ user ที่ต้องการลบ
         const id = e.target.dataset.id
         try{
            await axios.delete(`${BASE_URL}/assets/${id}`);
            loadData() // recursive function = เรียกใช้ฟังก์ชันตัวเอง   
         }catch(error){
            console.log('error', error);
         }
      });
   }
}
