const translations = {
  ar: {
    // Header
    siteName: 'ProxyDaiv',

    // Social
    followUs: 'تابعنا',
    socialLabels: {
      telegram: 'تيليكرام',
      instagram: 'انستكرام',
      snapchat: 'سناب شات',
    },

    // FAQ
    faqTitle: 'اقرأ قبل الاستخدام',
    faqItems: [
      {
        q: 'ما هو MTProto Proxy؟',
        a: 'هو نوع من البروكسي مخصص لتطبيق التليكرام يساعدك تتصل بالتطبيق حتى لو كان محجوب في بلدك.',
      },
      {
        q: 'هل MTProto Proxy آمن؟',
        a: 'نعم، هو آمن بشكل عام لأن تيليجرام يستخدم تشفير قوي.',
      },
      {
        q: 'هل يمكن للبروكسي قراءة رسائلي؟',
        a: 'لا ❌ الرسائل داخل تيليجرام تكون مشفرة، والبروكسي لا يستطيع قراءة محتوى المحادثات.',
      },
      {
        q: 'لماذا بعض البروكسيات بطيئة؟',
        a: 'السرعة تعتمد على موقع السيرفر، عدد المستخدمين المتصلين، وجودة الاستضافة.\n💡 ننصح باستخدام بروكسي قريب جغرافيًا لتحصل على أفضل سرعة.',
      },
      {
        q: 'كيف أستخدم البروكسي؟',
        a: 'اضغط على إضافة بجانب البروكسي، وسيتم فتحه مباشرة في تيليجرام وتفعيل الاتصال تلقائيًا.',
      },
    ],

    // Proxy list
    proxyListTitle: 'البروكسيات المتاحة',
    addProxy: 'إضافة',
    loading: 'جاري التحميل...',
    checking: 'جاري فحص البروكسيات...',
    errorLoad: 'تعذّر تحميل البروكسيات، حاول مجدداً.',
    retry: 'إعادة المحاولة',
    pingFast:  'سريع',
    pingGood:  'جيد',
    pingFair:  'بطيء قليلاً',
    pingSlow:  'بطيء',
    pingNoSig: 'لا يوجد استقبال',
    pingDead:  'متوقف',
    unknown: 'غير معروف',
  },

  en: {
    // Header
    siteName: 'ProxyDaiv',

    // Social
    followUs: 'Follow us',
    socialLabels: {
      telegram: 'Telegram',
      instagram: 'Instagram',
      snapchat: 'Snapchat',
    },

    // FAQ
    faqTitle: 'Read Before Use',
    faqItems: [
      {
        q: 'What is MTProto Proxy?',
        a: 'It is a type of proxy designed for Telegram that helps you connect to the app even if it is blocked in your country.',
      },
      {
        q: 'Is MTProto Proxy safe?',
        a: 'Yes, it is generally safe because Telegram uses strong encryption.',
      },
      {
        q: 'Can the proxy read my messages?',
        a: 'No ❌ Messages inside Telegram are encrypted, and the proxy cannot read the content of your conversations.',
      },
      {
        q: 'Why are some proxies slow?',
        a: 'Speed depends on the server location, number of connected users, and hosting quality.\n💡 We recommend using a geographically close proxy for the best speed.',
      },
      {
        q: 'How do I use a proxy?',
        a: 'Tap Add next to any proxy, and it will open directly in Telegram and activate the connection automatically.',
      },
    ],

    // Proxy list
    proxyListTitle: 'Available Proxies',
    addProxy: 'Add',
    loading: 'Loading...',
    checking: 'Checking proxies...',
    errorLoad: 'Failed to load proxies. Please try again.',
    retry: 'Retry',
    pingFast:  'Fast',
    pingGood:  'Good',
    pingFair:  'Slightly Slow',
    pingSlow:  'Slow',
    pingNoSig: 'No Signal',
    pingDead:  'Dead',
    unknown: 'Unknown',
  },
}

export default translations
