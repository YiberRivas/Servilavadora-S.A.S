import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/globals/variables.css'
import './styles/globals/reset.css'
import './styles/globals/typography.css'
import './styles/globals/buttons.css'
import './styles/globals/forms.css'
import './styles/globals/tables.css'
import './styles/globals/cards.css'
import './styles/globals/badges.css'
import './styles/globals/animations.css'
import './styles/globals/utilities.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
