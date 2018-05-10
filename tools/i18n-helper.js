import I18nHelper from 'next-i18n-helper'
import getWrapper from 'next-i18n-helper/dist/wrapper'

const i18nHelper = new I18nHelper({
  supportLangs: ['en', 'cn', 'fr', 'pt', 'ru', 'uk'],
  localesBaseUrl: '/locales',
  i18nOption: {
    cache: {
      enabled: true,
      expirationTime: 7 * 24 * 60 * 60 * 1000,
    },
  },
})

export default i18nHelper

export const i18nWrapper = getWrapper(i18nHelper)
