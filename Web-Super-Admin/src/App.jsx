import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import AprobarEmpresas from './pages/AprobarEmpresas'
import Usuarios from './pages/Usuarios'
import Planes from './pages/Planes'
import Estadisticas from './pages/Estadisticas'
import Configuraciones from './pages/Configuraciones'
import AdminEmpresaLayout from '../administrador-empresa/layouts/AdminEmpresaLayout'
import DashboardEmpresa from '../administrador-empresa/pages/DashboardEmpresa'
import UsuariosClientes from '../administrador-empresa/pages/UsuariosClientes'
import Lavadoras from '../administrador-empresa/pages/Lavadoras'
import Alquileres from '../administrador-empresa/pages/Alquileres'
import PagosFacturacion from '../administrador-empresa/pages/PagosFacturacion'

function ProtectedRoute({ children, roleRequired }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Cargando...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (roleRequired && user.rol !== roleRequired) return <Navigate to="/" replace />

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.rol === 'SUPER_ADMIN' ? '/admin' : '/administrador-empresa'} replace /> : <Login />} />
      <Route path="/admin" element={
        <ProtectedRoute roleRequired="SUPER_ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="aprobar" element={<AprobarEmpresas />} />
        <Route path="planes" element={<Planes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path="configuraciones" element={<Configuraciones />} />
      </Route>
      <Route path="/administrador-empresa" element={
        <ProtectedRoute roleRequired="ADMIN_EMPRESA">
          <AdminEmpresaLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardEmpresa />} />
        <Route path="usuarios" element={<UsuariosClientes />} />
        <Route path="lavadoras" element={<Lavadoras />} />
        <Route path="alquileres" element={<Alquileres />} />
        <Route path="pagos" element={<PagosFacturacion />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
