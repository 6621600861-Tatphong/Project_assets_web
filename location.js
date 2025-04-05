const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE';
let selectedID = null;

window.onload = async () => {
   await loadData(); // โหลดรายการสินทรัพย์ทั้งหมด

   const urlParams = new URLSearchParams(window.location.search);
   const id = urlParams.get('location_id');

   if (id) {
      mode = 'EDIT';
      selectedID = id;
      await loadEditData(id); // โหลดข้อมูลสินทรัพย์ที่ต้องการแก้ไข
   }
}

// ฟังก์ชันโหลดข้อมูลสินทรัพย์เพื่อแก้ไข
const loadEditData = async (id) => {
   try {
      const response = await axios.get(`${BASE_URL}/asset_location/${id}`);
      const locate = response.data;

      document.querySelector('input[name=asset_code]').value = locate.asset_code;
      document.querySelector('input[name=location_name]').value = locate.location_name;
      document.querySelector('input[name=department]').value = locate.department;
      document.querySelector('input[name=building]').value = locate.building;


   } catch (error) {
      console.error('Error loading asset data:', error);
   }
}

// ฟังก์ชันตรวจสอบข้อมูลก่อนบันทึก
const validatelocationData = (userData) => {
   let errors = []

   if (!userData.asset_code) {
      errors.push('กรุณากรอกรหัสครุภัณฑ์')
   }
   if (!userData.location_name) {
      errors.push('กรุณากรอกวันที่ซ่อม')
   }
   if (!userData.department) {
      errors.push('กรุณากรอกคำอธิบาย')
   }
   if (!userData.building) {
      errors.push('กรุณาตึก')
   }

   return errors
}

// ฟังก์ชันบันทึกข้อมูลสถานที่
const submitLocation = async () => {
   let messageDOM = document.getElementById('message');

   let locationData = {
      asset_code: document.getElementById('asset_code').value,
      location_name: document.getElementById('location_name').value,
      department: document.getElementById('department').value,
      building: document.getElementById('building').value,
   };

   try {
      // ตรวจสอบข้อมูลก่อนบันทึก
      const errors = validatelocationData(locationData);
      if (errors.length > 0) {
         throw { message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors };
      }

      let message = 'บันทึกข้อมูลเรียบร้อย';
      if (mode === 'CREATE') {
         await axios.post(`${BASE_URL}/asset_location`, locationData);
      } else {
         await axios.put(`${BASE_URL}/asset_location/${selectedID}`, locationData);
         message = 'แก้ไขข้อมูลเรียบร้อย';
      }

      messageDOM.innerText = message;
      messageDOM.className = 'message success';

      await loadData(); // โหลดข้อมูลใหม่หลังจากบันทึกสำเร็จ
   } catch (error) {
      console.error('Error submitting data:', error);

      let htmlData = `<div><div>${error.message}</div><div>`;
      for (let i = 0; i < error.errors.length; i++) {
         htmlData += `<div>${error.errors[i]}</div>`;
      }
      htmlData += '</div></div>';

      messageDOM.innerHTML = htmlData;
      messageDOM.className = 'message danger';
   }
}

const loadData = async () => {
   try {
      const response = await axios.get(`${BASE_URL}/asset_location`);
      const locations = response.data;
      const locationTable = document.getElementById('location_data');

      let htmlData = '';
      locations.forEach(location => {
         htmlData += `
            <tr>
               <td>${location.asset_code}</td>
               <td>${location.location_name}</td>
               <td>${location.department}</td>
               <td>${location.building}</td>
               <td>
                  <a href="location.html?location_id=${location.location_id}"><button>Edit</button></a>
                  <button class="delete" data-id="${location.location_id}">Delete</button>
               </td>
            </tr>
         `;
      });

      locationTable.innerHTML = htmlData;

      // ตั้งค่าปุ่มลบ
      document.querySelectorAll('.delete').forEach(button => {
         button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            try {
               await axios.delete(`${BASE_URL}/asset_location/${id}`);
               await loadData(); // โหลดข้อมูลใหม่หลังจากลบ
            } catch (error) {
               console.error('Error deleting asset:', error);
            }
         });
      });
   } catch (error) {
      console.error('Error loading assets:', error);
   }
}