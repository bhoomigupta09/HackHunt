// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors'); 
// require('dotenv').config(); 

// const forgotPasswordRoutes = require('./routes/forgotPassword');

// const app = express();

// // ==================== Middleware ====================
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ==================== Routes Register ====================
// // Postman ke liye rasta: http://localhost:5000/api/forgot-password
// app.use('/api', forgotPasswordRoutes); 

// // ==================== MongoDB Connection ====================
// mongoose.connect("mongodb://127.0.0.1:27017/project1")
// .then(() => {
//     console.log("✅ MongoDB connected (Local Compass)");
// })
// .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
// });

// // ==================== Server Start ====================
// const PORT = 5000; // Wapas 5000 kar diya Postman ke liye
// app.listen(PORT, () => {
//     console.log(`🚀 Server 5000 par chal raha hai!`);
//     console.log(`🔗 Postman URL: http://localhost:5000/api/forgot-password`);
// });


/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// 1. Dono Routes import karo
const forgotPasswordRoutes = require('./routes/forgotPassword');
const userRoutes = require('./database/User'); // Ensure karo ki 'routes' folder mein 'user.js' file hai

const app = express();

// ==================== Middleware ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Routes Register ====================

/** * Frontend is looking for: http://localhost:5000/api/v1/user/signin
 */

// Forgot Password ke liye: /api/v1/forgot-password
//app.use('/api/v1', forgotPasswordRoutes);

// User Signin/Signup ke liye: /api/v1/user
//app.use('/api/v1/user', userRoutes); 

// ==================== MongoDB Connection ====================
/*mongoose.connect("mongodb://127.0.0.1:27017/project1")
.then(() => {
    console.log("✅ MongoDB connected (Local Compass)");
})
.catch((err) => {
    console.error("❌ MongoDB connection error:", err);
});*/

// ==================== Server Start ====================
/*const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`🚀 Server 5000 par chal raha hai!`);
    console.log(`👉 Signin URL: http://localhost:5000/api/v1/user/signin`);
    console.log(`👉 Forgot Password URL: http://localhost:5000/api/v1/forgot-password`);
});*/
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// 1. Dono Routes import karo
const forgotPasswordRoutes = require('./routes/forgotPassword');
const userRoutes = require('./database/User'); 

const app = express();

// ==================== Middleware ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Routes Register ====================

// Forgot Password ke liye: http://localhost:5000/api/v1/forgot-password
app.use('/api/v1', forgotPasswordRoutes);

// YAHAN CHANGE HAI: userRoutes ke aage .userRouter lagaya hai
app.use('/api/v1/user', userRoutes.userRouter); 

// ==================== MongoDB Connection ====================
mongoose.connect("mongodb://127.0.0.1:27017/project1")
.then(() => {
    console.log("✅ MongoDB connected (Local Compass)");
})
.catch((err) => {
    console.error("❌ MongoDB connection error:", err);
});

// ==================== Server Start ====================
const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`🚀 Server 5000 par chal raha hai!`);
    console.log(`👉 Signin URL: http://localhost:5000/api/v1/user/signin`);
    console.log(`👉 Forgot Password URL: http://localhost:5000/api/v1/forgot-password`);
});