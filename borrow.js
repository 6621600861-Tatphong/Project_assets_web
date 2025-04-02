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
      const response = await axios.get(`${BASE_URL}/borrow_assets/${id}`);
      const asset = response.data;

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

const validateAddData = (data) => {
   let errors = [];

   if (!data.status) errors.push("กรุณาเลือกสถานะ");

   return errors;
};

const submitData = async () => {
   let messageDOM = document.getElementById('message');

   let assetData = {
      
      status: document.querySelector('input[name=status]:checked')?.value || ''
   };

   try {
      const errors = validateAddData(assetData);
      if (errors.length > 0) {
         throw { message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors };
      }

      let message = 'บันทึกข้อมูลเรียบร้อย';
      if (mode === 'CREATE') {
         await axios.post(`${BASE_URL}/borrow_assets`, assetData);
      } else {
         await axios.put(`${BASE_URL}/borrow_assets/${selectedID}`, assetData);
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

const loadData = async () => {
   try {
      const response = await axios.get(`${BASE_URL}/borrow_assets`);
      const approval = response.data;
      const approvalTable = document.getElementById('borrow');

      let htmlData = '';
      approval.forEach(request => {
         htmlData += `
            <tr>
               <td>${request.asset_name}</td>
               <td>${request.borrower_name}</td>
               <td>${request.borrow_date}</td>
               <td>${request.return_date}</td>
               <td>${request.status}</td>
               <td>
                  <a href="borrow.html?asset_id=${request.borrow_id}"><button>Edit</button></a>
                  <button class="delete" data-id="${request.borrow_id}">Delete</button>
               </td>
            </tr>
         `;
      });

      approvalTable.innerHTML = htmlData;

      // 3. ลบ user
   const deleteDOMs = document.getElementsByClassName('delete');
   for(let i=0; i<deleteDOMs.length; i++){
      deleteDOMs[i].addEventListener('click', async (e) => {
         //ดึง id ของ user ที่ต้องการลบ
         const id = e.target.dataset.id
         try{
            await axios.delete(`${BASE_URL}/borrow_assets/${id}`);
            loadData() // recursive function = เรียกใช้ฟังก์ชันตัวเอง   
         }catch(error){
            console.log('error', error);
         }
      });
   }
   } catch (error) {
      console.error('Error loading assets:', error);
   }
}

const searchrequest = () => {
   const searchQuery = document.getElementById('searchInput').value.toLowerCase(); // รับค่าจากช่องค้นหา
   const borrowRequests = document.querySelectorAll('#borrow tr'); // เลือกแถวทั้งหมดในตารางที่มี id "borrow"

   borrowRequests.forEach(row => {
       const borrowerName = row.cells[1].textContent.toLowerCase(); // ดึงชื่อผู้ยืมจากคอลัมน์ที่ 2 (เริ่มจาก 0)

       if (borrowerName.includes(searchQuery)) {
           row.style.display = ''; // แสดงแถวถ้าชื่อผู้ยืมตรงกับคำค้นหา
       } else {
           row.style.display = 'none'; // ซ่อนแถวที่ไม่ตรง
       }
   });
}