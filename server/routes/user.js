const { Router } = require("express");
const bcryptjs = require("bcryptjs");
const { User, Organizer, Admin } = require("../database/user");

const userRouter = Router();

/* ================= VALIDATION HELPERS ================= */
const validateSignupInput = (email, password, firstName, lastName, phoneNumber, organizationName = null) => {
    const errors = [];

    // Email validation
    if (!email) {
        errors.push("Email is required");
    } else if (!email.includes("@")) {
        errors.push("Please provide a valid email");
    }

    // Password validation
    if (!password) {
        errors.push("Password is required");
    } else {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            errors.push("Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)");
        }
    }

    // First name validation
    if (!firstName) {
        errors.push("First name is required");
    } else if (typeof firstName !== "string" || firstName.trim().length === 0) {
        errors.push("First name must be a non-empty string");
    }

    // Last name validation
    if (!lastName) {
        errors.push("Last name is required");
    } else if (typeof lastName !== "string" || lastName.trim().length === 0) {
        errors.push("Last name must be a non-empty string");
    }

    // Phone number validation
    if (!phoneNumber) {
        errors.push("Phone number is required");
    } else if (!/^\d{10}$/.test(phoneNumber)) {
        errors.push("Phone number must be exactly 10 digits");
    }

    // Organization name validation for organizers
    if (organizationName !== null && (!organizationName || typeof organizationName !== "string" || organizationName.trim().length === 0)) {
        errors.push("Organization name is required for organizers");
    }

    return errors;
};

// Helper function to hash password
const hashPassword = async (password) => {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(password, salt);
};

// Helper function to compare passwords
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs.compare(password, hashedPassword);
};

/* ================= USER SIGNUP ================= */
userRouter.post("/signup", async (req, res) => {
    try {
        const { email, password, firstName, lastName, phoneNumber, role = 'user' } = req.body;
        
        console.log("Signup request received:", { email, firstName, lastName, phoneNumber, role });

        // Validate input
        const validationErrors = validateSignupInput(email, password, firstName, lastName, phoneNumber);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationErrors
            });
        }

        // Check if user already exists in their respective collection
        let existingUser;
        if (role === 'organizer') {
            existingUser = await Organizer.findOne({ email: email.toLowerCase() });
        } else if (role === 'admin') {
            existingUser = await Admin.findOne({ email: email.toLowerCase() });
        } else {
            existingUser = await User.findOne({ email: email.toLowerCase() });
        }

        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(409).json({
                message: "User already exists"
            });
        }

        let user;
        const hashedPassword = await hashPassword(password);

        if (role === 'organizer') {
            const { organizationName } = req.body;
            const orgErrors = validateSignupInput(email, password, firstName, lastName, phoneNumber, organizationName);
            if (orgErrors.length > 0) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: orgErrors
                });
            }

            user = await Organizer.create({
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber,
                organizationName: organizationName.trim()
            });
        } else if (role === 'admin') {
            user = await Admin.create({
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });
        } else {
            user = await User.create({
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber
            });
        }

        console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} created successfully:`, user._id.toString());

        res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
            userId: user._id.toString(),
            role: role,
            email: user.email,
            firstName: user.firstName
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* ================= SIGNIN ================= */
userRouter.post("/signin", async (req, res) => {
    try {
        const { email, password, role = 'user' } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        let user;

        // Authenticate based on role
        if (role === 'organizer') {
            user = await Organizer.findOne({ email: email.toLowerCase() });
        } else if (role === 'admin') {
            user = await Admin.findOne({ email: email.toLowerCase() });
        } else {
            user = await User.findOne({ email: email.toLowerCase() });
        }

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare passwords using bcrypt
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log(`${role} signin successful:`, email);

        res.json({
            message: "Signin successful",
            userId: user._id.toString(),
            role: role,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* ================= GET PROFILE ================= */
userRouter.get("/profile/:userId/:role", async (req, res) => {
    try {
        const { userId, role } = req.params;

        if (!userId || !role) {
            return res.status(400).json({
                message: "User ID and role are required"
            });
        }

        let user;

        if (role === 'organizer') {
            user = await Organizer.findById(userId).select('-password');
        } else if (role === 'admin') {
            user = await Admin.findById(userId).select('-password');
        } else {
            user = await User.findById(userId).select('-password');
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile fetched successfully",
            profile: user
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* ================= UPDATE PROFILE ================= */
userRouter.put("/profile/:userId/:role", async (req, res) => {
    try {
        const { userId, role } = req.params;
        const updateData = req.body;

        if (!userId || !role) {
            return res.status(400).json({
                message: "User ID and role are required"
            });
        }

        // Prevent password updates through profile endpoint
        if (updateData.password) {
            delete updateData.password;
        }

        // Trim string fields
        const cleanedData = {};
        for (const key in updateData) {
            if (typeof updateData[key] === 'string') {
                cleanedData[key] = updateData[key].trim();
            } else {
                cleanedData[key] = updateData[key];
            }
        }

        let user;

        if (role === 'organizer') {
            user = await Organizer.findByIdAndUpdate(userId, cleanedData, { new: true }).select('-password');
        } else if (role === 'admin') {
            user = await Admin.findByIdAndUpdate(userId, cleanedData, { new: true }).select('-password');
        } else {
            user = await User.findByIdAndUpdate(userId, cleanedData, { new: true }).select('-password');
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        console.log(`${role} profile updated successfully:`, userId);

        res.json({
            message: "Profile updated successfully",
            profile: user
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = {
    userRouter
};
