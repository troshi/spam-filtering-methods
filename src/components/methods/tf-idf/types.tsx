export interface Document {
  id: number;
  text: string;
}

export interface TermScore {
  term: string;
  score: number;
  tf: number;
  idf: number;
}

export interface TermTF {
  term: string;
  tf: number;
}

export interface TFIDFData {
  allTerms: string[];
  tfAll: Record<string, number>[];
  idfMap: Record<string, number>;
  dfMap: Record<string, number>;
  tfidfMatrix: Record<string, number>[];
  maxTFIDF: number;
  maxTF: number;
  maxIDF: number;
}
