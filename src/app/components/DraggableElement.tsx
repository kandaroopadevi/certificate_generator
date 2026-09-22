import { useRef, useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableElementProps {
  id: string;
  position: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  children: React.ReactNode;
  className?: string;
}

export function DraggableElement({
  id,
  position,
  onPositionChange,
  children,
  className = '',
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && elementRef.current) {
        e.preventDefault();
        const parent = elementRef.current.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const newX = e.clientX - parentRect.left - dragOffset.x;
          const newY = e.clientY - parentRect.top - dragOffset.y;
          
          onPositionChange(id, {
            x: Math.max(0, Math.min(newX, parentRect.width - elementRef.current.offsetWidth)),
            y: Math.max(0, Math.min(newY, parentRect.height - elementRef.current.offsetHeight)),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, id, onPositionChange]);

  return (
    <div
      ref={elementRef}
      className={`absolute group ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-6 h-6 text-blue-500" />
      </div>
      {children}
    </div>
  );
}
