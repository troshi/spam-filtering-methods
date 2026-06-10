import './App.css'
import { TFIDFVisualizer } from './components/methods/tf-idf'
import { DifferentialEvolutionVisualizer } from './components/methods/differential-evolution'
import { Divider } from 'antd'

function App() {
  return (
    <>
      <TFIDFVisualizer />
      <Divider />
      <DifferentialEvolutionVisualizer />
    </>
  )
}

export default App
