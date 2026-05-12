import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './index.css'
import App from './App.jsx'

const chakraTheme = extendTheme({
  styles: { global: { body: { bg: 'transparent', color: 'inherit' } } },
  components: {
    Table:  { baseStyle: { th: { borderColor: 'var(--border-base)' }, td: { borderColor: 'var(--border-base)' } } },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={chakraTheme} resetCSS={false}>
      <App />
    </ChakraProvider>
  </StrictMode>,
)
