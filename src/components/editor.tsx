import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { customLanguage } from './customLanguage';
import './editor.css';

type Props = {
  content: string,
  onSetContent:(value: string) => void
}

function Editor({ content, onSetContent}:Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorInstance.current) {
      editorInstance.current.destroy();
      editorInstance.current = null;
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const currentText = update.state.doc.toString();
        onSetContent(currentText); // almacena en estado
        
      }
    });

    try {
      const state = EditorState.create({
        doc: `//Escribe tu codigo aqui
`,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          highlightActiveLine(),
          oneDark,
          ...customLanguage(),
          updateListener, // ✅ escucha cambios
          EditorView.theme({
            "&": { height: "100%" },
            ".cm-content": { padding: "10px 0" }
          })
        ]
      });

      editorInstance.current = new EditorView({
        state,
        parent: editorRef.current
      });
    } catch (error) {
      console.error('Error inicializando CodeMirror:', error);
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  return <div className="editor-component" ref={editorRef}></div>;
}

export default Editor;
