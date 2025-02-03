import  React, { useState, useEffect, useRef } from "react";
import {DraftHandleValue, Editor, EditorState, EditorCommand, getDefaultKeyBinding, CompositeDecorator, Modifier, RichUtils} from "draft-js";
import InlineToolBar from "./components/Inline-toolbar";
import { AutocompleteEntry, Debounce, findAutocompleteEntities, findOffset } from "./Utility";
import { suggestions } from "./Suggestions";
import "./styles/Component.css"
import SuggestionsDropdown from "./components/Suggestion-dropdown";


const autocompleteDecorator = new CompositeDecorator([
    {
        strategy: findAutocompleteEntities,
        component: AutocompleteEntry
    }
])  

const AutocompleteEditor: React.FC = () => {

    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty(autocompleteDecorator));
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestions);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
    const editorRef = useRef<Editor>(null);
    
    useEffect(() => {
        editorRef.current?.focus();
    }, [ highlightedIndex ]);

    const handleChange = (newEditorState: EditorState) => {
        const plainText = newEditorState.getCurrentContent().getPlainText();
        if(plainText.includes("<>")) 
            validateAutocomplete(newEditorState);
            //debouncedValidateAutocomplete(newEditorState);                    //Uncomment this and comment above to use Debounce.
        setEditorState(newEditorState); 
    };

    const handleKeyCommand = (command: EditorCommand, editorState: EditorState): DraftHandleValue => {
        if (!showSuggestions)
        {
            const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
                setEditorState(newState);
                return "handled";
            }
            return "not-handled";
        }
    
        switch (command) {
          case "arrow-down":
            setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredSuggestions.length);
            return "handled";
    
          case "arrow-up":
            setHighlightedIndex((prevIndex) => (prevIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length);
            return "handled";
    
          case "insert-suggestion":
            insertSuggestion();
            return "handled";
    
          default:
            return "not-handled";
        }
    };
    
    const keyBindingFn = (e: React.KeyboardEvent): EditorCommand | null => {
        if (!showSuggestions) {
          return getDefaultKeyBinding(e);
        }

        if (e.key === "ArrowDown")
            return "arrow-down";
        else if (e.key === "ArrowUp")
            return "arrow-up";
        else if (e.key === "Enter" || e.key === "Tab") 
            return "insert-suggestion";
        
        return getDefaultKeyBinding(e);
    };

    const validateAutocomplete = (newEditorState: EditorState) => {
        const offSets = findOffset(newEditorState);
        const extractedSubstring = offSets.offsetString;
        //console.log('Extracted substring:', extractedSubstring);
        const match = extractedSubstring.match(/<>[^\n]*$/);
        if(match)
        {
            const sliced = match[0].slice(2);
            const filteredList = suggestions.filter((s) => s.toLocaleLowerCase().startsWith(sliced.toLocaleLowerCase())).slice(0,5);
            if(sliced !== '' && filteredList.length > 0)
            {
                setFilteredSuggestions(filteredList);
                setShowSuggestions(true);
                updateDropdownPosition();
                return;
            }
            else
                setShowSuggestions(false); 
        }
        else
            setShowSuggestions(false);
        setHighlightedIndex(0);
    };

    //Added Debounce for dealing with huge data. Uncommnet the function below and its call in Handle Change to use Debounced validation.

    // const debouncedValidateAutocomplete = useRef(
    //     Debounce((newEditorState: EditorState) => 
    //     {
    //       validateAutocomplete(newEditorState);
    //     }, 300)
    // ).current;

    const findOffset = (newEditorState: EditorState): findOffset => {
        const content = newEditorState.getCurrentContent();
        const selection = newEditorState.getSelection();
        const text = content.getBlockForKey(selection.getStartKey()).getText();
        const caretOffset = selection.getStartOffset();

        const textUpToCaret = text.slice(0, caretOffset);
        const startIndex = textUpToCaret.lastIndexOf('<>');
        if (startIndex === -1)
            return {startIndex: -1, caretOffSet: -1, offsetString: ''};

        return {startIndex: startIndex, caretOffSet: caretOffset, offsetString: textUpToCaret.slice(startIndex, caretOffset)};
    };

    const updateDropdownPosition = () => {
        const selection = window.getSelection();
        //console.log(selection);
        if (!selection || selection.rangeCount === 0) 
            return;    
        const range = selection.getRangeAt(0);
        //console.log(range);
        const rect = range.getBoundingClientRect();
        //console.log(rect);
        if(rect.width !== 0 && rect.height !== 0)
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 5,                          //Adjusted for spacing.
                left: rect.left + window.scrollX
            });
    };

    const insertSuggestion = () => {
        console.log("Selected:", filteredSuggestions[highlightedIndex]);
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const entityKey = contentState.createEntity("AUTOCOMPLETE", "IMMUTABLE").getLastCreatedEntityKey();
        const textOffset = findOffset(editorState);
        const removedSelection = selection.merge({
            anchorOffset: textOffset.startIndex,
            focusOffset: textOffset.caretOffSet
        })
        const currentStyle = editorState.getCurrentInlineStyle();
        const newContentState = Modifier.replaceText(contentState, removedSelection, filteredSuggestions[highlightedIndex], currentStyle, entityKey);
        setEditorState(EditorState.push(editorState, newContentState, "insert-characters"));
        setShowSuggestions(false);
    }

    const toggleInlineStyle = (style: string) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    const toggleBlockType = (blockType: string) => {
        setEditorState(RichUtils.toggleBlockType(editorState, blockType));
    };
      

    return (
        <div className="editor-wrapper">
      <div className="toolbar-container">
        <InlineToolBar editorState={editorState} onFontToggle={toggleInlineStyle} onBlockToggle={toggleBlockType} />
      </div>
            <div className="editor-container">
                <Editor
                    editorState={editorState}
                    onChange={handleChange}
                    placeholder="Type '<>' followed by the prompt to trigger autocomplete!"
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={keyBindingFn}
                    ref={editorRef}
                />
            </div>
            <div>
                {showSuggestions && (
                    <SuggestionsDropdown
                        suggestions={filteredSuggestions}
                        highlightedIndex={highlightedIndex}
                        dropdownPosition={dropdownPosition}
                        onSelect={() => { insertSuggestion(); }}
                        onMouseEnter={(index: number) => setHighlightedIndex(index)}    
                    />
                )}
            </div>
        </div>
    );  
};

export default AutocompleteEditor;