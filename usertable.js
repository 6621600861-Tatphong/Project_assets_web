const BASE_URL = 'http://localhost:8600';

let mode = 'CREATE';
let selectedID = null;

window.onload = async () => {
   await loadData(); // โหลดข้อมูลคำขอยืมทั้งหมด
};

const loadData = async () => {
   try {
      const response = await axios.get(`${BASE_URL}/borrow_requests`);
      const approval = response.data;
      const approvalTable = document.getElementById('approval');

      let htmlData = '';
      approval.forEach(request => {
         htmlData += `
            <tr>
               <td>${request.asset_id}</td>
               <td>${request.borrower_name}</td>
               <td>${request.borrow_date}</td>
               <td>${request.return_date}</td>
               <td>${request.status}</td>
            </tr>
         `;
      });

      approvalTable.innerHTML = htmlData;
   } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลคำขอยืม:', error);
   }
};