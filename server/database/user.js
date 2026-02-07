const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/project1")
.then(() => {
    console.log("MongoDB connected");
})
.catch((err) => {
    console.error("MongoDB error:", err);
});

const Schema = mongoose.Schema;

// Validation function for strong password
const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
};

// ==================== USER SCHEMA ====================
// For regular users participating in hackathons
const userSchema = new Schema({
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user'],
        immutable: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    joinedHackathons: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    favoriteHackathons: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// ==================== ORGANIZER SCHEMA ====================
// For users who organize hackathons
const organizerSchema = new Schema({
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'organizer',
        enum: ['organizer'],
        immutable: true
    },
    organizationName: {
        type: String,
        required: true
    },
    organizationWebsite: {
        type: String,
        default: null
    },
    organizationLogo: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    hackathonsCreated: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    hackathonsManaged: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDocument: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// ==================== ADMIN SCHEMA ====================
// For system administrators
const adminSchema = new Schema({
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin'],
        immutable: true
    },
    adminLevel: {
        type: String,
        enum: ['super_admin', 'moderator', 'support'],
        default: 'moderator'
    },
    profilePicture: {
        type: String,
        default: null
    },
    permissions: {
        type: [String],
        default: ['view_users', 'view_hackathons']
    },
    usersManaged: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    activityLog: {
        type: [{
            action: String,
            targetId: mongoose.Schema.Types.ObjectId,
            targetType: String,
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model("users", userSchema);
const Organizer = mongoose.model("organizers", organizerSchema);
const Admin = mongoose.model("admins", adminSchema);

module.exports = {
    User,
    Organizer,
    Admin
};
