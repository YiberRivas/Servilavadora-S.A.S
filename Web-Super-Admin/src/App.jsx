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
import AdminEmpresaLayout from '../administrador-empresa/layouts/AdminEmpresaLayout'
import DashboardEmpresa from '../administrador-empresa/pages/DashboardEmpresa'
import UsuariosClientes from '../administrador-empresa/pages/UsuariosClientes'
import Lavadoras from '../administrador-empresa/pages/Lavadoras'
import Alquileres from '../administrador-empresa/pages/Alquileres'
import PagosFacturacion from '../administrador-empresa/pages/PagosFacturacion'

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
        <Route path="/administrador-empresa" element={<AdminEmpresaLayout />}>
          <Route index element={<DashboardEmpresa />} />
          <Route path="usuarios" element={<UsuariosClientes />} />
          <Route path="lavadoras" element={<Lavadoras />} />
          <Route path="alquileres" element={<Alquileres />} />
          <Route path="pagos" element={<PagosFacturacion />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
