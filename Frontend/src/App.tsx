import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { UserLayout } from './layouts/UserLayout'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AddPersonPage } from './pages/admin/AddPersonPage'
import { AdminSearchPage } from './pages/admin/AdminSearchPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { EditPersonPage } from './pages/admin/EditPersonPage'
import { PersonDetailsPage } from './pages/admin/PersonDetailsPage'
import { PersonsPage } from './pages/admin/PersonsPage'
import { ReportsPage } from './pages/admin/ReportsPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { UserResultsPage } from './pages/user/UserResultsPage'
import { UserSearchPage } from './pages/user/UserSearchPage'
import { RequireRole } from './routes/RequireRole'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<RequireRole role="user" />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserSearchPage showTips />} />
          <Route path="search" element={<UserSearchPage />} />
          <Route path="results" element={<UserResultsPage />} />
        </Route>
      </Route>

      {/*
        Admin pages are not linked from the landing page. They are open at /admin
        while sign-in is a placeholder. When real auth is added, wrap this block in
        <Route element={<RequireRole role="admin" />}> again.
      */}
      <Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="persons" element={<PersonsPage />} />
          <Route path="persons/add" element={<AddPersonPage />} />
          <Route path="persons/:id" element={<PersonDetailsPage />} />
          <Route path="persons/:id/edit" element={<EditPersonPage />} />
          <Route path="search" element={<AdminSearchPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
