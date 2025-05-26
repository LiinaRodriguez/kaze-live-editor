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
          "&": { height: "100%" },
          ".cm-content": { padding: "10px 0" }
        })
      ]
    });

    editorInstance.current = new EditorView({
      state,
      parent: editorRef.current
    });

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [content]);

  return <div className="editor-component" ref={editorRef}></div>;
}

export default Editor;
