const BASE_URL = 'http://localhost:8600';

const cheack_info = async () => {
   // ดึงค่าผู้ใช้/รหัสผ่านจากฟอร์ม
   const username = document.getElementById("username").value;
   const password = document.getElementById("password").value;

   try {
      // ส่งข้อมูลไปที่ server
      const response = await axios.post(`${BASE_URL}/login`, {
         username, password
      });

      // ตรวจสอบผลลัพธ์จากเซิฟเวอร์
      if (response.data.success) {
         alert('Login successful');
         if (response.data.role === 'Admin') {
            window.location.href = 'add.html'; // ไปหน้า admin
         } else if (response.data.role === 'Employee') {
            window.location.href = 'employee.html'; // ไปหน้า employee
         }
      } else {
         console.log('Invalid credentials:', response.data.message);
         alert('Invalid username or password!');
      }
   } catch (error) {
      console.error('Error login:', error);
      alert('Username or password is incorrect. Please try again.');
   }
}

// Event listener สำหรับฟอร์ม login
document.getElementById("loginForm").addEventListener("submit", async function(event) {
   event.preventDefault(); // ป้องกันการรีเฟรชหน้า
   await cheack_info(); // เรียกใช้ฟังก์ชัน cheack_info() เพื่อทำการล็อกอิน
});