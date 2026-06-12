import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model);

export function normalizeAndLemmatize(tokens: string[]) {
  return tokens.map((token) => {
    const normalized =
      smsDictionary[token.toLowerCase()] || token;

    return nlp
      .readDoc(normalized)
      .tokens()
      .out((t) => t.out(nlp.its.lemma))[0];
  });
}