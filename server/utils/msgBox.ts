import { dlopen } from "bun:ffi";

export function msgBox(message: string, title: string, type: 'okOnly' | 'yesOrNo') {

  const user32 = dlopen('user32', {
    'MessageBoxA': {
      returns: 'int',
      args: ['int', 'cstring', 'cstring', 'int'],
    },
  });

  const text = Buffer.from(message.padEnd(35, ' '), 'ascii');
  const caption = Buffer.from(title.padEnd(35, ' '), 'ascii');

  switch (type) {
    case 'okOnly':
      user32.symbols.MessageBoxA(0, text, caption, 0);
      return;
    case 'yesOrNo':
      const result = user32.symbols.MessageBoxA(0, text, caption, 4)
      return result == 6 ? 'yes' : 'no' as 'yes' | 'no'
  }

}

if (import.meta.main) {
  console.log(msgBox("Teste", "Teste", 'yesOrNo'))
}
