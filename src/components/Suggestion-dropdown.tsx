import React from "react";

export interface SuggestionsDropdownProps {
  suggestions: string[];
  highlightedIndex: number;
  dropdownPosition: { top: number; left: number };
  onSelect: () => void;
  onMouseEnter: (index: number) => void;
}

const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
    suggestions,
    highlightedIndex,
    dropdownPosition,
    onSelect,
    onMouseEnter
  }) => {
    return (
        <div
        className="suggestions-dropdown"
        style={{
            position: "absolute",
            top: dropdownPosition.top,
            left: dropdownPosition.left
        }}
        >
            {suggestions.map((val, index) => (
                <div
                className={`suggestion-item ${highlightedIndex === index ? "highlighted" : ""}`}
                onMouseEnter={() => { onMouseEnter(index); }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect();
                }}
                key={index}>
                    {val}
                </div>
            ))}
        </div>
    );
  };
  
  export default SuggestionsDropdown;