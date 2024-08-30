import React, { useRef, useEffect } from 'react';
import { Line, Circle } from 'react-konva';
import { ShapeProps } from '../helpers/interfaces';

interface LineProps {
  lineProps: {
    id: string;
    points: number[];
    attachedTo: string | null;
  };
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: { id: string; points: number[]; attachedTo: string | null }) => void;
  rectangles: ShapeProps[];
  lines: { id: string, points: number[], attachedTo: string | null }[];
}

const LineComponent: React.FC<LineProps> = ({
  lineProps,
  isSelected,
  onSelect,
  onChange,
  rectangles,
  lines,
}) => {
  const lineRef = useRef<any>();

  const handleCircleDragMove = (e: any, index: number) => {
    const newPoints = lineProps.points.slice();
    newPoints[index * 2] = e.target.x();
    newPoints[index * 2 + 1] = e.target.y();

    const attachedTo = findAttachment(newPoints[index * 2], newPoints[index * 2 + 1], rectangles, lines);

    onChange({ ...lineProps, points: newPoints, attachedTo });
  };

  const findAttachment = (x: number, y: number, rectangles: ShapeProps[], lines: { id: string, points: number[], attachedTo: string | null }[]) => {
    for (const rect of rectangles) {
      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return rect.id;
      }
    }

    for (const line of lines) {
      if (line.id !== lineProps.id) {
        const [x1, y1, x2, y2] = line.points;
        const dist1 = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const dist2 = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        if (dist1 < 10 || dist2 < 10) {
          return line.id;
        }
      }
    }

    return null;
  };

  const handleCircleDragEnd = (e: any, index: number) => {
    const newPoints = lineProps.points.slice();
    newPoints[index * 2] = e.target.x();
    newPoints[index * 2 + 1] = e.target.y();

    const attachedTo = findAttachment(newPoints[index * 2], newPoints[index * 2 + 1], rectangles, lines);

    onChange({ ...lineProps, points: newPoints, attachedTo });

    // Detect if lines form a closed shape and fill it if true
    if (isClosedShape(lines)) {
      fillClosedShape(lines);
    }
  };

  const isClosedShape = (lines: { id: string, points: number[], attachedTo: string | null }[]) => {
    // Implement logic to detect if lines form a closed shape
    // You can use an algorithm to determine if all endpoints form a loop
    return false; // Placeholder return
  };

  const fillClosedShape = (lines: { id: string, points: number[], attachedTo: string | null }[]) => {
    // Implement the filling of the closed shape
  };

  return (
    <>
      <Line
        ref={lineRef}
        points={lineProps.points}
        stroke="#3272ED"
        strokeWidth={2}
        onClick={onSelect}
      />
      <Circle
        x={lineProps.points[0]}
        y={lineProps.points[1]}
        radius={5}
        fill="#3272ED"
        draggable
        onDragMove={(e) => handleCircleDragMove(e, 0)}
        onDragEnd={(e) => handleCircleDragEnd(e, 0)}
      />
      <Circle
        x={lineProps.points[2]}
        y={lineProps.points[3]}
        radius={5}
        fill="#3272ED"
        draggable
        onDragMove={(e) => handleCircleDragMove(e, 1)}
        onDragEnd={(e) => handleCircleDragEnd(e, 1)}
      />
    </>
  );
};

export default LineComponent;
