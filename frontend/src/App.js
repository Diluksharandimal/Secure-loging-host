import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignIn from './component/SigIn/SignIn';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './component/Home/Home';
import Profile from './component/dashboard/profile/Profile/Profile';
import ASigIn from './component/SigIn/Admin/Asignin';
import AsigIn from './component/SigIn/Admin/Asignin';
import Dashboard from './component/dashboard/AdminDash/dashboard';
import SignUp from './component/Signup/SignUp';





function App() {
  return (
    <div className="App">
        <BrowserRouter>
        <ToastContainer position="top-center" style={{marginTop: "70px"}}/>
            <main>
              <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/SignIn' element={<SignIn/>}/>
              <Route path='/SignUp' element={<SignUp/>}/>
              <Route path='/profile' element={<Profile/>}/>
              <Route path='/Asignin' element={<AsigIn/>}/>
              <Route path='/dashboard' element={<Dashboard/>}/>
              </Routes>
            </main>
        </BrowserRouter>
    </div>
  );
}

export default App;