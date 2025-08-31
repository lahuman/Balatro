import React, { useState, useCallback, useEffect } from 'react';
import type { Card as CardType, Hand, Blind } from './types';
import { createDeck, shuffleDeck } from './utils/deck';
import { evaluateHand, getRankValue } from './utils/score';
import Card from './components/Card';
import GameActions from './components/GameActions';
import HandRanksPopup from './components/HandRanksPopup';
import ScoreCalculation from './components/ScoreCalculation';
import './App.css';
import './components/GameActions.css';

type GameState = 'new-game' | 'new-round' | 'player-turn' | 'round-ended' | 'game-over' | 'calculating-score';
type SortMethod = 'rank' | 'suit';

const blinds: Blind[] = [
  { name: 'Small Blind', score: 100 },
  { name: 'Big Blind', score: 200 },
  { name: 'Super Blind', score: 500 },
];

const SUIT_ORDER = ['S', 'H', 'C', 'D']; // Spades, Hearts, Clubs, Diamonds

const App: React.FC = () => {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [playerHandResult, setPlayerHandResult] = useState<Hand | null>(null);
  const [gameState, setGameState] = useState<GameState>('new-game');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hands, setHands] = useState(4);
  const [draws, setDraws] = useState(4);
  const [winnerText, setWinnerText] = useState('');
  const [showRanks, setShowRanks] = useState(false);
  const [dealing, setDealing] = useState(false);
  const [scoreCalculationData, setScoreCalculationData] = useState<{ hand: Hand, cards: CardType[] } | null>(null);
  const [sortMethod, setSortMethod] = useState<SortMethod>('rank');
  const [discardingCards, setDiscardingCards] = useState<CardType[]>([]);

  const sortHand = useCallback((hand: CardType[], method: SortMethod): CardType[] => {
    const sortedHand = [...hand].sort((a, b) => {
      if (method === 'rank') {
        const rankDiff = getRankValue(a.rank) - getRankValue(b.rank);
        if (rankDiff !== 0) return rankDiff;
        return SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
      } else { // 'suit'
        const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
        if (suitDiff !== 0) return suitDiff;
        return getRankValue(a.rank) - getRankValue(b.rank);
      }
    });
    return sortedHand;
  }, []);

  const startNewGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setHands(4);
    setDraws(4);
    setGameState('new-round');
  }, []);

  const startNewRound = useCallback(() => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);

    const player = shuffledDeck.slice(0, 8);
    const restOfDeck = shuffledDeck.slice(8);

    setPlayerHand(sortHand(player, 'rank'));
    setDeck(restOfDeck);
    setGameState('player-turn');
    setWinnerText('');
    setPlayerHandResult(null);
    setSelectedCards([]);
    setScore(0);
    setHands(4);
    setDraws(4);
    setDealing(true);
  }, [sortHand]);

  const handlePlayHand = useCallback(() => {
    if (hands > 0 && selectedCards.length > 0) {
      const result = evaluateHand(selectedCards);
      setPlayerHandResult(result);
      setScoreCalculationData({ hand: result, cards: selectedCards });
      setGameState('calculating-score');
    }
  }, [hands, selectedCards]);

  const handleScoreAnimationEnd = useCallback(() => {
    if (!scoreCalculationData) return;

    const { hand, cards } = scoreCalculationData;
    let cardChips = 0;
    if (hand.name === 'High Card') {
      const highestCard = cards.reduce((max, card) => card.chipValue > max.chipValue ? card : max, cards[0]);
      cardChips = highestCard.chipValue;
    } else if (hand.scoringRanks) {
      cardChips = cards
        .filter(card => hand.scoringRanks?.includes(card.rank))
        .reduce((sum, card) => sum + card.chipValue, 0);
    } else {
      cardChips = cards.reduce((sum, card) => sum + card.chipValue, 0);
    }
    const newScore = score + (hand.chipValue * hand.multiplier) + cardChips;
    setScore(newScore);

    const newDeck = [...deck];
    const newPlayerHand = playerHand.filter(
      (card) => !cards.some((selected) => selected.rank === card.rank && selected.suit === card.suit)
    );
    const cardsToDraw = cards.length;
    const newCards = newDeck.splice(0, cardsToDraw);
    const returnedDeck = [...newDeck, ...cards];
    setPlayerHand(sortHand([...newPlayerHand, ...newCards], sortMethod));
    setDeck(shuffleDeck(returnedDeck));
    setSelectedCards([]);
    setScoreCalculationData(null);

    if (newScore >= blinds[round].score) {
      if (round === blinds.length - 1) {
        setWinnerText('Congratulations! You have won the game!');
        setGameState('game-over');
      } else {
        setWinnerText('You beat the blind!');
        setRound(round + 1);
        setGameState('round-ended');
      }
    } else if (hands - 1 === 0) {
      setWinnerText('GAME OVER');
      setGameState('game-over');
    } else {
      setGameState('player-turn');
    }

    setHands(hands - 1);

  }, [deck, hands, playerHand, round, score, scoreCalculationData, sortMethod, sortHand]);

  const handleDiscardAndDraw = useCallback(() => {
    if (draws > 0 && selectedCards.length > 0) {
      setDiscardingCards(selectedCards);
    }
  }, [draws, selectedCards]);

  const handleCardClick = (card: CardType) => {
    setSelectedCards((prevSelected) => {
      if (prevSelected.some((selected) => selected.rank === card.rank && selected.suit === card.suit)) {
        return prevSelected.filter((selected) => !(selected.rank === card.rank && selected.suit === card.suit));
      } else {
        if (prevSelected.length < 5) {
          return [...prevSelected, card];
        } else {
          return prevSelected;
        }
      }
    });
  };

  const sortByRank = () => {
    setSortMethod('rank');
    setPlayerHand(sortHand(playerHand, 'rank'));
  };

  const sortBySuit = () => {
    setSortMethod('suit');
    setPlayerHand(sortHand(playerHand, 'suit'));
  };

  useEffect(() => {
    if (gameState === 'new-round') {
      startNewRound();
    }
  }, [gameState, startNewRound]);

  useEffect(() => {
    if (dealing) {
      const timer = setTimeout(() => setDealing(false), playerHand.length * 100 + 500);
      return () => clearTimeout(timer);
    }
  }, [dealing, playerHand.length]);

  useEffect(() => {
    if (discardingCards.length > 0) {
      const timer = setTimeout(() => {
        const newDeck = [...deck];
        const newPlayerHand = playerHand.filter(
          (card) => !discardingCards.some((discarded) => discarded.rank === card.rank && discarded.suit === card.suit)
        );
    
        const cardsToDraw = discardingCards.length;
        const newCards = newDeck.splice(0, cardsToDraw);
        const returnedDeck = [...newDeck, ...discardingCards];
    
        setPlayerHand(sortHand([...newPlayerHand, ...newCards], sortMethod));
        setDeck(shuffleDeck(returnedDeck));
        setSelectedCards([]);
        setDiscardingCards([]);
        setDraws(draws - 1);
      }, 500); // 0.5s animation
      return () => clearTimeout(timer);
    }
  }, [deck, draws, playerHand, sortHand, sortMethod, discardingCards]);

  

  return (
    <div className="app">
      <header className="app-header">
        <h1>Balatro Web</h1>
      </header>
      <div className="game-table">
        <div className="game-info">
          <h2>Round: {round + 1}</h2>
          <h2>Blind to Beat: {blinds[round].name} ({blinds[round].score})</h2>
          <h2>Your Score: {score}</h2>
          <h2>Hands: {hands}</h2>
          <h2>Draws: {draws}</h2>
          <button onClick={() => setShowRanks(true)}>Show Hand Ranks</button>
        </div>

        {showRanks && <HandRanksPopup onClose={() => setShowRanks(false)} />}
        {gameState === 'calculating-score' && scoreCalculationData && (
          <ScoreCalculation calculation={scoreCalculationData} onAnimationEnd={handleScoreAnimationEnd} />
        )}

        <GameActions
          onStartGame={startNewGame}
          onPlayHand={handlePlayHand}
          onDiscardAndDraw={handleDiscardAndDraw}
          onNextRound={() => setGameState('new-round')}
          gameState={gameState}
          winnerText={winnerText}
          hands={hands}
          draws={draws}
        />

        <div className="hand-container">
          <h2>Player's Hand {playerHandResult && `(${playerHandResult.name})`}</h2>
          <div className="sort-buttons">
            <button onClick={sortByRank}>Sort by Rank</button>
            <button onClick={sortBySuit}>Sort by Suit</button>
          </div>
          <div className="hand">
            {playerHand.map((card, index) => (
              <Card
                key={index}
                card={card}
                onCardClick={handleCardClick}
                isSelected={selectedCards.some(
                  (selected) => selected.rank === card.rank && selected.suit === card.suit
                )}
                isDiscarding={discardingCards.some(
                  (discarded) => discarded.rank === card.rank && discarded.suit === card.suit
                )}
                className={dealing ? 'deal-in' : ''}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

