export type Suit = 'H' | 'D' | 'C' | 'S';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  chipValue: number;
}

export interface Hand {
  name: string;
  chipValue: number;
  multiplier: number;
  scores: number[];
  scoringRanks: Rank[];
  nonScoringRanks: Rank[];
}

export interface Blind {
  name: string;
  score: number;
}
