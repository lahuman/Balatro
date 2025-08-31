import type { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const getChipValue = (rank: Rank): number => {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J', 'T'].includes(rank)) return 10;
  return parseInt(rank);
};

export const createDeck = (): Card[] => {
  return SUITS.flatMap(suit => 
    RANKS.map(rank => ({ suit, rank, chipValue: getChipValue(rank) }))
  );
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};