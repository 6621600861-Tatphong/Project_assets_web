const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');

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
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM assets WHERE asset_id = ?', id);
        if (results[0].length == 0) {
            throw { statusCode: 404, message: 'user not found' }
        }
        res.json(results[0][0])
    } catch (error) {
        console.error('error :', error.message);
        let statusCode = error.statusCode || 500;
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

// PUT /users/:id - อัปเดตข้อมูล Users ตาม ID
app.put('/assets/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let updateUser = req.body;
        let user = req.body;
        const results = await conn.query('UPDATE assets SET ? WHERE asset_id = ?', [updateUser, id]);
        res.json({
            message: 'Update user successfully!!',
            data: results[0]
        })
    } catch (error) {
        console.error('error :', error.message);
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});




// DELETE /assets/:id - ลบทรัพย์สินตาม ID
app.delete('/assets/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM assets WHERE asset_id = ?', id); // ใช้ assets แทน users
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

//-------------------------------------------หน้า Location -------------------------------------------------//

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
        errors.push('กรุณาราคา')
    }

    return errors
}

app.get('/asset_location', async (req, res) => {
    const results = await conn.query('SELECT * FROM asset_location');
    res.json(results[0]);
});

// GET /users/:id - ดึง Users ตาม ID
app.get('/asset_location/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM asset_location WHERE location_id = ?', id);
        if (results[0].length == 0) {
            throw { statusCode: 404, message: 'user not found' }
        }
        res.json(results[0][0])
    } catch (error) {
        console.error('error :', error.message);
        let statusCode = error.statusCode || 500;
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

// POST /users - เพิ่ม Users ใหม่
app.post('/asset_location', async (req, res) => {

    try {
        let user = req.body;
        const errors = validatelocationData(user);
        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบ',
                errors: errors
            }
        }
        const results = await conn.query('INSERT INTO asset_location SET ?', user);
        res.json({
            message: 'Create user successfully',
            data: results[0]
        })
    } catch (error) {
        const errorMessage = error.message || 'Something went wrong';
        const errors = error.errors || [];
        console.error('error :', error.message);
        res.status(500).json({
            message: errorMessage,
            errors: errors
        })
    }
});

// PUT /users/:id - อัปเดตข้อมูล Users ตาม ID
app.put('/asset_location/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let updateUser = req.body;
        let user = req.body;
        const results = await conn.query('UPDATE asset_location SET ? WHERE location_id = ?', [updateUser, id]);
        res.json({
            message: 'Update user successfully!!',
            data: results[0]
        })
    } catch (error) {
        console.error('error :', error.message);
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});




// DELETE /users/:id - ลบ Users ตาม ID
app.delete('/asset_location/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE  FROM asset_location  WHERE location_id = ?', id);
        res.json({
            message: 'Delete user successfully !!',
            data: results[0]
        })
    } catch (error) {
        console.error('error :', error.message);
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

//-------------------------------------------หน้า login & register -------------------------------------------------//

const validateUserData = (userData) => {
    let errors = [];

    if (!userData.username) {
        errors.push('Please enter your name');
    }
    if (!userData.password) {
        errors.push('Please enter your password');
    }
    if (!userData.email) {
        errors.push('Please enter your email');
    }

    if (!userData.role) {
        errors.push('Please select your role');
    }

    return errors;
}

// POST /users - เพิ่ม Users ใหม่
app.post('/users', async (req, res) => {

    try {
        let user = req.body;
        const errors = validateUserData(user);
        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบ',
                errors: errors
            }
        }
        const results = await conn.query('INSERT INTO users SET ?', user);
        res.json({
            message: 'Create user successfully',
            data: results[0]
        })
    } catch (error) {
        const errorMessage = error.message || 'something went wrong';
        const errors = error.errors || [];
        console.error('error :', error.message);
        res.status(500).json({
            message: errorMessage,
            errors: errors
        }
        )
    }
});
// GET /users/:id - ดึง Users ตาม ID
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM users WHERE id = ?', id);
        if (results[0].length == 0) {
            throw { statusCode: 404, message: 'user not found' }
        }
        res.json(results[0][0])
    } catch (error) {
        console.error('error :', error.message);
        let statusCode = error.statusCode || 500;
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    //ตรวจสอบว่ามี username / password
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        //ค้นหาผู้ใช้จากฐานข้อมูล(mysql)
        const [user] = await conn.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        //เช็คว่าเจอไหม
        if (user.length === 0) {
            return res.status(401).json({ message: 'User not Found please try again' });
        }
        //รับข้อมูลของผู้ใช้
        const users = user[0];
        const role = users.role;
        //ส่งข้อมูลกลับไป
        return res.json({
            success: true,
            message: 'Login successful',
            role: role
        });

    } catch (error) {
        console.error('Error login: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
});

