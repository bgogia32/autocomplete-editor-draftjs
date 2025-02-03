import { DraftDecoratorComponentProps } from "draft-js";
import { ContentBlock, ContentState } from "draft-js";
import  React from "react";

type callbackType = (start: number, end: number) => void;
export interface findOffset {startIndex: number, caretOffSet: number, offsetString: string};

export const findAutocompleteEntities = (contentBlock: ContentBlock, callback: callbackType, contentState: ContentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === "AUTOCOMPLETE";
      },
      callback
    );
  };

export const AutocompleteEntry = (props: DraftDecoratorComponentProps) => {
    return (
      <span style={{backgroundColor: "#ffeb3b", color: "black", padding: "0px 0px", borderRadius: "5px", cursor: "pointer"}} data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );
  };

  export function Debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }