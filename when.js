const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE';
let selectedID = null;

window.onload = async () => {
   await loadData(); // โหลดรายการสินทรัพย์ทั้งหมด
}

const loadData = async () => {
   try {
       const response = await axios.get(`${BASE_URL}/borrow_assets`);
       const approval = response.data;
       const approvalTable = document.getElementById('borrow');

       let htmlData = '';
       approval.forEach(request => {
           // กำหนดสีตามสถานะ
           let statusColor = '';
           switch (request.status) {
               case 'Requested':
                   statusColor = 'grey';
                   break;
               case 'Approved':
                   statusColor = 'green';
                   break;
               case 'Denied':
                   statusColor = 'red';
                   break;
               default:
                   statusColor = 'black'; // สีเริ่มต้น
           }

           htmlData += `
               <tr>
                   <td>${request.asset_name}</td>
                   <td>${request.borrower_name}</td>
                   <td>${request.borrow_date}</td>
                   <td>${request.return_date}</td>
                   <td style="color: ${statusColor};">${request.status}</td>
               </tr>
           `;
       });

       approvalTable.innerHTML = htmlData;

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