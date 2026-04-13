import { createContext, useState, useEffect } from 'react'
import translations from './translations'

export const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar')

  // Apply RTL/LTR direction on body whenever language changes
  useEffect(() => {
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  function toggleLang() {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'))
  }

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
