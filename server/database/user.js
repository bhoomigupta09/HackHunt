const { Router } = require("express");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");

const userRouter = Router();
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user"], immutable: true },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    joinedHackathons: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    favoriteHackathons: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

const organizerSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, default: "organizer", enum: ["organizer"], immutable: true },
    organizationName: { type: String, required: true },
    organizationWebsite: { type: String, default: null },
    organizationLogo: { type: String, default: null },
    bio: { type: String, default: "" },
    hackathonsCreated: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    hackathonsManaged: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    isVerified: { type: Boolean, default: false },
    verificationDocument: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

const adminSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, default: "admin", enum: ["admin"], immutable: true },
    adminLevel: {
      type: String,
      enum: ["super_admin", "moderator", "support"],
      default: "moderator"
    },
    profilePicture: { type: String, default: null },
    permissions: { type: [String], default: ["view_users", "view_hackathons"] },
    usersManaged: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    activityLog: {
      type: [
        {
          action: String,
          targetId: mongoose.Schema.Types.ObjectId,
          targetType: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

const User = mongoose.models.users || mongoose.model("users", userSchema);
const Organizer =
  mongoose.models.organizers || mongoose.model("organizers", organizerSchema);
const Admin = mongoose.models.admins || mongoose.model("admins", adminSchema);

const getModelForRole = (role = "user") => {
  if (role === "organizer") return Organizer;
  if (role === "admin") return Admin;
  return User;
};

const validateSignupInput = (
  email,
  password,
  firstName,
  lastName,
  phoneNumber,
  organizationName = null
) => {
  const errors = [];
  const normalizedPhoneNumber = String(phoneNumber || "").replace(/\D/g, "");

  if (!email || !email.includes("@")) errors.push("Please provide a valid email");
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!firstName) errors.push("First name is required");
  if (!lastName) errors.push("Last name is required");
  if (!normalizedPhoneNumber || !/^(\d{10}|0\d{10}|91\d{10})$/.test(normalizedPhoneNumber)) {
    errors.push("Phone number must be 10 digits, or include a leading 0 / 91");
  }
  if (organizationName !== null && !organizationName) {
    errors.push("Organization name is required for organizers");
  }

  return errors;
};

const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcryptjs.compare(password, hashedPassword);
};

userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role = "user" } =
      req.body;
    const validationErrors = validateSignupInput(
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role === "organizer" ? req.body.organizationName : null
    );

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const model = getModelForRole(role);
    const normalizedEmail = email.toLowerCase();
    const normalizedPhoneNumber = String(phoneNumber).replace(/\D/g, "");
    const existingUser = await model.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await model.create({
      ...req.body,
      email: normalizedEmail,
      phoneNumber: normalizedPhoneNumber,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password, role = "user" } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const model = getModelForRole(role);
    const user = await model.findOne({ email: email.toLowerCase() });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Signin successful",
      userId: user._id,
      role,
      firstName: user.firstName,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.get("/profile/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    const model = getModelForRole(role);
    const user = await model.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.put("/profile/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    const model = getModelForRole(role);
    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "profilePicture",
      "bio",
      "skills",
      "organizationName",
      "organizationWebsite",
      "organizationLogo"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const user = await model
      .findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { User, Organizer, Admin, userRouter };
