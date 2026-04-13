import { useLanguage } from '../hooks/useLanguage'
import './FAQ.css'

export default function FAQ() {
  const { t } = useLanguage()

  return (
    <section className="faq">
      <h2 className="faq__title">
        <span className="faq__title-highlight">{t.faqTitle}</span>
      </h2>

      <div className="faq__list">
        {t.faqItems.map((item, i) => (
          <div key={i} className="faq-item">
            <div className="faq-item__top">
              <span className="faq-item__num">0{i + 1}</span>
              <p className="faq-item__question">{item.q}</p>
            </div>
            <p className="faq-item__answer">
              {item.a.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < item.a.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
