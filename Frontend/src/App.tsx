import { Navigate, Route, Routes } from 'react-router-dom'
import UserLayout from './layouts/UserLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Search from './pages/Search'
import Results from './pages/Results'

export default function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Pages that need a logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
        </Route>

        {/* Anything else goes back home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
