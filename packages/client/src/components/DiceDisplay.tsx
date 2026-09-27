/**
 * 3D Dice display component with all 6 faces
 */

import { Dice } from '@kniffel/shared';
import './DiceDisplay.css';

interface DiceDisplayProps {
  dice: Dice[];
  onHoldDie: (dieIndex: number) => void;
  isRolling?: boolean;
}

// Correct pip positions for each die value (0-5 positions on 3x3 grid)
const pipPositions: Record<number, number[]> = {
  1: [4], // center
  2: [0, 8], // top-left, bottom-right diagonal
  3: [0, 4, 8], // diagonal line
  4: [0, 2, 6, 8], // four corners
  5: [0, 2, 4, 6, 8], // four corners + center
  6: [0, 2, 3, 5, 6, 8], // two columns (top-left, top-right, mid-left, mid-right, bottom-left, bottom-right)
};

// Each pip number maps to grid position
const gridPositions = [
  { x: 0, y: 0 }, // 0: top-left
  { x: 1, y: 0 }, // 1: top-center
  { x: 2, y: 0 }, // 2: top-right
  { x: 0, y: 1 }, // 3: mid-left
  { x: 1, y: 1 }, // 4: center
  { x: 2, y: 1 }, // 5: mid-right
  { x: 0, y: 2 }, // 6: bottom-left
  { x: 1, y: 2 }, // 7: bottom-center
  { x: 2, y: 2 }, // 8: bottom-right
];

// Rotation angles for each face (which die value shows which rotation)
const faceRotations: Record<number, { rotateX: number; rotateY: number; rotateZ: number }> = {
  1: { rotateX: 0, rotateY: 0, rotateZ: 0 }, // front
  6: { rotateX: 0, rotateY: 180, rotateZ: 0 }, // back
  2: { rotateX: 0, rotateY: -90, rotateZ: 0 }, // left
  5: { rotateX: 0, rotateY: 90, rotateZ: 0 }, // right
  3: { rotateX: -90, rotateY: 0, rotateZ: 0 }, // top
  4: { rotateX: 90, rotateY: 0, rotateZ: 0 }, // bottom
};

export default function DiceDisplay({ dice, onHoldDie, isRolling = false }: DiceDisplayProps) {
  if (dice.length === 0) {
    return <div className="dice-display-empty">Click Roll to start rolling dice</div>;
  }

  return (
    <div className="dice-display">
      {dice.map((die, index) => {
        const rotation = faceRotations[die.value] || faceRotations[1];
        return (
          <div
            key={index}
            className={`die-container ${die.held ? 'held' : ''} ${isRolling ? 'rolling' : ''}`}
            onClick={() => onHoldDie(index)}
            title={die.held ? 'Click to release' : 'Click to hold'}
          >
            <div
              className="die-3d"
              style={
                die.held 
                  ? { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)' }
                  : { transform: `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg) rotateZ(${rotation.rotateZ}deg)` }
              }
            >
              {die.held ? (
                // For held dice: show only front face with current value's pips
                <div className="die-face die-face-1">
                  {renderPips(die.value)}
                </div>
              ) : (
                // For rolling dice: show all 6 faces for 3D effect
                <>
                  {/* Face 1 - Front */}
                  <div className="die-face die-face-1">
                    {renderPips(1)}
                  </div>
                  {/* Face 6 - Back */}
                  <div className="die-face die-face-6">
                    {renderPips(6)}
                  </div>
                  {/* Face 2 - Right */}
                  <div className="die-face die-face-2">
                    {renderPips(2)}
                  </div>
                  {/* Face 5 - Left */}
                  <div className="die-face die-face-5">
                    {renderPips(5)}
                  </div>
                  {/* Face 3 - Top */}
                  <div className="die-face die-face-3">
                    {renderPips(3)}
                  </div>
                  {/* Face 4 - Bottom */}
                  <div className="die-face die-face-4">
                    {renderPips(4)}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderPips(value: number) {
  const positions = pipPositions[value];
  return Array.from({ length: 9 }, (_, i) => {
    const isActive = positions.includes(i);
    const pos = gridPositions[i];
    return (
      <div
        key={i}
        className={`pip ${isActive ? 'active' : 'inactive'}`}
        style={{
          gridColumn: pos.x + 1,
          gridRow: pos.y + 1,
        }}
      />
    );
  });
}

