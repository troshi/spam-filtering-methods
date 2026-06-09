import { useState } from 'react'
import './App.css'
import { TFIDFVisualizer } from './components/methods/tf-idf'

const documents = [
  {
    "label": "ham",
    "text": "Go until jurong point, crazy.. Available only in bugis n great world..."
  },
  {
    "label": "ham",
    "text": "Ok lar... Joking wif u oni..."
  },
  {
    "label": "spam",
    "text": "Free entry in 2 a wkly comp to win FA Cup final..."
  },
  {
    "label": "ham",
    "text": "U dun say so early hor..."
  }
];


function App() {
  return (
    <TFIDFVisualizer />
  )
}

export default App
