import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Todo from './pages/Todo';
import Todos from './pages/Todos';
// import { useSetRecoilState } from "recoil";
// import { authAtom } from "./store/atom/authAtom.tsx";
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BACKENED_URL } from '../config';

function App() {
  // const setAuthAtom = useSetRecoilState(authAtom);

  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = localStorage.getItem("token");

  //     if (!token) {
  //       setIsLoggedIn(false);
  //       return;
  //     }

  //     axios.post(`${BACKENED_URL}/api/v1/user/signin`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `${token}`
  //       }
  //     }).then(() => {
  //       setAuthAtom(true);
  //       setIsLoggedIn(true);
  //     }).catch(() => {
  //       setIsLoggedIn(false);
  //     })
  //   }
  //   checkAuth();
  // }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todos/:id" element={<Todo />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App
