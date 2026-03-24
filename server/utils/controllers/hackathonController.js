const {
  fetchAllHackathons,
  calculateHackathonStats
} = require('../../services/hackathonService');

const getHackathons = async (req, res) => {
  try {
    const { search = '', status = '', type = '' } = req.query;

    let hackathons = await fetchAllHackathons();

    if (search) {
      hackathons = hackathons.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      hackathons = hackathons.filter((item) => item.status === status);
    }

    if (type) {
      hackathons = hackathons.filter((item) => item.type === type);
    }

    res.json({
      hackathons,
      total: hackathons.length
    });
  } catch (error) {
    console.error('Error in getHackathons:', error.message);
    res.status(500).json({
      message: 'Failed to fetch hackathons'
    });
  }
};

const getHackathonStats = async (req, res) => {
  try {
    const hackathons = await fetchAllHackathons();
    const stats = calculateHackathonStats(hackathons);

    res.json(stats);
  } catch (error) {
    console.error('Error in getHackathonStats:', error.message);
    res.status(500).json({
      message: 'Failed to fetch hackathon stats'
    });
  }
};

module.exports = {
  getHackathons,
  getHackathonStats
};
