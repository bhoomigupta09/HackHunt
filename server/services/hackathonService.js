const fetchAllHackathons = async () => {
  const hackathons = [
    {
      id: '1',
      title: 'AI Innovation Challenge',
      platform: 'Devfolio',
      status: 'upcoming',
      type: 'online',
      prize: '$5000',
      location: 'India',
      lastDate: '2026-03-25',
      url: 'https://example.com/1',
      image: 'https://via.placeholder.com/400'
    },
    {
      id: '2',
      title: 'Web3 Buildathon',
      platform: 'Unstop',
      status: 'ongoing',
      type: 'offline',
      prize: '$3000',
      location: 'Delhi',
      lastDate: '2026-03-18',
      url: 'https://example.com/2',
      image: 'https://via.placeholder.com/400'
    },
    {
      id: '3',
      title: 'Hack the Future',
      platform: 'MLH',
      status: 'ended',
      type: 'online',
      prize: '$2000',
      location: 'Global',
      lastDate: '2026-03-10',
      url: 'https://example.com/3',
      image: 'https://via.placeholder.com/400'
    }
  ];

  return hackathons;
};

const calculateHackathonStats = (hackathons) => {
  return {
    total: hackathons.length,
    upcoming: hackathons.filter((item) => item.status === 'upcoming').length,
    ongoing: hackathons.filter((item) => item.status === 'ongoing').length,
    ended: hackathons.filter((item) => item.status === 'ended').length,
    totalPrize: '$10000'
  };
};

module.exports = {
  fetchAllHackathons,
  calculateHackathonStats
};