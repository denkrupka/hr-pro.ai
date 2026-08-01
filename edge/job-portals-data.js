// Каталог площадок объявлений для edge. Поля:
//   method: 'auto' | 'feed' | 'api' | 'login'   — способ подключения
//   auth:   какие поля вводит клиент ('login' | 'api'); для auto/feed — пусто
//   diff:   'easy' | 'key' | 'contract'          — сложность: авто/по ключу/по договору
//   what:   что клиент получает
//   steps:  пошаговая инструкция клиенту (что сделать)
//   cost:   стоимость публикации
export const PORTALS = [
  { id: 'google', name: 'Google for Jobs', url: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
    method: 'auto', auth: [], diff: 'easy', cost: 'Бесплатно',
    desc: 'Блок «Вакансии» в поиске Google. Огромный бесплатный трафик. Работает автоматически — ничего подключать не нужно.',
    what: 'Ваши опубликованные вакансии сами появляются в Google в течение нескольких дней.',
    steps: [
      'Ничего вводить не нужно — интеграция включена по умолчанию.',
      'Создайте вакансию и нажмите «Опубликовать» — портал сам отдаёт Google готовую разметку страницы отклика.',
      'Кандидат из Google попадает на вашу анкету → его отклик сразу в списке кандидатов этой вакансии.',
    ],
    note: 'Ничего вводить не нужно — работает автоматически для всех опубликованных вакансий.' },

  { id: 'feed', name: 'Универсальный фид (для агрегаторов)', url: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
    method: 'feed', auth: [], diff: 'easy', cost: 'Бесплатно (продвижение — по тарифам площадки)',
    desc: 'Одна ссылка со всеми вашими вакансиями в стандарте JobPosting. Вставляете её в кабинете любого агрегатора — он забирает вакансии сам.',
    what: 'Единый XML-фид всех опубликованных вакансий — переиспользуется для Jooble, Trovit, Jobrapido, Whatjobs и др.',
    steps: [
      'Скопируйте ссылку на фид (кнопка ниже).',
      'Зайдите в кабинет работодателя нужного агрегатора.',
      'Найдите раздел «Импорт вакансий / XML-фид / Job feed» и вставьте туда ссылку.',
      'Агрегатор начнёт обновлять ваши вакансии автоматически (обычно раз в сутки).',
    ],
    note: 'Скопируйте ссылку на фид и добавьте её в кабинете агрегатора — вакансии подтянутся сами.' },

  { id: 'olx', name: 'OLX Praca', url: 'https://biznes.olx.pl/integracja-api/',
    method: 'api', auth: ['api'], diff: 'key', cost: 'Платно (пакеты Standard/Premium)',
    desc: 'Доска объявлений №1 в Польше, раздел «Praca». Есть официальный API публикации — единственная крупная PL-площадка, доступная по ключу без тяжёлого договора.',
    what: 'Прямая публикация вакансий на OLX из портала под вашим бизнес-аккаунтом.',
    steps: [
      'Заведите бизнес-аккаунт на biznes.olx.pl.',
      'Подайте заявку на API-доступ: biznes.olx.pl/integracja-api (нужен NIP компании).',
      'Получите client_id и client_secret в панели разработчика OLX.',
      'Вставьте их сюда как API-ключ в формате client_id:client_secret.',
    ],
    note: 'Вставьте client_id:client_secret из панели разработчика OLX (biznes.olx.pl/integracja-api, выдаётся по заявке с NIP).' },

  { id: 'jooble', name: 'Jooble', url: 'https://jooble.org/api/about',
    method: 'feed', auth: ['api'], diff: 'easy', cost: 'Бесплатный листинг; продвижение — CPC',
    desc: 'Международный агрегатор вакансий с большим трафиком в Польше. Забирает ваш фид; для поиска есть бесплатный API-ключ.',
    what: 'Ваши вакансии на Jooble через фид. Ключ API (по желанию) — для поиска вакансий/кандидатов.',
    steps: [
      'Добавьте ссылку на ваш фид (см. карточку «Универсальный фид») в кабинете Jooble для работодателей.',
      'Для API-поиска: получите ключ на jooble.org/api/about и вставьте его сюда.',
      'Платное продвижение (CPC) — по желанию, через менеджера Jooble.',
    ],
    note: 'Ключ API получите на jooble.org/api/about. Публикация вакансий — через ваш универсальный фид.' },

  { id: 'indeed', name: 'Indeed', url: 'https://docs.indeed.com/job-sync-api/',
    method: 'feed', auth: [], diff: 'contract', cost: 'Органика бесплатно; продвижение — Sponsored',
    desc: 'Глобальный агрегатор с большим трафиком в Польше. Внимание: старый XML-фид отключается 31.03.2026, замена — Job Sync API (нужно партнёрство).',
    what: 'Вакансии на Indeed. Пока работает через фид; далее — через партнёрский Job Sync API.',
    steps: [
      'Сейчас: добавьте ссылку на фид в Indeed (Job Sync) — вакансии появятся за несколько часов.',
      'До 31.03.2026 Indeed переводит всех на Job Sync API — для него нужно стать партнёром Indeed (заявка + одобрение).',
      'Напишите нам, если нужен приоритетный перевод на новый API Indeed.',
    ],
    note: 'Добавьте ссылку на фид в Indeed (Job Sync). Старый XML-фид работает до 31.03.2026.' },

  { id: 'pracuj', name: 'Pracuj.pl', url: 'https://www.pracuj.pl',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'Платно (пакеты/контракт)',
    desc: 'Крупнейший портал вакансий Польши. Открытого API нет — публикация только через договор с Pracuj.pl или их ATS eRecruiter (аккаунт-менеджер).',
    what: 'Публикация на флагмане польского рынка. Требует договора — своего открытого API у Pracuj нет.',
    steps: [
      'Заключите договор с Pracuj.pl или подключите их ATS eRecruiter (erecruiter.pl).',
      'Получите у аккаунт-менеджера доступ к кабинету pracodawca.pracuj.pl.',
      'Укажите здесь логин кабинета и e-mail вашего менеджера — по ним отправляем объявления на согласование.',
    ],
    note: 'Укажите логин кабинета pracodawca.pracuj.pl и e-mail вашего аккаунт-менеджера Pracuj.pl.' },

  { id: 'linkedin', name: 'LinkedIn', url: 'https://learn.microsoft.com/linkedin/talent/job-postings/api/overview',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'Basic Jobs бесплатно; Promoted — платно',
    desc: 'Профсеть для специалистов и руководителей. Самая зарегулированная: новых на Job Posting API не берут, публикация — только через партнёрскую программу.',
    what: 'Вакансии для white-collar и руководителей. Базовые (бесплатные) вакансии агрегируются пассивно.',
    steps: [
      'Укажите Company Page вашей компании в LinkedIn.',
      'Полноценная публикация через API требует статуса сертифицированного партнёра LinkedIn (Apply Connect).',
      'Базовые бесплатные вакансии LinkedIn может подхватывать пассивно из вашего фида.',
    ],
    note: 'Укажите ссылку на страницу компании в LinkedIn. Публикация через API — по партнёрскому доступу.' },

  { id: 'adzuna', name: 'Adzuna', url: 'https://developer.adzuna.com',
    method: 'feed', auth: ['api'], diff: 'easy', cost: 'Поиск — бесплатный тариф; размещение — CPC',
    desc: 'Агрегатор вакансий с открытым API поиска. Ваши вакансии принимает фидом; для аналитики рынка есть API-ключ.',
    what: 'Вакансии на Adzuna через фид. Ключ (app_id/app_key) — для поиска и аналитики зарплат.',
    steps: [
      'Добавьте ссылку на ваш фид в кабинете Adzuna для работодателей.',
      'Для поиска/аналитики: получите app_id и app_key на developer.adzuna.com и вставьте их сюда как app_id:app_key.',
    ],
    note: 'Ссылку на фид добавьте в Adzuna. Для поиска — app_id:app_key с developer.adzuna.com.' },

  { id: 'jooblefeed', name: 'Trovit / Jobrapido / прочие агрегаторы', url: 'https://www.trovit.com',
    method: 'feed', auth: [], diff: 'easy', cost: 'CPC (плата за клик)',
    desc: 'Крупные агрегаторы, принимающие стандартный JobPosting-фид. Оплата по модели «за клик».',
    what: 'Дополнительный охват через сети агрегаторов, работающих на вашем фиде.',
    steps: [
      'Добавьте ссылку на ваш фид в кабинете агрегатора.',
      'Для платного продвижения согласуйте ставку CPC с менеджером сети.',
    ],
    note: 'Добавьте ссылку на фид в кабинете агрегатора (Trovit/Jobrapido и др.).' },

  { id: 'aplikuj', name: 'Aplikuj.pl', url: 'https://www.aplikuj.pl',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'Бесплатные и платные публикации',
    desc: 'Польский портал вакансий. Открытого API нет — интеграция через ATS (напр. Elevato) или кабинет работодателя.',
    what: 'Публикация на популярной польской доске. Отклики могут возвращаться в ATS (через Elevato).',
    steps: [
      'Заведите аккаунт работодателя на aplikuj.pl.',
      'Для автопубликации свяжите его через ATS-провайдера (Elevato) — потребуется контакт с площадкой.',
      'Укажите здесь логин/пароль кабинета работодателя.',
    ],
    note: 'Открытого API нет — укажите логин/пароль кабинета работодателя aplikuj.pl.' },

  { id: 'pracapl', name: 'Praca.pl', url: 'https://www.praca.pl',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'Платно',
    desc: 'Один из старейших польских порталов вакансий. Открытого API нет — публикация через кабинет или ATS-провайдера.',
    what: 'Дополнительный охват на устоявшейся польской доске.',
    steps: ['Заведите кабинет работодателя на praca.pl.', 'Публикация — через кабинет или ATS-провайдера (по договору с площадкой).', 'Укажите логин/пароль кабинета.'],
    note: 'Открытого API нет — логин/пароль кабинета работодателя praca.pl.' },

  { id: 'gowork', name: 'GoWork.pl', url: 'https://www.gowork.pl',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'До 5 объявлений бесплатно, далее платно',
    desc: 'Вакансии и отзывы о работодателях; важен для бренда работодателя. Открытого API нет.',
    what: 'Охват + работа над репутацией работодателя. Первые 5 объявлений — бесплатно.',
    steps: ['Заведите кабинет работодателя на gowork.pl (до 5 объявлений бесплатно).', 'Публикация — через кабинет или ATS.', 'Укажите логин/пароль кабинета.'],
    note: 'Открытого API нет — логин/пароль кабинета GoWork.pl. Первые 5 объявлений бесплатно.' },

  { id: 'nofluff', name: 'No Fluff Jobs (IT)', url: 'https://nofluffjobs.com',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'Платно',
    desc: 'Ведущая IT-доска Польши с прозрачными зарплатами. Открытого API нет — публикация через кабинет или ATS Elevato.',
    what: 'Точечный охват IT-кандидатов. Через ATS Elevato публикация до ~6 часов.',
    steps: ['Заведите кабинет работодателя на nofluffjobs.com.', 'Для автопубликации — через ATS Elevato.', 'Укажите логин/пароль кабинета.'],
    note: 'IT-доска. Открытого API нет — логин/пароль кабинета nofluffjobs.com.' },

  { id: 'justjoin', name: 'JustJoin.it (IT)', url: 'https://justjoin.it',
    method: 'login', auth: ['login'], diff: 'contract', cost: 'Платно',
    desc: 'Популярная IT-доска Польши. Открытого API нет — публикация через кабинет работодателя.',
    what: 'Охват IT-специалистов на одной из главных IT-досок PL.',
    steps: ['Заведите кабинет работодателя на justjoin.it.', 'Разместите вакансию в кабинете (тривиально).', 'Укажите логин/пароль кабинета.'],
    note: 'IT-доска. Открытого API нет — логин/пароль кабинета justjoin.it.' },
];
export function connectionsOf(settings){ settings.jobPortals = settings.jobPortals || {}; return settings.jobPortals; }
export function isConnected(settings, id){ const p = PORTALS.find(x => x.id === id); if (p && (p.method === 'auto')) return true; if (p && p.method === 'feed' && (!p.auth || !p.auth.length)) return true; const c = connectionsOf(settings)[id] || {}; return !!(c.login || c.apiKey); }
