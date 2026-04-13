import { useLanguage } from '../hooks/useLanguage'
import './Header.css'

export default function Header() {
  const { lang, toggleLang, t } = useLanguage()

  return (
    <header className="header">
      <div className="header__inner">

        {/* Language toggle — top right corner */}
        <button
          className="lang-toggle"
          onClick={toggleLang}
          aria-label="Toggle language"
        >
          <span className={lang === 'ar' ? 'lang-toggle__active' : ''}>AR</span>
          <span className="lang-toggle__sep">/</span>
          <span className={lang === 'en' ? 'lang-toggle__active' : ''}>EN</span>
        </button>

        {/* Logo */}
        <div className="logo-wrap">
          <h1 className="logo">
            {t.siteName}
          </h1>
        </div>

      </div>
    </header>
  )
}
