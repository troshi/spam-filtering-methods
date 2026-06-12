/**
 * sms-dictionary.ts
 *
 * Diccionario de abreviaturas y jerga SMS → forma canónica en inglés.
 * Se aplica antes de la lematización para normalizar tokens informales
 * que los lematizadores no reconocen (p.ej. "u" → "you", "ur" → "your").
 *
 * La clave es siempre minúsculas; el valor es la forma estándar también en minúsculas.
 */
export const smsDictionary: Record<string, string> = {
  // Pronombres y contracciones comunes en SMS
  u: "you",
  ur: "your",
  r: "are",
  b: "be",
  c: "see",
  k: "ok",
  n: "and",
  w: "with",
  d: "the",
  // Afirmaciones / negaciones
  ya: "yes",
  yep: "yes",
  nah: "no",
  nope: "no",
  // Abreviaturas de tiempo / lugar
  "2day": "today",
  "2moro": "tomorrow",
  "2nite": "tonight",
  tonite: "tonight",
  l8r: "later",
  l8: "late",
  b4: "before",
  // Abreviaturas de acciones
  txt: "text",
  msg: "message",
  pls: "please",
  plz: "please",
  thx: "thanks",
  tnx: "thanks",
  ty: "thank you",
  brb: "be right back",
  lol: "laugh",
  omg: "oh my god",
  btw: "by the way",
  fyi: "for your information",
  imo: "in my opinion",
  // Abreviaturas de llamada / contacto
  call: "call",
  mob: "mobile",
  num: "number",
  no: "number",
  // Términos de marketing / spam frecuentes
  wkly: "weekly",
  comp: "competition",
  wn: "win",
  fa: "football association",
  // Miscelánea
  gr8: "great",
  m8: "mate",
  h8: "hate",
  luv: "love",
  wan2: "want to",
  cum: "come",
  hav: "have",
  dnt: "do not",
  dun: "do not",
  hor: "hurry",
  lar: "la",
  oni: "only",
  wif: "with",
};
