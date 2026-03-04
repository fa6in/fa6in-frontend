// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
// import { AuthProvider } from './Services/Auth/AuthProvider.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <AuthProvider>

//       <App />
//     </AuthProvider>

//   </StrictMode>,
// )




import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './Services/Auth/AuthProvider.tsx'

// ✅ FontAwesome config
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
