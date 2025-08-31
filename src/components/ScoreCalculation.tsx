import React, { useEffect, useState } from 'react';
import type { Card as CardType, Hand } from '../types';
import Card from './Card';
import './ScoreCalculation.css';
import { getRankValue } from '../utils/score';

interface ScoreCalculationProps {
  calculation: {
    hand: Hand;
    cards: CardType[];
  };
  onAnimationEnd: () => void;
}

const ScoreCalculation: React.FC<ScoreCalculationProps> = ({ calculation, onAnimationEnd }) => {
  const { hand, cards } = calculation;

  const scoringCards: CardType[] = [];
  const nonScoringCards: CardType[] = [];
  
  if (hand.scoringRanks) {
    const tempScoringRanks = [...hand.scoringRanks];
    cards.forEach(card => {
      const index = tempScoringRanks.indexOf(card.rank);
      if (index > -1) {
        scoringCards.push(card);
        tempScoringRanks.splice(index, 1);
      } else {
        nonScoringCards.push(card);
      }
    });
  } else {
    // Fallback if scoringRanks is not available
    nonScoringCards.push(...cards);
  }

  const cardChips = hand.scoringRanks.reduce((sum, rank) => sum + getRankValue(rank), 0);
  const totalScore = (hand.chipValue * hand.multiplier) + cardChips;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 3000); // 3 second animation
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className={`score-calculation-overlay ${visible ? 'visible' : ''}`}>
      <div className="score-calculation-content">
        <div className="played-cards">
          <div className="scoring-cards">
            <h3>Scoring Cards</h3>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              {scoringCards.map((card, index) => (
                <Card key={index} card={card} onCardClick={() => {}} isSelected={false} style={{ animationDelay: `${index * 0.1}s` }} className="played-card" />
              ))}
            </div>
          </div>
          {nonScoringCards.length > 0 && (
            <div className="non-scoring-cards">
              <h3>Non-scoring Cards</h3>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                {nonScoringCards.map((card, index) => (
                  <Card key={index} card={card} onCardClick={() => {}} isSelected={false} style={{ animationDelay: `${(scoringCards.length + index) * 0.1}s` }} className="played-card" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="calculation-formula">
          <h2>{hand.name}</h2>
          <p>({hand.chipValue} x {hand.multiplier}) + {cardChips} = <strong>{totalScore}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default ScoreCalculation;
