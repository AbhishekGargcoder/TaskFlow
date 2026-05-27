import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Todo from './pages/Todo';
import Todos from './pages/Todos';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/signup" replace />} /> */}
          <Route path="/" element={<Todos />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todos/:id" element={<Todo />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App
