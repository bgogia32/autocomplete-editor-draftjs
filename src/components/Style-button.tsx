// src/components/StyleButton.tsx
import React from "react";

export interface StyleButtonProps {
  label: string;
  style: string;
  active: boolean;
  onToggle: (style: string) => void;
}

const StyleButton: React.FC<StyleButtonProps> = ({
  label,
  style,
  active,
  onToggle
}) => {
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(style);
  };

  return (
    <span
      onMouseDown={onMouseDown}
      className={`style-button ${active ? "active" : ""}`}
      title={label}
    >
      {label}
    </span>
  );
};

export default StyleButton;