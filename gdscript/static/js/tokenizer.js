// Create your own language definition here
// You can safely look at other samples without losing modifications.
// Modifications are not saved on browser refresh/close though -- copy often!
var gdscript = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  // defaultToken: 'invalid',

  keywords: [
    // python-like
    'and', 'not', 'while',
    'elif', 'or',
    'assert', 'else', 'if', 'pass', 'yield',
    'break', 'class', 'in', 'continue',
    'return', 'for',
    ':','=', 'self',
    // gdscript
    'match', 'enum', 'static', 'export',
    'const', 'true', 'false', 'null',
    'func', 'signal', 'onready', 'extends', 'var' 
  ],

  typeKeywords: [
    'bool', 'int', 'float', 'Array', 'Dictionary', 'String', 'str'
  ],

  globals: [
    'print', 'prints', 'printt'
  ],

  operators: [
    '+', '-', '*', '**', '/', '//', '%',
    '<<', '>>', '&', '|', '^', '~',
    '<', '>', '<=', '>=', '==', '!=', '<>',
    '+=', '-=', '*=', '/=', '//=', '%=',
    '&=', '|=', '^=', '>>=', '<<=', '**=',
  ],

  brackets: [
    ['(',')','delimiter.parenthesis'],
    ['{','}','delimiter.curly'],
    ['[',']','delimiter.square']
  ],

  // operator symbols
  symbols:    /[=><!~&|+\-*\/\^%]+/,
  delimiters: /[;=.@:,`]/,

  // strings
  escapes: /\\(?:[abfnrtv\\"'\n\r]|x[0-9A-Fa-f]{2}|[0-7]{3}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|N\{\w+\})/,
  rawpre: /(?:[rR]|ur|Ur|uR|UR|br|Br|bR|BR)/,
  strpre: /(?:[buBU])/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [

      // strings: need to check first due to the prefix
      [/@strpre?("""|''')/, { token: 'string.delim', bracket: '@open', next: '@mstring.$1' } ],
      [/@strpre?"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/@strpre?'([^'\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/@strpre?(["'])/,  { token: 'string.delim', bracket: '@open', next: '@string.$1' } ],

      [/@rawpre("""|''')/, { token: 'string.delim', bracket: '@open', next: '@mrawstring.$1' } ],
      [/@rawpre"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/@rawpre'([^'\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/@rawpre(["'])/,  { token: 'string.delim', bracket: '@open', next: '@rawstring.$1' } ],

      // identifiers and keywords
      [/[a-z_$][\w$]*/, {
        cases: {
          '@globals': 'predefined',
          '@typeKeywords': 'type',
          '@keywords': 'keyword',
          '@default': 'identifier',
        } 
      }],
      [/[A-Z][\w\$]*/, 'type.identifier' ],  // to show class names nicely

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, { cases: { '@keywords' : 'keyword',
                              '@operators': 'operator',
                              '@default'  : '' } } ],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/,   'number.float'],
      [/0[xX][0-9a-fA-F]+[lL]?/,     'number.hex'],
      [/0[bB][0-1]+[lL]?/,           'number.binary'],
      [/(0[oO][0-7]+|0[0-7]+)[lL]?/, 'number.octal'],
      [/(0|[1-9]\d*)[lL]?/,          'number'],

      // delimiter: after number because of .\d floats
      [':', { token: 'keyword', bracket: '@open' }], // bracket for indentation
      [/@delimiters/, { cases: { '@keywords': 'keyword',
                                 '@default': 'delimiter' }}],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],

      // characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string','string.escape','string']],
      [/'/, 'string.invalid']
    ],

    comment: [
      [/[^\/*]+/, 'comment' ],
      [/\/\*/,    'comment', '@push' ],    // nested comment
      ["\\*/",    'comment', '@pop'  ],
      [/[\/*]/,   'comment' ]
    ],

    // Regular strings
    mstring: [
      { include: '@strcontent' },
      [/"""|'''/,  { cases: { '$#==$S2':  { token: 'string.delim', bracket: '@close', next: '@pop' },
                              '@default': { token: 'string' } } }],
      [/["']/, 'string' ],
      [/./,    'string.invalid'],
    ],

    string: [
      { include: '@strcontent' },
      [/["']/, { cases: { '$#==$S2': { token: 'string.delim', bracket: '@close', next: '@pop' },
                          '@default': { token: 'string' } } } ],
      [/./, 'string.invalid'],
    ],

    strcontent: [
      [/[^\\"']+/,  'string'],
      [/\\$/,       'string.escape'],
      [/@escapes/,  'string.escape'],
      [/\\./,       'string.escape.invalid'],
    ],

    // Raw strings: we distinguish them to color escape sequences correctly
    mrawstring: [
      { include: '@rawstrcontent' },
      [/"""|'''/,  { cases: { '$#==$S2':  { token: 'string.delim', bracket: '@close', next: '@pop' },
                              '@default': { token: 'string' } } }],
      [/["']/, 'string' ],
      [/./,    'string.invalid'],
    ],

    rawstring: [
      { include: '@rawstrcontent' },
      [/["']/, { cases: { '$#==$S2': { token: 'string.delim', bracket: '@close', next: '@pop' },
                          '@default': { token: 'string' } } } ],
      [/./, 'string.invalid'],
    ],

    rawstrcontent: [
      [/[^\\"']+/, 'string'],
      [/\\["']/,   'string'],
      [/\\u[0-9A-Fa-f]{4}/, 'string.escape'],
      [/\\/, 'string' ],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/,       'comment', '@comment' ],
      [/\/\/.*$/,    'comment'],
      [/\#.*$/,    'comment'],
    ],
  },
};
