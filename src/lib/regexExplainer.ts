export interface RegexToken {
  text: string;
  description: string;
  type: 'literal' | 'quantifier' | 'group' | 'class' | 'anchor' | 'escape' | 'alternation';
}

export function explainRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let i = 0;
  
  while (i < pattern.length) {
    const char = pattern[i];
    
    // Escapes
    if (char === '\\') {
      const next = pattern[i + 1];
      if (!next) {
        tokens.push({ text: '\\', description: 'Trailing backslash', type: 'escape' });
        break;
      }
      let desc = `Literal character '${next}'`;
      if (next === 'd') desc = 'Any digit (0-9)';
      else if (next === 'D') desc = 'Any non-digit';
      else if (next === 'w') desc = 'Any word character (a-z, A-Z, 0-9, _)';
      else if (next === 'W') desc = 'Any non-word character';
      else if (next === 's') desc = 'Any whitespace character';
      else if (next === 'S') desc = 'Any non-whitespace character';
      else if (next === 'b') desc = 'Word boundary';
      else if (next === 'B') desc = 'Non-word boundary';
      else if (next === 'n') desc = 'Newline character';
      else if (next === 'r') desc = 'Carriage return';
      else if (next === 't') desc = 'Tab character';
      
      tokens.push({ text: '\\' + next, description: desc, type: 'escape' });
      i += 2;
      continue;
    }
    
    // Quantifiers
    if (char === '+' || char === '*' || char === '?') {
       let desc = '';
       if (char === '+') desc = 'One or more times';
       if (char === '*') desc = 'Zero or more times';
       if (char === '?') desc = 'Optional (zero or one time)';
       
       let text = char;
       if (pattern[i+1] === '?') {
          desc += ', lazy (matches as few as possible)';
          text += '?';
          i++;
       }
       tokens.push({ text, description: desc, type: 'quantifier' });
       i++;
       continue;
    }
    
    if (char === '{') {
       const closeIndex = pattern.indexOf('}', i);
       if (closeIndex > i) {
          const content = pattern.slice(i + 1, closeIndex);
          if (/^\d+(,\d*)?$/.test(content)) {
             const parts = content.split(',');
             let desc = '';
             if (parts.length === 1) desc = `Exactly ${parts[0]} times`;
             else if (parts[1] === '') desc = `${parts[0]} or more times`;
             else desc = `Between ${parts[0]} and ${parts[1]} times`;
             
             let text = pattern.slice(i, closeIndex + 1);
             i = closeIndex + 1;
             if (pattern[i] === '?') {
               desc += ', lazy';
               text += '?';
               i++;
             }
             tokens.push({ text, description: desc, type: 'quantifier' });
             continue;
          }
       }
    }
    
    // Anchors
    if (char === '^') {
      tokens.push({ text: '^', description: 'Start of line/string', type: 'anchor' });
      i++; continue;
    }
    if (char === '$') {
      tokens.push({ text: '$', description: 'End of line/string', type: 'anchor' });
      i++; continue;
    }
    
    // Alternation
    if (char === '|') {
      tokens.push({ text: '|', description: 'OR (alternation)', type: 'alternation' });
      i++; continue;
    }
    
    // Character Classes
    if (char === '[') {
      let closeIndex = i + 1;
      let inEscape = false;
      while (closeIndex < pattern.length) {
        if (inEscape) { inEscape = false; }
        else if (pattern[closeIndex] === '\\') { inEscape = true; }
        else if (pattern[closeIndex] === ']') { break; }
        closeIndex++;
      }
      if (closeIndex < pattern.length) {
        const text = pattern.slice(i, closeIndex + 1);
        const isNegated = text.startsWith('[^');
        tokens.push({
          text,
          description: isNegated ? 'Match any character NOT in this set' : 'Match any character in this set',
          type: 'class'
        });
        i = closeIndex + 1;
        continue;
      }
    }
    
    // Groups
    if (char === '(') {
       let typeDesc = 'Capturing group';
       let typePrefix = '(';
       let startSkip = 1;
       
       if (pattern.startsWith('(?:', i)) {
         typeDesc = 'Non-capturing group';
         typePrefix = '(?:';
         startSkip = 3;
       } else if (pattern.startsWith('(?=', i)) {
         typeDesc = 'Positive lookahead';
         typePrefix = '(?=';
         startSkip = 3;
       } else if (pattern.startsWith('(?!', i)) {
         typeDesc = 'Negative lookahead';
         typePrefix = '(?!';
         startSkip = 3;
       } else if (pattern.startsWith('(?<=', i)) {
         typeDesc = 'Positive lookbehind';
         typePrefix = '(?<=';
         startSkip = 4;
       } else if (pattern.startsWith('(?<!', i)) {
         typeDesc = 'Negative lookbehind';
         typePrefix = '(?<!';
         startSkip = 4;
       } else if (pattern.startsWith('(?<', i)) {
         const nameClose = pattern.indexOf('>', i);
         if (nameClose > i) {
            const name = pattern.slice(i + 3, nameClose);
            typeDesc = `Named capturing group '${name}'`;
            typePrefix = `(?<${name}>`;
            startSkip = nameClose - i + 1;
         }
       }
       
       tokens.push({ text: typePrefix, description: `Start of ${typeDesc}`, type: 'group' });
       i += startSkip;
       continue;
    }
    
    if (char === ')') {
       tokens.push({ text: ')', description: 'End of group', type: 'group' });
       i++;
       continue;
    }
    
    if (char === '.') {
       tokens.push({ text: '.', description: 'Any character (except newline)', type: 'class' });
       i++;
       continue;
    }
    
    // Literals
    tokens.push({ text: char, description: `Literal character '${char}'`, type: 'literal' });
    i++;
  }
  
  // Condense adjacent literals
  const condensed: RegexToken[] = [];
  for (const t of tokens) {
    const last = condensed[condensed.length - 1];
    if (last && last.type === 'literal' && t.type === 'literal') {
      last.text += t.text;
      last.description = `Literal string '${last.text}'`;
    } else {
      condensed.push(t);
    }
  }
  
  return condensed;
}
