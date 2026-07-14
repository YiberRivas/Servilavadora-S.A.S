import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import AprobarEmpresas from './pages/AprobarEmpresas'
import Usuarios from './pages/Usuarios'
import Planes from './pages/Planes'
import Estadisticas from './pages/Estadisticas'
import Configuraciones from './pages/Configuraciones'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="aprobar" element={<AprobarEmpresas />} />
          <Route path="planes" element={<Planes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="configuraciones" element={<Configuraciones />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
