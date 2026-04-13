import { useProxies } from '../hooks/useProxies'
import { useLanguage } from '../hooks/useLanguage'
import ProxyCard from './ProxyCard'
import './ProxyList.css'

export default function ProxyList() {
  const { proxies, loading, error, retry } = useProxies()
  const { t } = useLanguage()

  return (
    <section className="proxy-list">

      <div className="proxy-list__header">
        <h2 className="proxy-list__title">{t.proxyListTitle}</h2>
        {proxies.length > 0 && (
          <span className="proxy-list__count">{proxies.length}</span>
        )}
      </div>

      {loading && (
        <div className="proxy-list__skeletons">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="proxy-skeleton" />
          ))}
        </div>
      )}

      {error && (
        <div className="proxy-list__error">
          <p>{t.errorLoad}</p>
          <button className="proxy-list__retry" onClick={retry}>
            {t.retry}
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="proxy-list__cards">
          {proxies.map(proxy => (
            <ProxyCard key={proxy.id} proxy={proxy} />
          ))}
        </div>
      )}

    </section>
  )
}
