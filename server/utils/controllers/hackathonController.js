const { Organizer, Admin, User } = require("../../database/user");
const {
  Hackathon,
  HackathonRegistration,
  buildHackathonSummary,
  calculateHackathonStats,
  fetchHackathons
} = require("../../services/hackathonService");
const { broadcast, createActivity } = require("../../utils/realtimeHub");
const mongoose = require("mongoose");

// ✨ FIX 1: Smarter Date Parser (Fixes missing years turning into 2001)
const parseHackathonDateRange = (value) => {
  const now = new Date();
  const fallbackStart = now.toISOString();
  const fallbackEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();

  if (!value) return { startDate: fallbackStart, endDate: fallbackEnd };

  const normalized = String(value).trim();
  const parts = normalized.split("-").map(p => p.trim()).filter(Boolean);

  const extractYear = (text) => {
    const match = text.match(/(19|20)\d{2}/);
    return match ? match[0] : null;
  };

  let startStr = parts[0] || normalized;
  let endStr = parts.length > 1 ? parts[1] : startStr;

  let startYear = extractYear(startStr);
  let endYear = extractYear(endStr);
  const currentYear = now.getFullYear();

  // Agar scraper ne year nahi diya, toh current year assume karo
  if (!startYear && !endYear) {
    startStr += `, ${currentYear}`;
    endStr += `, ${currentYear}`;
  } else if (!startYear && endYear) {
    startStr += `, ${endYear}`;
  } else if (startYear && !endYear) {
    endStr += `, ${startYear}`;
  }

  const parsedStart = Date.parse(startStr);
  let parsedEnd = Date.parse(endStr);

  const finalStart = !Number.isNaN(parsedStart) ? new Date(parsedStart) : new Date();
  let finalEnd = !Number.isNaN(parsedEnd) 
    ? new Date(parsedEnd) 
    : new Date(finalStart.getTime() + 10 * 24 * 60 * 60 * 1000);

  // End date ko raat 11:59 PM par set karo taaki din mein close na ho jaye
  finalEnd.setHours(23, 59, 59, 999);

  return {
    startDate: finalStart.toISOString(),
    endDate: finalEnd.toISOString()
  };
};

// ✨ FIX 2: Strict Status Checker (Based purely on real dates)
const getAccurateStatus = (startDate, endDate, scrapedStatus) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const scraped = String(scrapedStatus || "").toLowerCase();

  // Agar website ne khud closed bola hai
  if (scraped === "closed" || scraped === "ended" || scraped === "past") return "ended";

  // Strict Date check
  if (end < now) return "ended";
  if (start > now) return "upcoming";

  return "open"; // Open/Active/Ongoing
};

const getLiveHackathons = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: false, total: 0, hackathons: [] });
    }

    const dbHackathons = await mongoose.connection.collection('hackathons').find({}).toArray();
    
    const formattedHackathons = dbHackathons.map((h, index) => {
      const { startDate, endDate } = parseHackathonDateRange(h.deadline || h.startDate || h.end_date);
      const status = getAccurateStatus(startDate, endDate, h.open_state || h.status || h.openState);

      return {
        ...h,
        id: h._id ? h._id.toString() : `live-${index}`,
        _id: h._id ? h._id.toString() : `live-${index}`,
        platform: h.source || h.source_name || h.organizer || "Database",
        image: h.thumbnail || h.imageUrl || h.image_url,
        type: h.type || "online",
        location: h.location || "Online",
        status,
        startDate,
        endDate,
        title: h.title,
        description: h.description,
        registrationUrl: h.url || h.registrationUrl || h.registration_url,
        totalPrize: h.totalPrize || h.total_prize || ""
      };
    });
    
    res.json({
      success: true,
      total: formattedHackathons.length,
      hackathons: formattedHackathons
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch live hackathons" });
  }
};

