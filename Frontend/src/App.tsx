import { Navigate, Route, Routes } from 'react-router-dom'
import UserLayout from './layouts/UserLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Features from './pages/Features'
import Help from './pages/Help'

import Search from './pages/Search'
import Results from './pages/Results'
import AddMissingPerson from './pages/AddMissingPerson'
import MissingPersons from './pages/MissingPersons'

export default function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin-only confidential features */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/add-person" element={<AddMissingPerson />} />
          <Route path="/missing-persons" element={<MissingPersons />} />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}