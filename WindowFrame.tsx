import React, { useRef, useState } from 'react';
import { WindowState } from '../shared/types';

interface WindowFrameProps {
  windowState: WindowState;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  onResize,
  children,
}) => {
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  if (!windowState.isOpen || windowState.isMinimized) return null;

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    onFocus();
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextX = Math.max(8, moveEvent.clientX - dragOffset.current.x);
      const nextY = Math.max(52, moveEvent.clientY - dragOffset.current.y);
      onMove(nextX, nextY);
    };

    const handleMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = windowState.size.width;
    const startH = windowState.size.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextW = Math.max(460, startW + (moveEvent.clientX - startX));
      const nextH = Math.max(360, startH + (moveEvent.clientY - startY));
      onResize(nextW, nextH);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={onFocus}
      style={{
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        zIndex: windowState.zIndex,
      }}
      className={`fixed flex flex-col bg-slate-950/80 backdrop-blur-2xl border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.75)] ${
        dragging ? 'ring-1 ring-cyan-400/70' : ''
      }`}
    >
      <div
        onMouseDown={handleHeaderMouseDown}
        className="h-9 px-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span className="font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
            {windowState.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="w-6 h-6 rounded hover:bg-white/10 text-slate-400 hover:text-amber-300 font-mono text-xs flex items-center justify-center cursor-pointer"
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-mono text-xs flex items-center justify-center cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 relative">{children}</div>

      <div
        onMouseDown={handleResizeMouseDown}
        className="w-4 h-4 absolute bottom-0 right-0 cursor-nwse-resize flex items-end justify-end p-0.5 text-cyan-400/50 hover:text-cyan-300"
      >
        ◢
      </div>
    </div>
  );
};
