import React from 'react';
import type { Card as CardType } from '../types';
import './Card.css';

interface CardProps {
  card: CardType;
  onCardClick: (card: CardType) => void;
  isSelected: boolean;
  isDiscarding?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const suitSymbols = {
  H: '♥',
  D: '♦',
  C: '♣',
  S: '♠',
};

const Card: React.FC<CardProps> = ({ card, onCardClick, isSelected, isDiscarding, className, style }) => {
  const { rank, suit } = card;
  const color = (suit === 'H' || suit === 'D') ? 'red' : 'black';

  return (
    <div
      className={`card ${color} ${isSelected ? 'selected' : ''} ${isDiscarding ? 'discarding' : ''} ${className || ''}`}
      onClick={() => onCardClick(card)}
      style={style}
    >
      <div className="rank top">{rank}</div>
      <div className="suit">{suitSymbols[suit]}</div>
      <div className="rank bottom">{rank}</div>
    </div>
  );
};

export default Card;
