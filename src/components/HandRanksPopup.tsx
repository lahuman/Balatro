import React from 'react';
import './HandRanksPopup.css';

interface HandRanksPopupProps {
  onClose: () => void;
}

const handRanks = [
  { name: 'Straight Flush', chipValue: 100, multiplier: 8 },
  { name: 'Four of a Kind', chipValue: 60, multiplier: 7 },
  { name: 'Full House', chipValue: 40, multiplier: 4 },
  { name: 'Flush', chipValue: 35, multiplier: 4 },
  { name: 'Straight', chipValue: 30, multiplier: 4 },
  { name: 'Three of a Kind', chipValue: 20, multiplier: 3 },
  { name: 'Two Pair', chipValue: 15, multiplier: 2 },
  { name: 'One Pair', chipValue: 10, multiplier: 2 },
  { name: 'High Card', chipValue: 5, multiplier: 1 },
];

const HandRanksPopup: React.FC<HandRanksPopupProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Hand Ranks</h2>
        <table>
          <thead>
            <tr>
              <th>Hand</th>
              <th>Chips</th>
              <th>Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {handRanks.map((hand) => (
              <tr key={hand.name}>
                <td>{hand.name}</td>
                <td>{hand.chipValue}</td>
                <td>{hand.multiplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default HandRanksPopup;