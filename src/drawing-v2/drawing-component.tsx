import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Shape, Circle } from 'react-konva';
import Konva from 'konva';

// Function to generate random color with opacity
const getRandomColorWithOpacity = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const opacity = 0.24;
  return `rgba(${r},${g},${b},${opacity})`;
};

const DrawingCanvas: React.FC = () => {
  const [lines, setLines] = useState<Konva.LineConfig[]>([]);
  const [rooms, setRooms] = useState<Konva.ShapeConfig[]>([]);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [snappedPoint, setSnappedPoint] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedShape, setSelectedShape] = useState<Konva.Shape | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = React.useRef(false);

  const [potentialLine, setPotentialLine] = React.useState<number[]>([]);

  const getClosestPoint = (x: number, y: number) => {
    let minDist = Infinity;
    let closestPoint: number[] = [];

    lines.forEach(line => {
      if (line.points) {
        for (let i = 0; i < line.points.length; i += 2) {
          const dx = x - line.points[i];
          const dy = y - line.points[i + 1];
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minDist) {
            minDist = dist;
            closestPoint = [line.points[i], line.points[i + 1]];
          }
        }
      }
    });

    // If the closest point is within a certain distance, return it
    if (minDist < 10) {
      setSnappedPoint(closestPoint);
      return closestPoint;
    }

    // Otherwise, return the original point
    setSnappedPoint([]);
    return [x, y];
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDragging) return;
    let { x, y } = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
    if (snappedPoint.length > 0) {
      [x, y] = snappedPoint;
    }
    if (currentLine.length > 0 && Math.hypot(x - currentLine[0], y - currentLine[1]) < 5) {
      setLines((prev) => [...prev, { points: currentLine, closed: true, fill: getRandomColorWithOpacity() }]);
      setCurrentLine([]);
    } else if (currentLine.length === 0) {
      setCurrentLine([x, y]);
    } else {
      setCurrentLine((prev) => [...prev, x, y]);
    }
    isDrawing.current = true;
  };

  const handleMouseUp = () => {
    if (isDragging) return;
    let lastPoint = currentLine.slice(-2);
    let hasSnapped = false;
    if (snappedPoint.length > 0) {
      lastPoint = snappedPoint;
      hasSnapped = true;
    }
    if (currentLine.length > 0) {
      setLines((prev) => [...prev, { points: [...currentLine.slice(0, -2), ...lastPoint], closed: false }]);
      setCurrentLine(lastPoint);
    }
    isDrawing.current = false;
    if (hasSnapped) {
      const allPoints = lines.map(line => line.points || []).flat();
      // Remove the first point if it exists
      if (allPoints.length > 0) {
        allPoints.splice(0, 2);
      }
      setLines([]);
      setCurrentLine([]);
      setPotentialLine([]);
      setSnappedPoint([]);
      setRooms([...rooms, { points: allPoints, closed: true, fill: getRandomColorWithOpacity() }]);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDragging) return;
    let { x, y } = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
  
    if (isDrawing.current && !isDragging) {
      // Update the last point of the current line
      setCurrentLine((prev) => [...prev.slice(0, -2), x, y]);
    } else if (currentLine.length > 0) {
      // Get the closest point to the current mouse position
      [x, y] = getClosestPoint(x, y);
  
      // Update the potential line
      setPotentialLine([currentLine[currentLine.length - 2], currentLine[currentLine.length - 1], x, y]);
    }
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      ref={stageRef}
    >
      <Layer>
        {lines.map((line, index) => (
          <Line
            key={index}
            points={line.points}
            stroke="#3272ED"
            strokeWidth={3}
            closed={line.closed}
            fill={line.closed ? line.fill : ''}
          />
        ))}
        {currentLine.length > 0 && (
          <Line
            points={currentLine}
            stroke="#3272ED"
            strokeWidth={3}
            closed={false}
          />
        )}
        {potentialLine.length > 0 && <Line points={potentialLine} stroke="#3272ED"
          strokeWidth={3}
          closed={false} />}
        {rooms.map((room, index) => (
          <React.Fragment key={index}>
            <Shape
              sceneFunc={(context, shape) => {
                const points = room.points || [];
                context.beginPath();
                for (let i = 0; i < points.length; i += 2) {
                  context.lineTo(points[i], points[i + 1]);
                }
                context.closePath();
                // Konva specific method
                context.fillStrokeShape(shape);
              }}
              fill={room.fill}
              stroke="#3272ED"
              strokeWidth={2}
            />
            {room.points && room.points.map((point: number, i: number) => {
              if (i % 2 === 0) { // only create circles for x coordinates
                return (
                  <Circle
                    key={i}
                    x={room.points[i]}
                    y={room.points[i + 1]}
                    radius={5}
                    fill="#3272ED"
                    draggable
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onDragMove={(e) => {
                      // update the position of the point in the room
                      const newPoints = [...room.points];
                      newPoints[i] = e.target.x();
                      newPoints[i + 1] = e.target.y();
                      const newRooms = [...rooms];
                      newRooms[index].points = newPoints;
                      setRooms(newRooms);
                    }}
                  />
                );
              }
              return null;
            })}
          </React.Fragment>
        ))}
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;
