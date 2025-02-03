// src/components/InlineStyleControls.tsx
import React from "react";
import { ContentBlock, EditorState } from "draft-js";
import StyleButton from "./Style-button"

export interface InlineStyleControlsProps {
  editorState: EditorState;
  onFontToggle: (style: string) => void;
  onBlockToggle: (style: string) => void;
}

const INLINE_STYLES: { label: string; style: string }[] = [
  { label: "B", style: "BOLD" },
  { label: "I", style: "ITALIC" },
  { label: "U", style: "UNDERLINE" },
  { label: "S", style: "STRIKETHROUGH" }
];

const BLOCK_TYPES = [
    { label: "H1", style: "header-one" },
    { label: "H2", style: "header-two" },
    { label: "UL", style: "unordered-list-item" },
    { label: "OL", style: "ordered-list-item" }
  ];

const InlineToolBar: React.FC<InlineStyleControlsProps> = ({
  editorState,
  onFontToggle,
  onBlockToggle
}) => {
  const currentStyle = editorState.getCurrentInlineStyle();
  const currentBlock = (): ContentBlock => {
    const selection = editorState.getSelection();
    return editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
  }

  return (
    <div className="toolbar">
      <div>
        {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          label={type.label}
          style={type.style}
          active={currentStyle.has(type.style)}
          onToggle={onFontToggle}
        />
      ))}
      </div>
      <div>
        {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          label={type.label}
          style={type.style}
          active={currentBlock().getType() === type.style}
          onToggle={onBlockToggle}
        />
      ))}
      </div>
    </div>
  );
};

export default InlineToolBar;
