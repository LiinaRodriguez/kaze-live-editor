import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { customLanguage } from './customLanguage';
import './editor.css';

type Props = {
  content: string;
  onSetContent: (value: string) => void;
};

function Editor({ content, onSetContent }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const currentText = update.state.doc.toString();
        onSetContent(currentText);
      }
    });

    const state = EditorState.create({
      doc: content || '//Escribe tu codigo aqui\n',
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        highlightActiveLine(),
        oneDark,
        ...customLanguage(),
        updateListener,
        EditorView.theme({
          "&": {
            height: "100%",
            maxHeight: "100%",
            overflow: "auto"
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily: "'JetBrains Mono', monospace",
            height: "100%",
            maxHeight: "100%"
          },
          ".cm-content": {
            minHeight: "100%",
            height: "100%",
            padding: "10px !important"
          },
          ".cm-line": {
            padding: "0 10px"
          },
          ".cm-gutters": {
            minHeight: "100%",
            height: "100%"
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  // Actualizar el contenido cuando cambia externamente
  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content
        }
      });
    }
  }, [content]);

  return <div className="editor-component" ref={editorRef}></div>;
}

export default Editor;