//-------------------------------------------หน้า ยืมของ กับแสดงสถานะ -------------------------------------------------//

app.get('/borrow_assets', async (req, res) => {
    const results = await conn.query('SELECT * FROM borrow_assets');
    res.json(results[0]);
});

// GET /users/:id - ดึง Users ตาม ID
app.get('/borrow_assets/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM borrow_assets WHERE borrow_id = ?', id);
        if (results[0].length == 0) {
            throw { statusCode: 404, message: 'user not found' }
        }
        res.json(results[0][0])
    } catch (error) {
        console.error('error :', error.message);
        let statusCode = error.statusCode || 500;
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

// PUT /users/:id - อัปเดตข้อมูล Users ตาม ID
app.put('/borrow_assets/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let updateUser = req.body;
        let user = req.body;
        const results = await conn.query('UPDATE borrow_assets SET ? WHERE borrow_id = ?', [updateUser, id]);
        res.json({
            message: 'Update user successfully!!',
            data: results[0]
        })
    } catch (error) {
        console.error('error :', error.message);
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

const validateeData = (data) => {
    let errors = [];
    if (!data.asset_name) errors.push('กรุณากรอกชื่อทรัพย์สิน');
    if (!data.borrow_date) errors.push('กรุณากรอกวันที่ขอยืม');
    if (!data.borrower_name) errors.push('กรุณากรอกชื่อผู้ขอยืม');
    return errors;
};

// POST /users - เพิ่ม Users ใหม่
app.post('/borrow_assets', async (req, res) => {

    try {
        let user = req.body;
        const errors = validateeData(user);
        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบ',
                errors: errors
            }
        }
        const results = await conn.query('INSERT INTO borrow_assets SET ?', user);
        res.json({
            message: 'Create user successfully',
            data: results[0]
        })
    } catch (error) {
        const errorMessage = error.message || 'something went wrong';
        const errors = error.errors || [];
        console.error('error :', error.message);
        res.status(500).json({
            message: errorMessage,
            errors: errors
        }
        )
    }
});

// DELETE /users/:id - ลบ Users ตาม ID
app.delete('/borrow_assets/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE  FROM borrow_assets  WHERE borrow_id = ?', id);
        res.json({
            message: 'Delete user successfully !!',
            data: results[0]
        })
    } catch (error) {
        console.error('error :', error.message);
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        }
        )
    }
});

//------------------------------------------ เริ่มเซิร์ฟเวอร์และเชื่อมต่อฐานข้อมูล

app.get('/check-status', async (req, res) => {
    try {
        const [assets] = await conn.query('SELECT * FROM assets');

        // คำนวณจำนวนห้องว่างและไม่ว่าง
        const available = assets.filter(asset => asset.status?.trim() === 'Active').length;
        const unavailable = assets.filter(asset => asset.status?.trim() === 'Inactive').length;
        const total = assets.length;

        // ส่งข้อมูลไปให้ frontend
        res.json({ available, unavailable, total });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
    }
});

app.listen(port, async () => {
    await initMySQL();
    console.log('Http Server is running on port ' + port);
});