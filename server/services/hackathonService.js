const { Hackathon, HackathonRegistration } = require("../database/hackathon");

const getComputedTimelineStatus = (hackathon) => {
  const now = new Date();
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);

  if (hackathon.status === "rejected" || hackathon.status === "cancelled") {
    return hackathon.status;
  }

  if (endDate < now) {
    return "ended";
  }

  if (startDate <= now && endDate >= now) {
    return "ongoing";
  }

  return "upcoming";
};

const buildHackathonSummary = async (hackathon, registrationCount = null) => {
  const participants =
    registrationCount !== null
      ? registrationCount
      : await HackathonRegistration.countDocuments({ hackathonId: hackathon._id });

  return {
    id: String(hackathon._id),
    _id: String(hackathon._id),
    title: hackathon.title,
    name: hackathon.title,
    description: hackathon.description,
    startDate: hackathon.startDate,
    endDate: hackathon.endDate,
    location: hackathon.location,
    address: hackathon.address || "",
    latitude: hackathon.latitude ?? null,
    longitude: hackathon.longitude ?? null,
    type: hackathon.mode,
    mode: hackathon.mode,
    totalPrize: hackathon.prize,
    prize: hackathon.prize,
    maxParticipants: hackathon.maxParticipants,
    participants,
    imageUrl: hackathon.imageUrl,
    organizer: hackathon.organizerName,
    organizerName: hackathon.organizerName,
    organizerId: String(hackathon.organizerId),
    registrationUrl: hackathon.registrationUrl,
    tags: hackathon.tags || [],
    approvalStatus: hackathon.status,
    status: getComputedTimelineStatus(hackathon),
    createdAt: hackathon.createdAt,
    updatedAt: hackathon.updatedAt,
    approvedAt: hackathon.approvedAt,
    rejectionReason: hackathon.rejectionReason || ""
  };
};

const fetchHackathons = async ({
  search = "",
  status = "",
  type = "",
  organizerId = "",
  approvalStatus = "approved"
} = {}) => {
  const query = {};

  if (approvalStatus) {
    query.status = approvalStatus;
  }

  if (organizerId) {
    query.organizerId = organizerId;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $elemMatch: { $regex: search, $options: "i" } } }
    ];
  }

  if (type) {
    query.mode = type;
  }

  const hackathons = await Hackathon.find(query).sort({ startDate: 1, createdAt: -1 }).lean();
  const registrationCounts = await HackathonRegistration.aggregate([
    {
      $match: {
        hackathonId: {
          $in: hackathons.map((item) => item._id)
        }
      }
    },
    {
      $group: {
        _id: "$hackathonId",
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = new Map(
    registrationCounts.map((item) => [String(item._id), item.count])
  );

  let summaries = await Promise.all(
    hackathons.map((hackathon) =>
      buildHackathonSummary(hackathon, countMap.get(String(hackathon._id)) || 0)
    )
  );

  if (status) {
    summaries = summaries.filter((item) => item.status === status);
  }

  return summaries;
};

const calculateHackathonStats = (hackathons) => {
  const totalPrizeValue = hackathons.reduce((sum, item) => {
    const numeric = Number(String(item.prize || "").replace(/[^\d.]/g, ""));
    return sum + (Number.isFinite(numeric) ? numeric : 0);
  }, 0);

  return {
    total: hackathons.length,
    upcoming: hackathons.filter((item) => item.status === "upcoming").length,
    ongoing: hackathons.filter((item) => item.status === "ongoing").length,
    ended: hackathons.filter((item) => item.status === "ended").length,
    totalPrize: totalPrizeValue ? `$${totalPrizeValue.toLocaleString()}` : "$0"
  };
};

module.exports = {
  Hackathon,
  HackathonRegistration,
  buildHackathonSummary,
  calculateHackathonStats,
  fetchHackathons
};
