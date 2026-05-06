import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Mapa2 from "./mapa2"
import Principal from './principal'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
        <BrowserRouter>
        <Routes>
          <Route path='/Mapa2' element={<Mapa2/>}/>
          <Route path='/' element={<Principal/>}/>
          <Route path='*' element={<h1>404 Página não encontrada</h1>}/>
        </Routes>
        </BrowserRouter>
    </div>

  )
}

export default App
