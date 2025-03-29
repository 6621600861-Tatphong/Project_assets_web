const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

const port = 8600;

app.use(bodyParser.json());
app.use(cors());

let users = [];
let conn = null;

// ฟังก์ชันเชื่อมต่อ MySQL
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8830
    });
};

//-------------------------------------------assets-------------------------------------------------//

const validateAddData = (assetData) => {
    let errors = [];
 
    if (!assetData.asset_code) {
        errors.push('กรุณากรอกรหัสทรัพย์สิน');
    }
    
    if (!assetData.name) {
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
 
    if (!assetData.location) {
        errors.push('กรุณากรอกสถานที่จัดเก็บ');
    }
 
    if (!assetData.status) {
        errors.push('กรุณาเลือกสถานะการใช้งาน');
    }
 
    return errors;
 }

 // GET /users - ดึง Users ทั้งหมด
app.get('/assets', async (req, res) => {
    const results = await conn.query('SELECT * FROM assets');
    res.json(results[0]);
});

// POST /assets - เพิ่มทรัพย์สินใหม่
app.post('/assets', async (req, res) => {
    try {
        let assetData = req.body;
        const errors = validateAddData(assetData); // ใช้ assetData แทน user
        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบ',
                errors: errors
            };
        }

        const results = await conn.query('INSERT INTO assets SET ?', assetData);
        res.json({
            message: 'เพิ่มทรัพย์สินเรียบร้อย',
            data: results[0]
        });
    } catch (error) {
        console.error('error:', error.message);
        const errorMessage = error.message || 'เกิดข้อผิดพลาด';
        const errors = error.errors || [];
        res.status(500).json({
            message: errorMessage,
            errors: errors
        });
    }
});
// GET /users/:id - ดึง Users ตาม ID
app.get('/assets/:id', async (req, res) => {
    try{
       let id = req.params.id;
       const results = await conn.query('SELECT * FROM assets WHERE id = ?', id);
       if(results[0].length == 0){
        throw {statusCode: 404, message: 'user not found'}
       }    
        res.json(results[0][0])
    }catch(error){
        console.error('error :', error.message);
        let statusCode = error.statusCode || 500;
        res.status(500).json({
            message:'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

// PUT /users/:id - อัปเดตข้อมูล Users ตาม ID
app.put('/assets/:id', async (req, res) => {
    try{
        let id = req.params.id;
    let updateUser = req.body;
        let user = req.body;
        const results = await conn.query('UPDATE assets SET ? WHERE id = ?', [updateUser, id]);
        res.json({
                message: 'Update user successfully!!',
                data: results[0]
    })
    }catch(error){
        console.error('error :', error.message);
        res.status(500).json({
            message:'something went wrong',
            errorMessage: error.message
        }
  )} 
});

   


// DELETE /assets/:id - ลบทรัพย์สินตาม ID
app.delete('/assets/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM assets WHERE id = ?', id); // ใช้ assets แทน users
        if (results[0].affectedRows === 0) {
            throw { statusCode: 404, message: 'ทรัพย์สินไม่พบ' };
        }

        res.json({
            message: 'ลบทรัพย์สินเรียบร้อย',
            data: results[0]
        });
    } catch (error) {
        console.error('error:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: 'เกิดข้อผิดพลาด',
            errorMessage: error.message
        });
    }
});

app.get('/assets', (req, res) => {
    db.query('SELECT asset_code, name, DATE_FORMAT(purchase_date, "%d/%m/%Y") AS purchase_date FROM assets', 
    (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//-------------------------------------------details-------------------------------------------------//

// เริ่มเซิร์ฟเวอร์และเชื่อมต่อฐานข้อมูล
app.listen(port, async () => {
    await initMySQL();
    console.log('Http Server is running on port ' + port);
});