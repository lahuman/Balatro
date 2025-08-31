import type { Card, Hand, Rank } from '../types';

export const RANK_ORDER = '23456789TJQKA';

export const getRankIndex = (rank: string) => RANK_ORDER.indexOf(rank);

export const getRankValue = (rank: Rank): number => {
  if (rank === 'T') return 10;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  if (rank === 'A') return 14;
  return parseInt(rank, 10);
};


const getRanksInfo = (allRanks: Rank[], scoringRanks: Rank[]) => {
  const tempAllRanks = [...allRanks];
  
  scoringRanks.forEach(rank => {
    const index = tempAllRanks.indexOf(rank);
    if (index > -1) {
        tempAllRanks.splice(index, 1);
    }
  });
  
  return { scoringRanks, nonScoringRanks: tempAllRanks };
};

export const evaluateHand = (hand: Card[]): Hand => {
  if (hand.length === 0) {
    return { name: 'No cards', chipValue: 0, multiplier: 0, scores: [], scoringRanks: [], nonScoringRanks: [] };
  }

  const ranks: Rank[] = hand.map(c => c.rank).sort((a, b) => getRankIndex(a) - getRankIndex(b));
  const suits = hand.map(c => c.suit);

  const rankCounts: { [key: string]: number } = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as { [key:string]: number });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const highCardKickers = ranks.map(r => getRankValue(r as Rank)).sort((a, b) => b - a);

  const getRanksByCount = (count: number): Rank[] => {
    const matchedRanks: Rank[] = [];
    for (const rank in rankCounts) {
      if (rankCounts[rank] === count) {
        for (let i = 0; i < count; i++) {
          matchedRanks.push(rank as Rank);
        }
      }
    }
    return matchedRanks;
  }
  
  const getRanksByCounts = (counts: number[]): Rank[] => {
    let matchedRanks: Rank[] = [];
    counts.forEach(count => {
        matchedRanks = [...matchedRanks, ...getRanksByCount(count)];
    })
    return matchedRanks;
  }

  // 5-card hands
  if (hand.length === 5) {
    const isFlush = new Set(suits).size === 1;
    const isStraight = ranks.every((rank, i) => {
      if (i === 0) return true;
      return getRankIndex(ranks[i-1]) === getRankIndex(rank) - 1;
    }) || (ranks.join('') === '2345A');

    if (isStraight && isFlush) {
      const ranksInfo = getRanksInfo(ranks, ranks);
      return { name: 'Straight Flush', chipValue: 100, multiplier: 8, scores: highCardKickers, ...ranksInfo };
    }
    if (isFlush) {
      const ranksInfo = getRanksInfo(ranks, ranks);
      return { name: 'Flush', chipValue: 35, multiplier: 4, scores: highCardKickers, ...ranksInfo };
    }
    if (isStraight) {
      const ranksInfo = getRanksInfo(ranks, ranks);
      return { name: 'Straight', chipValue: 30, multiplier: 4, scores: highCardKickers, ...ranksInfo };
    }
  }

  if (counts[0] === 4) {
    const scoringRanks = getRanksByCount(4);
    const ranksInfo = getRanksInfo(ranks, scoringRanks);
    return { name: 'Four of a Kind', chipValue: 60, multiplier: 7, scores: highCardKickers, ...ranksInfo };
  }
  if (counts[0] === 3 && counts[1] === 2) {
    const scoringRanks = getRanksByCounts([3, 2]);
    const ranksInfo = getRanksInfo(ranks, scoringRanks);
    return { name: 'Full House', chipValue: 40, multiplier: 4, scores: highCardKickers, ...ranksInfo };
  }
  if (counts[0] === 3) {
    const scoringRanks = getRanksByCount(3);
    const ranksInfo = getRanksInfo(ranks, scoringRanks);
    return { name: 'Three of a Kind', chipValue: 20, multiplier: 3, scores: highCardKickers, ...ranksInfo };
  }
  if (counts[0] === 2 && counts[1] === 2) {
    const scoringRanks = getRanksByCount(2);
    const ranksInfo = getRanksInfo(ranks, scoringRanks);
    return { name: 'Two Pair', chipValue: 15, multiplier: 2, scores: highCardKickers, ...ranksInfo };
  }
  if (counts[0] === 2) {
    const scoringRanks = getRanksByCount(2);
    const ranksInfo = getRanksInfo(ranks, scoringRanks);
    return { name: 'One Pair', chipValue: 10, multiplier: 2, scores: highCardKickers, ...ranksInfo };
  }

  const highestRank = ranks[ranks.length - 1];
  const scoringRanks = [highestRank];
  const ranksInfo = getRanksInfo(ranks, scoringRanks);
  return { name: 'High Card', chipValue: 5, multiplier: 1, scores: highCardKickers, ...ranksInfo };
};