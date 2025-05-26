import { StreamLanguage } from '@codemirror/language';

export const customLanguage = () => [
  StreamLanguage.define({
    startState: () => ({}),

    token(stream) {
      if (stream.match('//')) {
        stream.skipToEnd();
        return 'comment';
      }

      if (stream.match(/"(?:[^"\\]|\\.)*"/)) {
        return 'string';
      }

      if (stream.match(/[{}[\]:,]/)) {
        return 'bracket';
      }

      if (stream.match(/\w+/)) {
        const word = stream.current();
        if (
          word === 'root' ||
          word === 'label' ||
          word === 'children' ||
          word.toLowerCase().includes('child')
        ) {
          return 'keyword';
        }
        return null;
      }

      stream.next();
      return null;
    }
  })
];
