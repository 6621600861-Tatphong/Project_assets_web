const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE';
let selectedID = null;

window.onload = async () => {
   await loadData(); // โหลดรายการสินทรัพย์ทั้งหมด

   const urlParams = new URLSearchParams(window.location.search);
   const id = urlParams.get('asset_id');

   if (id) {
      mode = 'EDIT';
      selectedID = id;
      await loadEditData(id); // โหลดข้อมูลสินทรัพย์ที่ต้องการแก้ไข
   }
}

// ฟังก์ชันโหลดข้อมูลสินทรัพย์เพื่อแก้ไข
const loadEditData = async (id) => {
   try {
      const response = await axios.get(`${BASE_URL}/assets/${id}`);
      const asset = response.data;

      document.querySelector('input[name=asset_code]').value = asset.asset_code;
      document.querySelector('input[name=asset_name]').value = asset.asset_name;
      document.querySelector('input[name=category]').value = asset.category;
      document.querySelector('input[name=brand]').value = asset.brand;
      document.querySelector('input[name=model]').value = asset.model;
      document.querySelector('input[name=serial_number]').value = asset.serial_number;
      document.querySelector('input[name=purchase_date]').value = asset.purchase_date;
      document.querySelector('input[name=purchase_price]').value = asset.purchase_price;

      let statusDOM = document.querySelectorAll('input[name=status]');
      for (let i = 0; i < statusDOM.length; i++) {
         if (statusDOM[i].value == asset.status) {
            statusDOM[i].checked = true;
         }
      }
   } catch (error) {
      console.error('Error loading asset data:', error);
   }
}

// ฟังก์ชันตรวจสอบข้อมูลก่อนบันทึก
const validateAddData = (assetData) => {
   let errors = [];

   if (!assetData.asset_code) 
      errors.push('กรุณากรอกรหัสทรัพย์สิน');

   if (!assetData.asset_name) 
      errors.push('กรุณากรอกชื่อทรัพย์สิน');

   if (!assetData.category) 
      errors.push('กรุณากรอกหมวดหมู่ทรัพย์สิน');

   if (!assetData.brand) 
      errors.push('กรุณากรอกยี่ห้อ');

   if (!assetData.model) 
      errors.push('กรุณากรอกข้อมูลรุ่น');

   if (!assetData.serial_number) 
      errors.push('กรุณากรอกหมายเลขเครื่อง');

   if (!assetData.purchase_date) 
      errors.push('กรุณากรอกวันที่ซื้อ');

   if (!assetData.purchase_price) 
      errors.push('กรุณากรอกราคาซื้อ');

   if (!assetData.status) 
      errors.push('กรุณาเลือกสถานะการใช้งาน');

   return errors;
}

// ฟังก์ชันบันทึกข้อมูล
const submitData = async () => {
   let messageDOM = document.getElementById('message');

   let assetData = {
      asset_code: document.querySelector('input[name=asset_code]').value,
      asset_name: document.querySelector('input[name=asset_name]').value,
      category: document.querySelector('input[name=category]').value,
      brand: document.querySelector('input[name=brand]').value,
      model: document.querySelector('input[name=model]').value,
      serial_number: document.querySelector('input[name=serial_number]').value,
      purchase_date: document.querySelector('input[name=purchase_date]').value,
      purchase_price: parseFloat(document.querySelector('input[name=purchase_price]').value),
      
      status: document.querySelector('input[name=status]:checked')?.value || ''
   };

   try {
      const errors = validateAddData(assetData);
      if (errors.length > 0) {
         throw { message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors };
      }

      let message = 'บันทึกข้อมูลเรียบร้อย';
      if (mode === 'CREATE') {
         await axios.post(`${BASE_URL}/assets`, assetData);
      } else {
         await axios.put(`${BASE_URL}/assets/${selectedID}`, assetData);
         message = 'แก้ไขข้อมูลเรียบร้อย';
      }

      messageDOM.innerText = message;
      messageDOM.className = 'message success';

      await loadData(); // โหลดใหม่เฉพาะเมื่อบันทึกสำเร็จ
   } catch (error) {
      console.error('Error submitting data:', error);

      let htmlData = `<div><div>${error.message}</div><ul>`;
      for (let i = 0; i < error.errors.length; i++) {
         htmlData += `<li>${error.errors[i]}</li>`;
      }
      htmlData += '</ul></div>';

      messageDOM.innerHTML = htmlData;
      messageDOM.className = 'message danger';
   }
}

// ฟังก์ชันโหลดข้อมูลสินทรัพย์ทั้งหมด
const loadData = async () => {
   try {
      const response = await axios.get(`${BASE_URL}/assets`);
      const assets = response.data;
      const assetTable = document.getElementById('asset');

      let htmlData = '';
      for (let asset of assets) {
         htmlData += `
            <tr>
               <td>${asset.asset_code}</td>
               <td>${asset.asset_name}</td>
               <td>${asset.category}</td>
               <td>${asset.brand}</td>
               <td>${asset.model}</td>
               <td>${asset.serial_number}</td>
               <td>${asset.purchase_date}</td>
               <td>${asset.purchase_price}</td>
               <td>${asset.status}</td>
               <td>
                  <a href="add.html?asset_id=${asset.asset_id}"><button>Edit</button></a>
                  <button class="delete" data-id="${asset.asset_id}">Delete</button>
               </td>
            </tr>
         `;
      }

      assetTable.innerHTML = htmlData;

      // ตั้งค่าปุ่มลบ
      document.querySelectorAll('.delete').forEach(button => {
         button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            try {
               await axios.delete(`${BASE_URL}/assets/${id}`);
               await loadData(); // โหลดข้อมูลใหม่
            } catch (error) {
               console.error('Error deleting asset:', error);
            }
         });
      });
   } catch (error) {
      console.error('Error loading assets:', error);
   }
}
