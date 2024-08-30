import React, { useRef, useEffect } from 'react';
import { Rect, Circle, Text, Transformer } from 'react-konva';
import { ShapeProps } from '../helpers/interfaces';

interface RectangleProps {
  shapeProps: ShapeProps;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ShapeProps) => void;
  allShapes: ShapeProps[];
}

const Rectangle: React.FC<RectangleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  allShapes,
}) => {
  const shapeRef = useRef<any>();
  const trRef = useRef<any>();

  useEffect(() => {
    if (isSelected) {
      console.log('selected');
    }
  }, [isSelected]);

  const isColliding = (rect1: ShapeProps, rect2: ShapeProps) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const handleDragMove = (e: any) => {
    let newAttrs = {
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    };

    newAttrs = adjustPosition(newAttrs, allShapes);
    shapeRef.current.position({ x: newAttrs.x, y: newAttrs.y });
    shapeRef.current.getLayer().batchDraw();
  };

  const adjustPosition = (newRect: ShapeProps, allRects: ShapeProps[]) => {
    let collisionDetected = true;

    while (collisionDetected) {
      collisionDetected = false;

      for (const otherRect of allRects) {
        if (otherRect.id !== newRect.id && isColliding(newRect, otherRect)) {
          collisionDetected = true;

          const dx = newRect.x - otherRect.x;
          const dy = newRect.y - otherRect.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              newRect.x = otherRect.x + otherRect.width;
            } else {
              newRect.x = otherRect.x - newRect.width;
            }
          } else {
            if (dy > 0) {
              newRect.y = otherRect.y + otherRect.height;
            } else {
              newRect.y = otherRect.y - newRect.height;
            }
          }
        }
      }
    }

    return newRect;
  };

  const handleCircleDragMove = (e: any, corner: string) => {
    const node = shapeRef.current;
    const { x, y } = node.position();
    let newWidth = node.width();
    let newHeight = node.height();
    let newX = x;
    let newY = y;

    switch (corner) {
      case 'top-left':
        newX = e.target.x();
        newY = e.target.y();
        newWidth = node.width() + (x - newX);
        newHeight = node.height() + (y - newY);
        break;
      case 'top-right':
        newY = e.target.y();
        newWidth = e.target.x() - x;
        newHeight = node.height() + (y - newY);
        break;
      case 'bottom-left':
        newX = e.target.x();
        newWidth = node.width() + (x - newX);
        newHeight = e.target.y() - y;
        break;
      case 'bottom-right':
        newWidth = e.target.x() - x;
        newHeight = e.target.y() - y;
        break;
      default:
        break;
    }

    onChange({
      ...shapeProps,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });

    // Update the rectangle's position and size
    node.position({ x: newX, y: newY });
    node.width(newWidth);
    node.height(newHeight);
    node.getLayer().batchDraw();
  };

  return (
    <>
      <Rect
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragMove={handleDragMove}
        onDragEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />

      {/* Circles for resizing */}
      <Circle
        x={shapeProps.x}
        y={shapeProps.y}
        radius={5}
        fill="#3272ED"
        draggable
        onDragMove={(e) => handleCircleDragMove(e, 'top-left')}
      />
      <Circle
        x={shapeProps.x + shapeProps.width}
        y={shapeProps.y}
        radius={5}
        fill="#3272ED"
        draggable
        onDragMove={(e) => handleCircleDragMove(e, 'top-right')}
      />
      <Circle
        x={shapeProps.x}
        y={shapeProps.y + shapeProps.height}
        radius={5}
        fill="#3272ED"
        draggable
        onDragMove={(e) => handleCircleDragMove(e, 'bottom-left')}
      />
      <Circle
        x={shapeProps.x + shapeProps.width}
        y={shapeProps.y + shapeProps.height}
        radius={5}
        fill="#3272ED"
        draggable
        onDragMove={(e) => handleCircleDragMove(e, 'bottom-right')}
      />

      <Text
        x={shapeProps.x + 10}
        y={shapeProps.y + shapeProps.height - 30}
        width={80}
        height={20}
        text={`Room ${shapeProps.id + 1}`}
        fontSize={14}
        align="center"
        verticalAlign="middle"
        fill="white"
      />
    </>
  );
};

export default Rectangle;
