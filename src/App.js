import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import data from './data.json';

// Import SVG icons for top 3 positions
import OneIcon from './images/one.svg';
import TwoIcon from './images/two.svg';
import ThreeIcon from './images/three.svg';

// Import toggle icons
import ToggleIcon from './images/toggle.svg';
import TooglegIcon from './images/toggleg.svg';

// Import new images
import IndividualImage from './images/individual.svg';
import GroupsImage from './images/groups.svg';

// Map category names to their corresponding SVG file paths (colored and grey)
const categoryIcons = {
  Citizens: {
    colored: '/images/citizens.svg',
    grey: '/images/citizensg.svg',
  },
  "Retro Funding Contribution": {
    colored: '/images/rcontribution.svg',
    grey: '/images/rcontribitiong.svg',
  },
  "Top 100 Delegate": {
    colored: '/images/topdelegate.svg',
    grey: '/images/topdelegateg.svg',
  },
  "Retro Funding Voters": {
    colored: '/images/rfvoter.svg',
    grey: '/images/rfvoterg.svg',
  },
  "Governance Contribution": {
    colored: '/images/governancec.svg',
    grey: '/images/governancecg.svg',
  },
  "Truemarket Attesters": {
    colored: '/images/truemarket.svg',
    grey: '/images/truemarketg.svg',
  },
  "Unaffiliated User": {
    colored: '/images/unaffiliated.svg',
  },
};

