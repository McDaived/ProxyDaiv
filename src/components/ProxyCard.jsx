import { usePing } from '../hooks/usePing'
import { useLanguage } from '../hooks/useLanguage'
import './ProxyCard.css'

export default function ProxyCard({ proxy }) {
  const { t } = useLanguage()
  const { ms, status } = usePing(proxy.server, proxy.port, proxy.countryCode ?? null)

  const flagSrc = proxy.countryCode
    ? `https://flagcdn.com/24x18/${proxy.countryCode.toLowerCase()}.png`
    : null

  const displayName = proxy.displayNumber ? `Server ${proxy.displayNumber}` : proxy.server

  return (
    <div className="proxy-card">

      {/* Left: flag + server number */}
      <div className="proxy-card__identity">
        {flagSrc ? (
          <img
            className="proxy-card__flag-img"
            src={flagSrc}
            alt={proxy.countryCode}
            width="24"
            height="18"
            loading="lazy"
          />
        ) : (
          <span className="proxy-card__flag-globe">🌐</span>
        )}
        <span className="proxy-card__country">{displayName}</span>
      </div>

      {/* Center: ping */}
      <div className="proxy-card__ping">
        <span
          className="proxy-card__ping-dot"
          style={{ background: status.color }}
        />
        <span className="proxy-card__ping-ms">
          {ms !== null ? `${ms}ms` : '···'}
        </span>
        <span className="proxy-card__ping-label" style={{ color: status.color }}>
          {t[status.key]}
        </span>
      </div>

      {/* Right: add button */}
      <a
        href={proxy.tgLink}
        className="proxy-card__add"
        title={t.addProxy}
        aria-label={t.addProxy}
      >
        {/* Telegram icon */}
        <svg className="proxy-card__tg-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <span>{t.addProxy}</span>
      </a>

    </div>
  )
}
