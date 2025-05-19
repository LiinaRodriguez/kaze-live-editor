import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { customLanguage } from './customLanguage';
import './Editor.css';

function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<EditorView | null>(null);
  const [contenido, setContenido] = useState(''); // contenido actual

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorInstance.current) {
      editorInstance.current.destroy();
      editorInstance.current = null;
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const currentText = update.state.doc.toString();
        setContenido(currentText); // almacena en estado
        console.log('Contenido actualizado:', currentText); // opcional
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