const getHackathons = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ hackathons: [], total: 0, databaseOffline: true });
    }

    const { search = "", status = "", type = "" } = req.query;

    const dbHackathons = await mongoose.connection.collection('hackathons').find({}).toArray();

    let formattedHackathons = dbHackathons.map((h, index) => {
      const { startDate, endDate } = parseHackathonDateRange(h.deadline || h.startDate || h.end_date);
      const mappedStatus = getAccurateStatus(startDate, endDate, h.open_state || h.status || h.openState);

      return {
        ...h,
        id: h._id ? h._id.toString() : `live-${index}`,
        _id: h._id ? h._id.toString() : `live-${index}`,
        platform: h.source || h.source_name || h.organizer || "Database",
        image: h.thumbnail || h.imageUrl || h.image_url,
        type: h.type || "online",
        location: h.location || "Online",
        status: mappedStatus,
        startDate,
        endDate,
        title: h.title,
        description: h.description,
        registrationUrl: h.url || h.registrationUrl || h.registration_url,
        totalPrize: h.totalPrize || h.total_prize || ""
      };
    });

    // Filtering
    if (search) {
      const searchLower = search.toLowerCase();
      formattedHackathons = formattedHackathons.filter(h => 
        (h.title && h.title.toLowerCase().includes(searchLower)) || 
        (h.description && h.description.toLowerCase().includes(searchLower))
      );
    }
    if (status) {
      formattedHackathons = formattedHackathons.filter(h => h.status === status);
    }
    if (type) {
      formattedHackathons = formattedHackathons.filter(h => 
        h.type && h.type.toLowerCase() === type.toLowerCase()
      );
    }

    // ✨ FIX 3: Smart Sorting (Open -> Upcoming -> Ended)
    formattedHackathons.sort((a, b) => {
      const statusWeight = { "open": 1, "upcoming": 2, "ended": 3 };
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[a.status] - statusWeight[b.status];
      }
      return new Date(a.endDate) - new Date(b.endDate);
    });

    res.json({
      hackathons: formattedHackathons,
      total: formattedHackathons.length
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hackathons from MongoDB" });
  }
};

const getHackathonStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ total: 0, upcoming: 0, ongoing: 0, ended: 0, totalPrize: "$0" });
    }

    const dbHackathons = await mongoose.connection.collection('hackathons').find({}).toArray();

    let upcoming = 0;
    let ongoing = 0;
    let ended = 0;

    dbHackathons.forEach(h => {
      const { startDate, endDate } = parseHackathonDateRange(h.deadline || h.startDate || h.end_date);
      const status = getAccurateStatus(startDate, endDate, h.open_state || h.status || h.openState);

      if (status === 'upcoming') upcoming++;
      else if (status === 'open') ongoing++;
      else ended++;
    });

    res.json({
      total: dbHackathons.length,
      upcoming,
      ongoing,
      ended,
      totalPrize: "Various", 
      databaseOffline: false
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hackathon stats" });
  }
};

const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found." });
    const summary = await buildHackathonSummary(hackathon);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hackathon." });
  }
};

const getOrganizerHackathons = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const hackathons = await fetchHackathons({ organizerId, approvalStatus: "" });
    res.json({ hackathons, total: hackathons.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch organizer hackathons." });
  }
};

const getAdminHackathons = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ hackathons: [], total: 0, databaseOffline: true });
    const { status = "" } = req.query;
    const query = status ? { status } : {};
    const hackathons = await Hackathon.find(query).sort({ createdAt: -1 });
    const summaries = await Promise.all(hackathons.map((h) => buildHackathonSummary(h)));
    res.json({ hackathons: summaries, total: summaries.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin hackathons." });
  }
};

const createHackathon = async (req, res) => {
  try {
    const {
      title, description, startDate, endDate, location, address, latitude, longitude,
      mode, prize, maxParticipants, imageUrl, tags, registrationUrl, organizerId
    } = req.body;

    if (!title || !description || !startDate || !endDate || !location || !organizerId) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const organizer = await Organizer.findById(organizerId);
    if (!organizer) return res.status(404).json({ message: "Organizer not found." });

    const hackathon = await Hackathon.create({
      title, description, startDate, endDate, location, address: address || "",
      latitude: latitude === undefined || latitude === null || latitude === "" ? null : Number(latitude),
      longitude: longitude === undefined || longitude === null || longitude === "" ? null : Number(longitude),
      mode: mode || "online", prize, maxParticipants: Number(maxParticipants) || 100,
      imageUrl,
      tags: Array.isArray(tags) ? tags : String(tags || "").split(",").map((item) => item.trim()).filter(Boolean),
      registrationUrl, organizerId: organizer._id,
      organizerName: organizer.organizationName || `${organizer.firstName} ${organizer.lastName}`.trim()
    });

    organizer.hackathonsCreated = [...(organizer.hackathonsCreated || []), hackathon._id];
    if (!organizer.hackathonsManaged?.includes(hackathon._id)) {
      organizer.hackathonsManaged = [...(organizer.hackathonsManaged || []), hackathon._id];
    }
    await organizer.save();

    const summary = await buildHackathonSummary(hackathon, 0);
    broadcast("hackathon:created", summary);
    res.status(201).json({ message: "Hackathon submitted for approval.", hackathon: summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to create hackathon." });
  }
};

const updateHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizerId } = req.body;
    const hackathon = await Hackathon.findById(id);

    if (!hackathon) return res.status(404).json({ message: "Hackathon not found." });
    if (String(hackathon.organizerId) !== String(organizerId)) return res.status(403).json({ message: "Unauthorized." });

    const editableFields = ["title", "description", "startDate", "endDate", "location", "address", "latitude", "longitude", "mode", "prize", "maxParticipants", "imageUrl", "registrationUrl"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) hackathon[field] = req.body[field];
    });

    if (req.body.tags !== undefined) {
      hackathon.tags = Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || "").split(",").map(i => i.trim()).filter(Boolean);
    }

    hackathon.status = "pending";
    await hackathon.save();

    const summary = await buildHackathonSummary(hackathon);
    broadcast("hackathon:updated", summary);
    res.json({ message: "Hackathon updated.", hackathon: summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to update." });
  }
};

const deleteHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizerId } = req.body;
    const hackathon = await Hackathon.findById(id);

    if (!hackathon) return res.status(404).json({ message: "Not found." });
    if (String(hackathon.organizerId) !== String(organizerId)) return res.status(403).json({ message: "Unauthorized." });

    await HackathonRegistration.deleteMany({ hackathonId: hackathon._id });
    await Hackathon.findByIdAndDelete(id);

    broadcast("hackathon:deleted", { hackathonId: id });
    res.json({ message: "Deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete." });
  }
};

const updateHackathonApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminId, rejectionReason = "" } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status." });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found." });

    hackathon.status = status;
    hackathon.approvedBy = admin._id;
    hackathon.approvedAt = new Date();
    hackathon.rejectionReason = status === "rejected" ? rejectionReason : "";
    await hackathon.save();

    const summary = await buildHackathonSummary(hackathon);
    broadcast("hackathon:approval-updated", summary);
    res.json({ message: `Hackathon ${status}.`, hackathon: summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to update approval." });
  }
};

const getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;
    const registrations = await HackathonRegistration.find({ userId }).sort({ createdAt: -1 }).lean();
    const hackathonIds = registrations.map((item) => item.hackathonId);
    const hackathons = await Hackathon.find({ _id: { $in: hackathonIds } }).lean();
    const hackathonMap = new Map(hackathons.map((item) => [String(item._id), item]));

    const items = registrations.map((registration) => {
      const hackathon = hackathonMap.get(String(registration.hackathonId));
      if (!hackathon) return null;
      return {
        _id: String(registration._id),
        hackathonId: String(hackathon._id),
        hackathonName: hackathon.title,
        registrationDate: registration.createdAt,
        status: registration.status,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        location: hackathon.location
      };
    }).filter(Boolean);

    res.json({ registrations: items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
};

const registerForHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, teamName = "", teamMembers = 1 } = req.body;
    const user = await User.findById(userId);
    const hackathon = await Hackathon.findById(id);

    if (!user || !hackathon) return res.status(404).json({ message: "Not found." });

    const existing = await HackathonRegistration.findOne({ hackathonId: hackathon._id, userId: user._id });
    if (existing) return res.status(409).json({ message: "Already registered." });

    const registration = await HackathonRegistration.create({
      hackathonId: hackathon._id, userId: user._id, teamName, teamMembers: Number(teamMembers) || 1
    });

    if (!user.joinedHackathons?.includes(hackathon._id)) {
      user.joinedHackathons = [...(user.joinedHackathons || []), hackathon._id];
      await user.save();
    }

    broadcast("registration:created", { hackathonId: String(hackathon._id), userId: String(user._id) });
    res.status(201).json({ message: "Registered successfully.", registrationId: String(registration._id) });
  } catch (error) {
    res.status(500).json({ message: "Registration failed." });
  }
};

const unregisterFromHackathon = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await HackathonRegistration.findById(registrationId);
    if (!registration) return res.status(404).json({ message: "Registration not found." });

    const user = await User.findById(registration.userId);
    await HackathonRegistration.findByIdAndDelete(registration._id);

    if (user) {
      user.joinedHackathons = (user.joinedHackathons || []).filter(item => String(item) !== String(registration.hackathonId));
      await user.save();
    }

    broadcast("registration:deleted", { hackathonId: String(registration.hackathonId), userId: String(registration.userId) });
    res.json({ message: "Unregistered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unregistration failed." });
  }
};

module.exports = {
  createHackathon, deleteHackathon, getAdminHackathons, getHackathonById, getHackathons,
  getLiveHackathons, getHackathonStats, getOrganizerHackathons, getUserRegistrations,
  registerForHackathon, unregisterFromHackathon, updateHackathon, updateHackathonApproval
};