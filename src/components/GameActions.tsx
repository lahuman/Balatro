import React from 'react';

interface GameActionsProps {
  onStartGame: () => void;
  onPlayHand: () => void;
  onDiscardAndDraw: () => void;
  onNextRound: () => void;
  gameState: string;
  winnerText: string;
  hands: number;
  draws: number;
}

const GameActions: React.FC<GameActionsProps> = ({ onStartGame, onPlayHand, onDiscardAndDraw, onNextRound, gameState, winnerText, hands, draws }) => {
  return (
    <div className="game-actions">
      {gameState === 'new-game' && <button onClick={onStartGame}>Start Game</button>}
      {gameState === 'player-turn' && (
        <div>
          <button onClick={onPlayHand} disabled={hands === 0}>Play Hand</button>
          <button onClick={onDiscardAndDraw} disabled={draws === 0}>Discard and Draw</button>
        </div>
      )}
      {gameState === 'round-ended' && <button onClick={onNextRound}>Next Round</button>}
      {gameState === 'game-over' && <button onClick={onStartGame}>New Game</button>}
      {winnerText && <h2 className="winner-text">{winnerText}</h2>}
    </div>
  );
};

export default GameActions;
