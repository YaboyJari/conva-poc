import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { ShapeProps } from '../helpers/interfaces';
import Rectangle from './rectangle';
import LineComponent from './line';

const DrawingComponent: React.FC = () => {
  const [rectangles, setRectangles] = useState<ShapeProps[]>([]);
  const [lines, setLines] = useState<{ id: string, points: number[], attachedTo: string | null }[]>([]);
  const [selectedId, selectShape] = useState<string | null>(null);

  const getRandomColorWithOpacity = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const opacity = 0.24;
    return `rgba(${r},${g},${b},${opacity})`;
  };

  const addRectangle = () => {
    const rect = {
      id: uuidv4(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      width: 100,
      height: 100,
      fill: getRandomColorWithOpacity(),
    };
    setRectangles([...rectangles, rect]);
  };

  const addLine = () => {
    const line = {
      id: uuidv4(),
      points: [50, 50, 150, 150], // start and end points
      attachedTo: null, // Will hold the ID of a rectangle or line when attached
    };
    setLines([...lines, line]);
  };

  return (
    <div>
      <button onClick={addRectangle}>Add rectangle</button>
      <button onClick={addLine}>Add line</button>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            selectShape(null);
          }
        }}
      >
        <Layer>
          {rectangles.map((rect, i) => (
            <Rectangle
              key={rect.id}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => selectShape(rect.id)}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
              allShapes={rectangles}
            />
          ))}
          {lines.map((line, i) => (
            <LineComponent
              key={line.id}
              lineProps={line}
              isSelected={line.id === selectedId}
              onSelect={() => selectShape(line.id)}
              onChange={(newAttrs: any) => {
                const newLines = lines.slice();
                newLines[i] = newAttrs;
                setLines(newLines);
              }}
              rectangles={rectangles}
              lines={lines}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingComponent;
