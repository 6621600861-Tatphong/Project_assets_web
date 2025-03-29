const BASE_URL = 'http://localhost:8600';

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
                  ${user.location}
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