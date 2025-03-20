import logo from './logo.svg';
import './App.css';
import  {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from './Pages/Home'
import Cryptographic from './Pages/Cryptographic';
import Hashing from './Pages/Hashing';


function App() {
  return (
    <BrowserRouter>
    
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/crptograpic-apis' element={<Cryptographic />}/>
      <Route path='/hashing-apis' element={<Hashing />}/>
      
      
    </Routes>
    </BrowserRouter>
  );
}

export default App;
