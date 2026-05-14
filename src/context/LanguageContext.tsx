import { createContext, useContext, useState } from 'react'
import { IntlProvider } from 'react-intl'
import de from '../i18n/de'
import en from '../i18n/en'

export type Locale = 'de' | 'en'

const messages: Record<Locale, Record<string, string>> = { de, en }

const LanguageContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
}>({ locale: 'de', setLocale: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    () => (localStorage.getItem('locale') as Locale) ?? 'de',
  )

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('locale', l)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="de">
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
