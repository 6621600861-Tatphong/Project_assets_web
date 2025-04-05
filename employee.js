const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE';
let selectedID = null;

window.onload = async () => {
   await loadData(); // โหลดรายการสินทรัพย์ทั้งหมด
   await updateStatus(); // โหลดข้อมูลจำนวนที่ยืมได้และยืมไม่ได้
};

const submitData = async () => {
   
    let messageDOM = document.getElementById('message');

    const validateAddData = (data) => {
        let errors = [];
    
        if (!data.asset_name) 
         errors.push('กรุณากรอกชื่อทรัพย์สิน');
        if (!data.borrow_date) 
         errors.push('กรุณากรอกวันที่ขอยืม');
        if (!data.borrower_name) 
         errors.push('กรุณากรอกชื่อผู้ขอยืม');
    
        return errors; // ต้อง return array เสมอ
    };

    let assetData = {
        asset_name: document.querySelector('input[name=asset_name]')?.value ,
        borrow_date: document.querySelector('input[name=borrow_date]')?.value ,
        return_date: document.querySelector('input[name=return_date]')?.value ,
        borrower_name: document.querySelector('input[name=borrower_name]')?.value ,
    
       status: 'Requested' // กำหนดค่า status เป็น Requested
    };

    try {
       const errors = validateAddData(assetData);
       if (errors && errors.length > 0) {
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

    } catch (error) {
       console.error('Error submitting data:', error);

       let htmlData = `<div><div>${error.message}</div><ul>`;
       if (error.errors) {
           for (let i = 0; i < error.errors.length; i++) {
              htmlData += `<li>${error.errors[i]}</li>`;
           }
       }
       htmlData += '</ul></div>';

       messageDOM.innerHTML = htmlData;
       messageDOM.className = 'message danger';
    }
};

const loadData = async () => {
   try {
      const response = await axios.get(`${BASE_URL}/assets`);
      const assets = response.data;
      const assetTable = document.getElementById('asset');

      let htmlData = '';
      for (let asset of assets) {
         // แสดงข้อความตามสถานะ (Active หรือ Inactive)
         let borrowButton = '';
         if (asset.status === 'Inactive') {
            borrowButton = '<span style="color: red;">ยืมไม่ได้</span>'; // แสดงข้อความว่า "ยืมไม่ได้"
         } else if (asset.status === 'Active') {
            borrowButton = '<span style="color: green;">ยืมได้</span>'; // แสดงข้อความว่า "ยืมได้"
         }

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
               <td>${borrowButton}</td>  <!-- แสดงข้อความแทนปุ่ม -->
            </tr>
         `;
      }

      assetTable.innerHTML = htmlData;

   } catch (error) {
      console.error('Error loading assets:', error);
   }
}

async function updateStatus() {
   try {
      const response = await fetch(`${BASE_URL}/check-status`);
       const data = await response.json();

       if (data.available !== undefined && data.unavailable !== undefined && data.total !== undefined) {
           document.querySelector('.status-number.available').textContent = data.available;
           document.querySelector('.status-number.unavailable').textContent = data.unavailable;
           document.querySelector('.status-number.total').textContent = data.total;
       } else {
           console.error("ข้อมูลสถานะไม่สมบูรณ์:", data);
       }
   } catch (error) {
       console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสถานะ:", error);
   }
}


// ✅ เพิ่ม Event Listener เพื่อป้องกันรีเฟรชหน้า
document.getElementById('borrow-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitData();
});

const searchrequest = () => {
   const searchQuery = document.getElementById('searchInput').value.toLowerCase();  // ค่าที่ผู้ใช้กรอก
   const assetRows = document.querySelectorAll('#asset tr');  // เลือกแถวทั้งหมดในตารางสินทรัพย์

   let found = false;  // ตัวแปรสำหรับตรวจสอบว่าเจอข้อมูลหรือไม่

   assetRows.forEach(row => {
       const borrowerName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase();  // หาชื่อผู้ขอยืมในคอลัมน์ที่ 2

       if (borrowerName && borrowerName.includes(searchQuery)) {  // ถ้ามีชื่อผู้ขอยืมและตรงกับการค้นหา
           row.style.display = '';  // แสดงแถว
           found = true;
       } else {
           row.style.display = 'none';  // ซ่อนแถว
       }
   });


};