function App() {
  const [participants, setParticipants] = useState(data.participants);
  const [groups, setGroups] = useState(data.groups);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeHeader, setActiveHeader] = useState(null);
  const [categorySortStep, setCategorySortStep] = useState(0);

  // Pagination state for participants
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(participants.length / rowsPerPage);

  // Reference for the header
  const headerRef = useRef(null);

  // Calculate startingAmount, numberOfUsers, totalProfitUSD, and averageProfitPercentage for each group
  useEffect(() => {
    const updatedGroups = data.groups.map((group) => {
      const groupParticipants = participants.filter((participant) =>
        participant.categories.includes(group.groupName)
      );

      const startingAmount = groupParticipants.reduce(
        (sum, participant) => sum + participant.startingAmount,
        0
      );

      const numberOfUsers = groupParticipants.length;

      // Calculate totalProfitUSD and averageProfitPercentage
      const totalProfitUSD = groupParticipants.reduce(
        (sum, participant) => sum + participant.profitUSD,
        0
      );

      const averageProfitPercentage =
        numberOfUsers > 0
          ? groupParticipants.reduce(
              (sum, participant) => sum + participant.profitPercentage,
              0
            ) / numberOfUsers
          : 0;

      return {
        ...group,
        startingAmount,
        numberOfUsers,
        totalProfitUSD,
        averageProfitPercentage,
      };
    });

    setGroups(updatedGroups);
  }, [participants]);

  // Handle header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop === 0) {
        // At the top of the page, show the header
        headerRef.current.classList.remove('hide');
      } else {
        // Not at the top, hide the header
        headerRef.current.classList.add('hide');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to render position (icon or number)
  const renderPosition = (position) => {
    if (position === 1) {
      return <img src={OneIcon} alt="First Place" style={{ width: '24px', height: '24px', margin: '0', padding: '0' }} />;
    } else if (position === 2) {
      return <img src={TwoIcon} alt="Second Place" style={{ width: '24px', height: '24px', margin: '0', padding: '0' }} />;
    } else if (position === 3) {
      return <img src={ThreeIcon} alt="Third Place" style={{ width: '24px', height: '24px', margin: '0', padding: '0' }} />;
    } else {
      return <span style={{ margin: '0', padding: '0', verticalAlign: 'middle' }}>{position}</span>;
    }
  };

  // Helper function to truncate wallet addresses
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Sorting logic
  const sortData = (key, dataToSort, setData) => {
    let direction = 'desc'; // Default to descending on first click
    if (sortConfig.key === key) {
      // Toggle direction if the same column is clicked again
      direction = sortConfig.direction === 'desc' ? 'asc' : 'desc';
    }
    setSortConfig({ key, direction });
    setActiveHeader(key);

    const sortedData = [...dataToSort].sort((a, b) => {
      if (key === 'ensName' || key === 'groupName') {
        // Sort alphabetically
        return direction === 'asc'
          ? a[key]?.localeCompare(b[key] || '') || 0
          : b[key]?.localeCompare(a[key] || '') || 0;
      } else if (key === 'categories') {
        // Custom sorting logic for categories
        const categoryOrder = [
          'Citizens',
          'Retro Funding Contribution',
          'Top 100 Delegate',
          'Retro Funding Voters',
          'Governance Contribution',
          'Truemarket Attesters',
          'Unaffiliated User',
        ];
        const categoryIndexA = categoryOrder.indexOf(a.categories[categorySortStep % categoryOrder.length]);
        const categoryIndexB = categoryOrder.indexOf(b.categories[categorySortStep % categoryOrder.length]);
        return direction === 'asc' ? categoryIndexA - categoryIndexB : categoryIndexB - categoryIndexA;
      } else {
        // Sort numerically
        return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      }
    });

    setData(sortedData);
  };

  const isSortedColumn = (key) => sortConfig.key === key;

  // Get the current page's rows for the Participants table
  const currentParticipants = participants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="App">
      <header className="App-header" ref={headerRef}>
        <img src="/images/LOGO.svg" alt="Leaderboard Logo"  />
        <h1>Futarchy<br />Experiment</h1>
      </header>

      <div className="container">
        {/* Participants List */}
        <div className="section">
          {/* Add individual.svg image */}
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
  <img 
    src={IndividualImage} 
    alt="Individual" 
    style={{ width: '22%', maxWidth: '200px', height: 'auto' }} // Responsive sizing
  />
</div>

          <table className="styled-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', paddingRight: '20px' }}>#</th>
                <th
                  className={`left-align ${isSortedColumn('ensName') ? 'active' : ''}`}
                  onClick={() => sortData('ensName', participants, setParticipants)}
                  style={{ paddingLeft: '20px' }} // Add padding to the left of the second column
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'ensName' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Address
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('categories') ? 'active' : ''}`}
                  onClick={() => {
                    setCategorySortStep((prevStep) => prevStep + 1);
                    sortData('categories', participants, setParticipants);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'categories' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Categories
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('startingAmount') ? 'active' : ''}`}
                  onClick={() => sortData('startingAmount', participants, setParticipants)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'startingAmount' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Starting Amount
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('currentValue') ? 'active' : ''}`}
                  onClick={() => sortData('currentValue', participants, setParticipants)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'currentValue' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Current Value
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('profitUSD') ? 'active' : ''}`}
                  onClick={() => sortData('profitUSD', participants, setParticipants)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'profitUSD' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Profit (PLAY)
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('profitPercentage') ? 'active' : ''}`}
                  onClick={() => sortData('profitPercentage', participants, setParticipants)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'profitPercentage' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Profit (%)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentParticipants.map((participant, index) => {
                const position = (currentPage - 1) * rowsPerPage + index + 1;
                const displayName = participant.ensName || truncateAddress(participant.walletAddress);
                const rowClass = position === 1 ? 'rank-1' : position === 2 ? 'rank-2' : position === 3 ? 'rank-3' : '';
                return (
                  <tr key={index} className={rowClass}>
                    <td className="center-align" style={{ textAlign: 'center', padding: '0', margin: '0', paddingRight: '20px' }}>{renderPosition(position)}</td>
                    <td className="left-align" style={{ paddingLeft: '20px' }}>{displayName}</td>
                    <td className="center-align">
                      <div className="category-icons" style={{ padding: '0', margin: '0' }}>
                        {['Citizens', 'Retro Funding Contribution', 'Top 100 Delegate', 'Retro Funding Voters', 'Governance Contribution', 'Truemarket Attesters'].map((category) => {
                          const isActive = participant.categories.includes(category);
                          const iconSrc = isActive ? categoryIcons[category].colored : categoryIcons[category].grey;
                          return <img key={category} src={iconSrc} alt={category} style={{ width: '20px', height: '20px', margin: '0', padding: '0' }} />;
                        })}
                      </div>
                    </td>
                    <td>{participant.startingAmount}</td>
                    <td>{participant.currentValue}</td>
                    <td style={{ color: participant.profitUSD >= 0 ? 'green' : 'red' }}>{participant.profitUSD}</td>
                    <td style={{ color: participant.profitPercentage >= 0 ? 'green' : 'red' }}>{participant.profitPercentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
            <button
              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="section">
          {/* Add groups.svg image */}
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
  <img 
    src={GroupsImage} 
    alt="Groups" 
    style={{ width: '22%', maxWidth: '200px', height: 'auto' }} // Responsive sizing
  />
</div>

          <table className="styled-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', paddingRight: '20px' }}>#</th>
                <th
                  className={`left-align ${isSortedColumn('groupName') ? 'active' : ''}`}
                  onClick={() => sortData('groupName', groups, setGroups)}
                  style={{ paddingLeft: '20px' }} // Add padding to the left of the second column
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'groupName' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Group
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('numberOfUsers') ? 'active' : ''}`}
                  onClick={() => sortData('numberOfUsers', groups, setGroups)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'numberOfUsers' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    # of Users
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('startingAmount') ? 'active' : ''}`}
                  onClick={() => sortData('startingAmount', groups, setGroups)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'startingAmount' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Starting Amount
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('totalProfitUSD') ? 'active' : ''}`}
                  onClick={() => sortData('totalProfitUSD', groups, setGroups)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'totalProfitUSD' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Profit (PLAY)
                  </div>
                </th>
                <th
                  className={`clickable ${isSortedColumn('averageProfitPercentage') ? 'active' : ''}`}
                  onClick={() => sortData('averageProfitPercentage', groups, setGroups)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={activeHeader === 'averageProfitPercentage' ? ToggleIcon : TooglegIcon}
                      alt="toggle"
                      style={{ width: '8px', height: '6px', marginRight: '1px' }}
                    />
                    Profit (%)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => {
                const position = index + 1;
                const groupIcon = categoryIcons[group.groupName]?.colored;
                const rowClass = position === 1 ? 'rank-1' : position === 2 ? 'rank-2' : position === 3 ? 'rank-3' : '';
                return (
                  <tr key={index} className={rowClass}>
                    <td className="center-align" style={{ textAlign: 'center', padding: '0', margin: '0', paddingRight: '20px' }}>{renderPosition(position)}</td>
                    <td className="left-align" style={{ paddingLeft: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {groupIcon && (
                          <img
                            src={groupIcon}
                            alt={group.groupName}
                            style={{ width: '20px', height: '20px', marginRight: '8px' }}
                          />
                        )}
                        {group.groupName}
                      </div>
                    </td>
                    <td>{group.numberOfUsers}</td>
                    <td>{group.startingAmount}</td> {/* Removed the "$" symbol */}
                    <td style={{ color: group.totalProfitUSD >= 0 ? 'green' : 'red' }}>{group.totalProfitUSD}</td> {/* Removed the "$" symbol */}
                    <td style={{ color: group.averageProfitPercentage >= 0 ? 'green' : 'red' }}>
                      {group.averageProfitPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="App-footer">
        <p>Last Updated: {new Date(data.lastUpdated).toLocaleString()}</p>
      </footer>
    </div>
  );
}

export default App;