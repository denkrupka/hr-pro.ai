'use strict';
// HR AI Pro — recruiter dashboard client
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const api = async (url, opts = {}) => {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  if (r.status === 401) { location.href = '/login'; throw new Error('unauth'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Ошибка запроса');
  return d;
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400); };

const state = { user: null, sections: [], activeSection: 'all', vacancies: [], activeVac: 'all', participants: [], view: 'home', eduSlug: null, langs: [],
  allVacancies: [], allParticipants: [], _vacsAt: 0, _partsAt: 0 };
const DATA_TTL = 20000; // клиентский кэш вакансий/кандидатов: мгновенное переключение вкладок без сети
const LANG_NAME = { ru: 'Русский', uk: 'Украи́нский', pl: 'Польский', en: 'Английский' };
// ---- портальная локализация ----
const LANG_NAME_I18N = {
  ru: { ru: 'Русский', uk: 'Украи́нский', pl: 'Польский', en: 'Английский' },
  pl: { ru: 'Rosyjski', uk: 'Ukraiński', pl: 'Polski', en: 'Angielski' },
  en: { ru: 'Russian', uk: 'Ukrainian', pl: 'Polish', en: 'English' },
};
const TEST_TITLE_I18N = {
  ru: { tools: 'Тулс', result: 'Резалт', logic: 'Логис', sales: 'Сэйлс', knowledge: 'Проверка знаний' },
  pl: { tools: 'Tools', result: 'Result', logic: 'Logic', sales: 'Sales', knowledge: 'Sprawdzenie wiedzy' },
  en: { tools: 'Tools', result: 'Result', logic: 'Logic', sales: 'Sales', knowledge: 'Knowledge check' },
};
function langName(code) { const m = LANG_NAME_I18N[LANG] || LANG_NAME_I18N.ru; return m[code] || code; }
function testTitle(ty) { const m = TEST_TITLE_I18N[LANG] || TEST_TITLE_I18N.ru; return m[ty] || (typeof TEST_LABEL !== 'undefined' && TEST_LABEL[ty]) || ty; }
let LANG = localStorage.getItem('hp_lang') || 'ru';
const PORTAL_LANGS = [{ code: 'ru', name: 'Русский', short: 'RU' }, { code: 'pl', name: 'Polski', short: 'PL' }, { code: 'en', name: 'English', short: 'EN' }];
function docLang() { return ['ru', 'pl', 'en'].includes(LANG) ? LANG : 'ru'; }
function vidLang() { return LANG === 'pl' ? 'pl' : 'ru'; } // видео есть только RU/PL
let eduTab = 'info';
const I18N = {
  ru: {
    nav_vacancies: 'Рекрутация', rec_applications: 'Заявки', rec_vacancies: 'Вакансии', nav_anketas: 'Анкеты', nav_candidates: 'Кандидаты', nav_calendar: 'Календарь', nav_tests: 'Тесты', nav_education: 'Обучение', nav_integrations: 'Интеграции', nav_balance: 'Баланс', nav_faq: 'FAQ', nav_settings: 'Настройки', nav_logout: 'Выйти', nav_theme: 'Тема',
    brand_tag: 'Технология, которая<br>чувствует людей', role_admin: 'Администратор',
    edu: 'Обучение', edu_kb: 'База знаний', edu_soon: 'Материалы готовятся.', loading: 'Загрузка…',
    edu_free: 'Бесплатные', edu_paid: 'Платные', lp_programs: 'Программы обучения', lp_none: 'Программы скоро появятся.',
    lp_price: 'Цена', lp_tests_unit: 'тестов', lp_sections: 'разделов', lp_progress: 'Прогресс', lp_locked: 'Заблокировано',
    lp_locked_hint: 'Сначала завершите предыдущую программу', lp_buy: 'Купить', lp_open: 'Открыть', lp_continue: 'Продолжить',
    lp_completed: 'Завершена', lp_purchased: 'Куплена', lp_not_enough: 'Недостаточно баланса', lp_topup: 'Пополнить',
    lp_buy_confirm: 'Купить программу «{t}» за {n} тестов?', lp_bought: 'Программа куплена', lp_back: '← К программам',
    lp_content: 'Содержание', lp_section: 'Раздел', lp_mark_done: 'Отметить пройденным', lp_done: 'Пройдено',
    lp_quiz: 'Итоговый тест', lp_quiz_locked: 'Пройдите все разделы, чтобы открыть тест', lp_quiz_pass: 'Порог прохождения',
    lp_quiz_submit: 'Проверить', lp_quiz_passed: 'Тест сдан — программа завершена!', lp_quiz_failed: 'Не сдано. Повторите: верно {c} из {t} ({p}%)',
    lp_quiz_result: 'Результат: {c} из {t} ({p}%)', lp_pick_answer: 'Ответьте на все вопросы', lp_your_balance: 'Ваш баланс',
    lp_close: 'Закрыть', lp_protected: 'Материал защищён авторским правом. Копирование, скачивание и распространение запрещены.', lp_hidden: 'Контент скрыт', lp_copy_blocked: 'Копирование запрещено — материал защищён', lp_read_to_end: 'Дочитайте до конца', lp_reading: 'Прочитано',
    lp_trailer: 'Трейлер', lp_trailer_locked: 'Трейлер откроется после покупки предыдущей программы', lp_trailer_soon: 'Трейлер скоро появится', lp_buy_title: 'Покупка программы', lp_buy_after: 'Останется после покупки', lp_buy_btn: 'Купить за {n} тестов', lp_cancel: 'Отмена',
    lp_material: 'Материал обучения', lp_module: 'Модуль', lp_min_read: 'мин чтения', lp_passed_title: 'Материал пройден', lp_passed_sub: 'Прогресс сохранён в вашей программе обучения', lp_mark_passed: 'Отметить как пройдено',
    lp_quiz_intro: 'Проверочный тест по программе. Откроется в отдельном окне.', lp_quiz_start: 'Пройти тест', lp_questions: 'вопросов', lp_sec_locked: 'Сначала пройдите предыдущий раздел', lp_bookmark: 'Закладка', lp_bookmark_on: 'Закладка стоит', lp_bookmark_set: 'Закладка поставлена', lp_bookmark_removed: 'Закладка снята', lp_bookmark_resumed: 'Открыто с закладки', lp_bm_q_title: 'Поставить закладку?', lp_bm_q_text: 'Сохраним место, на котором вы остановились, чтобы в следующий раз открыть материал с этого места.', lp_bm_set_btn: 'Поставить закладку', lp_bm_exit: 'Выйти без закладки',
    tab_info: 'Общая информация', tab_rules: 'Правила', tab_spec: 'Спецификация', tab_video: 'Видео',
    stub_dev: 'Раздел в разработке', stub_soon: 'Наполнение появится позже.',
    dash_overview: 'Обзор', dash_title: 'Панель приборов', balance: 'Баланс',
    kpi_candidates: 'Кандидатов', kpi_done: 'Тестов пройдено', kpi_pending: 'В ожидании', kpi_apps: 'Откликов с анкет', kpi_vacancies: 'Вакансий', kpi_conversion: 'Конверсия в найм',
    funnel_title: 'Воронка найма', funnel_sub: 'кандидат → найм', stages_title: 'Распределение по этапам', types_title: 'Тесты по типам', newcands_title: 'Новые кандидаты · 14 дней', recent_title: 'Последние кандидаты', all_link: 'Все →', topvac_title: 'Топ вакансий',
    nav_dashboard: 'Дашборд', dash_ai_kick: 'ИИ-ассистент', dash_ai_wait: 'ждут решения', dash_ai_lead: 'ИИ уже собрал спектр-профили. Откройте карточку — сильные и слабые стороны с рекомендацией видны сразу.',
    send_test: 'Отправить тест', search_cand_ph: 'Поиск кандидата…', tests_word: 'тестов', cand_word_1: 'кандидат', cand_word_2: 'кандидата', cand_word_5: 'кандидатов',
    quick_ph: 'Email или телефон — отправить тест мгновенно', send_btn: 'Отправить', without_vacancy: 'Без вакансии', no_candidates: 'Пока нет кандидатов.', no_vacancies: 'Нет вакансий.', pick_tests: 'Выберите тесты', topup: 'Пополнить',
    total_word: 'всего', no_data: 'Нет данных',
    home_title: 'Отправьте тест кандидату', send_ph: 'Email или телефон — несколько через запятую', all_sections: 'Все разделы', no_section: 'Без раздела', add_btn: '＋ Добавить', all_vacancies: 'Все вакансии', add_vacancy: '＋ Вакансия', edit_btn: '✎ Изменить',
    f_all_tests: 'Все тесты', f_all_stages: 'Все этапы', f_any_status: 'Любой статус', f_done: 'Пройден', f_pending: 'Ожидание', sort_new: 'Сначала новые', sort_name: 'По имени', search: 'Поиск', export_csv: 'Экспорт CSV',
    col_candidate: 'Кандидат', col_results: 'Результаты', col_id: 'ID', col_stage: 'Этап', col_sexage: 'Пол · возраст', col_tel: 'Телефон', col_result: '★ Резалт', col_logic: '★ Логис', col_date: 'Дата', col_city: 'Город', col_comment: 'Комментарий', sending: 'Отправка…',
    pick_title: 'Выберите тесты для отправки', pick_sub: 'Можно выбрать несколько — кандидат получит по одному тесту каждого типа.', q_word: 'вопросов', min_word: 'мин', test_selected: 'Тест выбран ✓', select_test: 'Выбрать тест', done: 'Готово', pick_one: 'Выберите хотя бы один тест',
    desc_tools: 'Тест на оценку характера и личностных качеств по 10 показателям', desc_result: 'Сценарный тест для оценки продуктивности соискателя на предыдущей работе', desc_logic: 'Тест на проверку уровня интеллекта (IQ) — способности мыслить и принимать решения', desc_sales: 'Тест на оценку способностей человека как специалиста в области продаж по 12 показателям',
    bal_eyebrow: 'Баланс и оплата', bal_title: 'Ваш баланс тестов', bal_available: 'Доступно к отправке', bal_total: 'Всего куплено', bal_pending: 'В ожидании списания', bal_topup_h: 'Пополнить баланс', tests_word: 'тестов', bal_save: 'Выгода', bal_per: 'за тест', bal_buy: 'Купить', bal_hit: 'Хит', bal_history: 'История покупок', bal_no_purch: 'Покупок пока нет.', bal_stripe: 'Оплата картой через Stripe.', bal_demo: 'Демо-режим: оплата зачисляется мгновенно.', bal_paying: 'Оплата…', bal_topped: 'Баланс пополнен ✓', bal_ttl_note: 'Тесты действуют 1 год с даты пополнения.', bal_ttl_next: 'Ближайшее сгорание —',
    set_account: 'Аккаунт', set_title: 'Настройки аккаунта', set_profile: 'Профиль', set_params: 'Параметры', set_notify: 'Уведомления', set_templates: 'Шаблоны писем', set_security: 'Безопасность',
    prof_edit: 'Изменение информации', prof_email: 'Ваш Email', prof_name: 'Ваше имя', prof_surname: 'Ваша фамилия', prof_company: 'Название компании', prof_employees: 'Кол-во сотрудников', prof_phone: 'Контактный номер', prof_logo: 'Логотип компании', prof_no_logo: 'Нет логотипа', prof_upload: 'Загрузить и кадрировать', prof_remove: 'Убрать', save: 'Сохранить', saved: 'Сохранено', cancel: 'Отмена',
    par_tz: 'Часовой пояс', par_uilang: 'Язык интерфейса', order_title: 'Очередность тестов', order_sub: 'Порядок, в котором кандидат получает тесты, когда отправляется несколько сразу.', order_save: 'Сохранить порядок',
    notif_title: 'Уведомления и приватность', notif_sms: 'Дублировать в SMS ссылки на прохождение тестирований', notif_comment: 'Отправлять email-уведомление при комментарии к видеоинтервью', notif_search: 'Искать соискателей во всех аккаунтах компании', notif_personal: 'Запрашивать персональные данные соискателя при прохождении теста',
    sec_title: 'Изменение пароля', sec_cur: 'Текущий пароль', sec_new: 'Новый пароль', sec_rep: 'Повторите новый пароль', sec_change: 'Сменить пароль', sec_mismatch: 'Пароли не совпадают', sec_changed: 'Пароль изменён',
    pm_name: 'Имя', pm_surname: 'Фамилия', pm_email: 'Почта', pm_city: 'Город', pm_vacancy: 'Вакансия', pm_sex: 'Пол', pm_male: 'Мужской', pm_female: 'Женский', pm_age: 'Возраст', pm_stage: 'Этап', pm_comment: 'Личный комментарий', pm_cv: 'Резюме (CV)', pm_years: 'лет', pm_delete: 'Удалить', pm_send_more: 'Отправить ещё тест кандидату', pm_deleted: 'Кандидат удалён', pm_del_confirm: 'Удалить кандидата и все его тесты?', pm_sent: 'Тест отправлен · ссылка готова',
    pm_opt_tools: 'Тулс — личность', pm_opt_result: 'Резалт — продуктивность', pm_opt_logic: 'Логис — интеллект', pm_opt_sales: 'Сэйлс — продажи',
    vm_vacancy: 'Вакансия', vm_add: 'Добавить вакансию', vm_hint: 'Указывайте полное и точное название — оно используется в письме кандидату.', vm_name: 'Название вакансии', vm_name_ph: 'Введите название', vm_section: 'Раздел', vm_lang: 'Язык отправляемых e-mail', vm_add_btn: 'Добавить', vm_need_name: 'Укажите название', vm_del_confirm: 'Удалить вакансию «', vm_del_tail: '»? Кандидаты останутся, но без вакансии.',
    sec_modal_title: 'Раздел', sec_modal_hint: 'Переименуйте или удалите раздел.', sec_lbl_name: 'Название', sec_del_btn: 'Удалить раздел', sec_prompt: 'Название раздела:', sec_del_confirm: 'Удалить раздел «', sec_del_tail: '»? Вакансии останутся, но без раздела.',
    stat_title: 'Статистика вакансий', stat_vac_col: 'Вакансия', stat_cands: 'Кандидатов', stat_done: 'Пройдено', stat_pending: 'В ожидании', stat_no_vac: 'Без вакансии', close: 'Закрыть',
    col_cfg_title: 'Настройка таблицы кандидатов', col_cfg_sub: 'Выберите, какие столбцы показывать в списке кандидатов.', apply: 'Применить',
    tpl_title: 'Шаблоны сообщений кандидатам', mail_cat_send: 'При отправке тестов', mail_cat_status: 'При изменении статуса', tpl_subject: 'Тема письма', tpl_body: 'Текст письма', tpl_save_btn: 'Сохранить шаблоны', tpl_hint: 'Язык — от вакансии. SMS отправляется, если в поле получателя указан телефон.', sms_label: 'Текст SMS', sms_hint: 'Коротко, без темы — до ~360 символов. Те же переменные $…$.', st_rejected: 'Отказано', st_interview: 'Собеседование', st_reserve: 'Резерв', st_accepted: 'Принят', mail_vars: 'Переменные',
    rte_bold: 'Жирный', rte_italic: 'Курсив', rte_underline: 'Подчёркнутый', rte_font: 'Шрифт', rte_format: 'Формат', rte_size: 'Размер', rte_color: 'Цвет текста', rte_ul: 'Маркированный список', rte_ol: 'Нумерованный список', rte_link: 'Вставить ссылку', rte_img: 'Вставить картинку', rte_html: 'Редактировать HTML', fmt_normal: 'Обычный', fmt_h2: 'Заголовок', fmt_h3: 'Подзаголовок', sz_small: 'Мелкий', sz_normal: 'Обычный', sz_large: 'Крупный', g_bold: 'Ж', g_italic: 'К', g_underline: 'Ч',
    links_sent: 'Тесты отправлены', links_sub: 'Сообщение кандидату (email или SMS) и ссылки для прохождения',
    tp_none: 'Тесты ещё не отправлялись.', queued_badge: 'в очереди', links_seq: 'Первый тест отправлен. Следующий уйдёт кандидату автоматически — после того как он пройдёт предыдущий.', tst_done: 'Выполнен', tst_prog: 'Проходит', tst_wait: 'Ждём ответ', tp_started: 'Начал', tp_finished: 'Закончил', tp_time: 'Время', tp_status: 'Статус', tp_link: 'Ссылка на тест', tp_copy: 'Копировать ссылку', tp_see: 'Смотреть результат →', tp_open: 'Открыть тест', tp_del: 'Удалить тест', prev_test: 'Предыдущий тест', next_test: 'Следующий тест', rep_print: 'Печать', rep_vacancy: 'Вакансия', rep_close: 'Закрыть', ai_hint: 'Подсказка от ИИ', synd_h: 'Синдромы и перевесы', z_vlow: 'Очень низкий', z_low: 'Низкий', z_mid: 'Средний', z_high: 'Высокий', z_vhigh: 'Очень высокий',
    lr_correct: 'Верных', lr_question: 'Вопрос', lr_matrix: 'Абстрактная матрица — оценивается вручную.', lr_answer: 'Ответ:', lr_right: 'Верный:', iq_note_h: 'IQ — только часть пазла', iq_note: 'Интеллект показывает способность видеть сходства и различия, разумно мыслить и принимать решения. Особенно важен при выборе руководителя. Не решайте только по IQ — оцените продуктивность «Резалтом» и характер «Тулсом».',
    share_title: 'Публичная ссылка на результат', share_sub: 'Просмотр доступен всем, у кого есть ссылка.', share_active: 'Активна', share_inactive: 'Неактивна', share_on: 'Активировать', share_off: 'Отключить', decision: 'Решение:', act_interview: 'Собеседование', act_reserve: 'В резерв', act_reject: 'Отказать', spectrum: 'Спектр профиля', interp_h: 'Объяснение результатов', sales_profile: 'Профиль продавца · 12 показателей', answers_q: 'Ответы по вопросам', ans_maybe: 'Ответы «Может быть»', ans_sometimes: 'Ответы «Иногда»', mark_visual: 'Визуальный', mark_correct: '✔ Верно', mark_skipped: '— Пропущен', mark_wrong: '✕ Неверно', opt_right: 'верный', opt_chosen: 'выбран', variant: 'Вариант',
    csv_no_data: 'Нет данных для экспорта', csv_tests: 'Тесты', csv_done: 'пройден', csv_pending: 'ожидание',
    faq_help: 'Помощь', faq_title: 'Ответы на часто задаваемые вопросы', faq_search: 'Поиск по вопросам…',
    faqcat_start: 'С чего начать', faqcat_general: 'Общие вопросы', faqcat_tech: 'Технические вопросы', faqcat_func: 'Функционал системы', faqcat_tests: 'Вопросы по тестам', faqcat_pricing: 'Оплата и тарифы',
    ak_eyebrow: 'Сбор откликов', ak_my: 'Мои анкеты', ak_create: 'Создать анкету', ak_prefix: 'Префикс коротких ссылок', ak_prefix_ph: 'например, mycompany', ak_prefix_auto: 'Формируется автоматически из первого слова названия вашей компании (Настройки → Профиль).', ak_copy: 'Копировать', ak_edit: 'Изменить', ak_delete: 'Удалить', ak_empty: 'Пока не создано ни одной анкеты.', ak_empty_link: 'Создадим первую анкету?', ak_vac_pfx: 'Вакансия: ', ak_tests_word: 'тест(ов) · откликов:',
    ak_intro: 'Анкета — ваш персональный «мини-сайт» с короткой ссылкой для сбора откликов. Разместите её в вакансии, соцсетях или отправьте напрямую — кандидаты откликнутся и сразу попадут в вашу воронку.', ak_after: 'После отклика система автоматически:', ak_after1: 'добавит кандидата в нужную вакансию', ak_after2: 'запустит выбранные тесты оценки', ak_after3: 'покажет результат в вашем кабинете',
    ae_edit_title: 'Редактирование анкеты', ae_create_title: 'Создание анкеты', ae_name: 'Название анкеты', ae_name_ph: 'Введите название', ae_pick_vac: 'Выберите вакансию', ae_slug: 'Короткая ссылка', ae_slug_ph: 'напр. sales-manager', ae_btntext: 'Текст кнопки отклика', ae_ptitle: 'Заголовок страницы', ae_ptitle_ph: 'Напр. Отклик на вакансию', ae_nocaptcha: 'Отключить капчу', ae_sendemail: 'Отправлять e-mail кандидату', ae_msgapply: 'Сообщение после отклика (без тестов)', ae_msgdone: 'Сообщение после завершения тестов', ae_tests: 'Тесты, которые получит кандидат', ae_desc: 'Описание (текст мини-сайта)', ae_save_create: 'Создать анкету', ae_preview: 'Предпросмотр',
  },
  pl: {
    nav_vacancies: 'Rekrutacja', rec_applications: 'Zgłoszenia', rec_vacancies: 'Wakaty', nav_anketas: 'Ankiety', nav_candidates: 'Kandydaci', nav_calendar: 'Kalendarz', nav_tests: 'Testy', nav_education: 'Szkolenia', nav_integrations: 'Integracje', nav_balance: 'Saldo', nav_faq: 'FAQ', nav_settings: 'Ustawienia', nav_logout: 'Wyloguj', nav_theme: 'Motyw',
    brand_tag: 'Technologia, która<br>czuje ludzi', role_admin: 'Administrator',
    edu: 'Szkolenia', edu_kb: 'Baza wiedzy', edu_soon: 'Materiały w przygotowaniu.', loading: 'Ładowanie…',
    edu_free: 'Bezpłatne', edu_paid: 'Płatne', lp_programs: 'Programy szkoleniowe', lp_none: 'Programy wkrótce się pojawią.',
    lp_price: 'Cena', lp_tests_unit: 'testów', lp_sections: 'rozdziałów', lp_progress: 'Postęp', lp_locked: 'Zablokowane',
    lp_locked_hint: 'Najpierw ukończ poprzedni program', lp_buy: 'Kup', lp_open: 'Otwórz', lp_continue: 'Kontynuuj',
    lp_completed: 'Ukończony', lp_purchased: 'Kupiony', lp_not_enough: 'Za mało salda', lp_topup: 'Doładuj',
    lp_buy_confirm: 'Kupić program „{t}” za {n} testów?', lp_bought: 'Program kupiony', lp_back: '← Do programów',
    lp_content: 'Spis treści', lp_section: 'Rozdział', lp_mark_done: 'Oznacz jako ukończony', lp_done: 'Ukończono',
    lp_quiz: 'Test końcowy', lp_quiz_locked: 'Ukończ wszystkie rozdziały, aby odblokować test', lp_quiz_pass: 'Próg zaliczenia',
    lp_quiz_submit: 'Sprawdź', lp_quiz_passed: 'Test zdany — program ukończony!', lp_quiz_failed: 'Niezaliczone. Spróbuj ponownie: poprawnie {c} z {t} ({p}%)',
    lp_quiz_result: 'Wynik: {c} z {t} ({p}%)', lp_pick_answer: 'Odpowiedz na wszystkie pytania', lp_your_balance: 'Twoje saldo',
    lp_close: 'Zamknij', lp_protected: 'Materiał chroniony prawem autorskim. Kopiowanie, pobieranie i rozpowszechnianie zabronione.', lp_hidden: 'Treść ukryta', lp_copy_blocked: 'Kopiowanie zabronione — materiał chroniony', lp_read_to_end: 'Doczytaj do końca', lp_reading: 'Przeczytano',
    lp_trailer: 'Zwiastun', lp_trailer_locked: 'Zwiastun odblokuje się po zakupie poprzedniego programu', lp_trailer_soon: 'Zwiastun wkrótce', lp_buy_title: 'Zakup programu', lp_buy_after: 'Pozostanie po zakupie', lp_buy_btn: 'Kup za {n} testów', lp_cancel: 'Anuluj',
    lp_material: 'Materiał szkoleniowy', lp_module: 'Moduł', lp_min_read: 'min czytania', lp_passed_title: 'Materiał ukończony', lp_passed_sub: 'Postęp zapisany w Twoim programie szkoleniowym', lp_mark_passed: 'Oznacz jako ukończone',
    lp_quiz_intro: 'Test sprawdzający z programu. Otworzy się w osobnym oknie.', lp_quiz_start: 'Rozpocznij test', lp_questions: 'pytań', lp_sec_locked: 'Najpierw ukończ poprzedni rozdział', lp_bookmark: 'Zakładka', lp_bookmark_on: 'Zakładka ustawiona', lp_bookmark_set: 'Zakładka ustawiona', lp_bookmark_removed: 'Zakładka usunięta', lp_bookmark_resumed: 'Otwarto od zakładki', lp_bm_q_title: 'Ustawić zakładkę?', lp_bm_q_text: 'Zapiszemy miejsce, w którym skończyłeś, aby następnym razem otworzyć materiał od tego miejsca.', lp_bm_set_btn: 'Ustaw zakładkę', lp_bm_exit: 'Wyjdź bez zakładki',
    tab_info: 'Informacje ogólne', tab_rules: 'Zasady', tab_spec: 'Specyfikacja', tab_video: 'Wideo',
    stub_dev: 'Sekcja w budowie', stub_soon: 'Zawartość pojawi się później.',
    dash_overview: 'Przegląd', dash_title: 'Panel', balance: 'Saldo',
    kpi_candidates: 'Kandydaci', kpi_done: 'Testy ukończone', kpi_pending: 'Oczekujące', kpi_apps: 'Zgłoszenia z ankiet', kpi_vacancies: 'Wakaty', kpi_conversion: 'Konwersja na zatrudnienie',
    funnel_title: 'Lejek rekrutacji', funnel_sub: 'kandydat → zatrudnienie', stages_title: 'Rozkład wg etapów', types_title: 'Testy wg typu', newcands_title: 'Nowi kandydaci · 14 dni', recent_title: 'Ostatni kandydaci', all_link: 'Wszyscy →', topvac_title: 'Najczęstsze wakaty',
    nav_dashboard: 'Pulpit', dash_ai_kick: 'Asystent AI', dash_ai_wait: 'czeka na decyzję', dash_ai_lead: 'AI zebrało już profile-spektrum. Otwórz kartę — mocne i słabe strony wraz z rekomendacją widać od razu.',
    send_test: 'Wyślij test', search_cand_ph: 'Szukaj kandydata…', tests_word: 'testów', cand_word_1: 'kandydat', cand_word_2: 'kandydatów', cand_word_5: 'kandydatów',
    quick_ph: 'E-mail lub telefon — wyślij test natychmiast', send_btn: 'Wyślij', without_vacancy: 'Bez wakatu', no_candidates: 'Brak kandydatów.', no_vacancies: 'Brak wakatów.', pick_tests: 'Wybierz testy', topup: 'Doładuj',
    total_word: 'razem', no_data: 'Brak danych',
    home_title: 'Wyślij test kandydatowi', send_ph: 'E-mail lub telefon — kilka po przecinku', all_sections: 'Wszystkie działy', no_section: 'Bez działu', add_btn: '＋ Dodaj', all_vacancies: 'Wszystkie wakaty', add_vacancy: '＋ Wakat', edit_btn: '✎ Edytuj',
    f_all_tests: 'Wszystkie testy', f_all_stages: 'Wszystkie etapy', f_any_status: 'Dowolny status', f_done: 'Ukończony', f_pending: 'Oczekuje', sort_new: 'Najpierw nowe', sort_name: 'Wg nazwiska', search: 'Szukaj', export_csv: 'Eksport CSV',
    col_candidate: 'Kandydat', col_results: 'Wyniki', col_id: 'ID', col_stage: 'Etap', col_sexage: 'Płeć · wiek', col_tel: 'Telefon', col_result: '★ Result', col_logic: '★ Logic', col_date: 'Data', col_city: 'Miasto', col_comment: 'Komentarz', sending: 'Wysyłanie…',
    pick_title: 'Wybierz testy do wysłania', pick_sub: 'Możesz wybrać kilka — kandydat otrzyma po jednym teście każdego typu.', q_word: 'pytań', min_word: 'min', test_selected: 'Wybrano ✓', select_test: 'Wybierz test', done: 'Gotowe', pick_one: 'Wybierz co najmniej jeden test',
    desc_tools: 'Test oceny charakteru i cech osobowości wg 10 wskaźników', desc_result: 'Scenariuszowy test oceny produktywności kandydata w poprzedniej pracy', desc_logic: 'Test poziomu inteligencji (IQ) — zdolności myślenia i podejmowania decyzji', desc_sales: 'Test oceny umiejętności sprzedażowych wg 12 wskaźników',
    bal_eyebrow: 'Saldo i płatności', bal_title: 'Twoje saldo testów', bal_available: 'Dostępne do wysłania', bal_total: 'Łącznie kupione', bal_pending: 'Oczekuje na pobranie', bal_topup_h: 'Doładuj saldo', tests_word: 'testów', bal_save: 'Oszczędność', bal_per: 'za test', bal_buy: 'Kup', bal_hit: 'Hit', bal_history: 'Historia zakupów', bal_no_purch: 'Brak zakupów.', bal_stripe: 'Płatność kartą przez Stripe.', bal_demo: 'Tryb demo: płatność księgowana natychmiast.', bal_paying: 'Płatność…', bal_topped: 'Saldo doładowane ✓', bal_ttl_note: 'Testy są ważne 1 rok od daty doładowania.', bal_ttl_next: 'Najbliższe wygaśnięcie —',
    set_account: 'Konto', set_title: 'Ustawienia konta', set_profile: 'Profil', set_params: 'Parametry', set_notify: 'Powiadomienia', set_templates: 'Szablony e-maili', set_security: 'Bezpieczeństwo',
    prof_edit: 'Zmiana danych', prof_email: 'Twój e-mail', prof_name: 'Imię', prof_surname: 'Nazwisko', prof_company: 'Nazwa firmy', prof_employees: 'Liczba pracowników', prof_phone: 'Numer kontaktowy', prof_logo: 'Logo firmy', prof_no_logo: 'Brak logo', prof_upload: 'Wgraj i przytnij', prof_remove: 'Usuń', save: 'Zapisz', saved: 'Zapisano', cancel: 'Anuluj',
    par_tz: 'Strefa czasowa', par_uilang: 'Język interfejsu', order_title: 'Kolejność testów', order_sub: 'Kolejność, w jakiej kandydat otrzymuje testy, gdy wysyłasz kilka naraz.', order_save: 'Zapisz kolejność',
    notif_title: 'Powiadomienia i prywatność', notif_sms: 'Dublować w SMS linki do wypełnienia testów', notif_comment: 'Wysyłać powiadomienie e-mail przy komentarzu do wideorozmowy', notif_search: 'Szukać kandydatów we wszystkich kontach firmy', notif_personal: 'Prosić o dane osobowe kandydata podczas testu',
    sec_title: 'Zmiana hasła', sec_cur: 'Obecne hasło', sec_new: 'Nowe hasło', sec_rep: 'Powtórz nowe hasło', sec_change: 'Zmień hasło', sec_mismatch: 'Hasła nie są zgodne', sec_changed: 'Hasło zmienione',
    pm_name: 'Imię', pm_surname: 'Nazwisko', pm_email: 'E-mail', pm_city: 'Miasto', pm_vacancy: 'Wakat', pm_sex: 'Płeć', pm_male: 'Mężczyzna', pm_female: 'Kobieta', pm_age: 'Wiek', pm_stage: 'Etap', pm_comment: 'Komentarz prywatny', pm_cv: 'CV', pm_years: 'lat', pm_delete: 'Usuń', pm_send_more: 'Wyślij kandydatowi kolejny test', pm_deleted: 'Kandydat usunięty', pm_del_confirm: 'Usunąć kandydata i wszystkie jego testy?', pm_sent: 'Test wysłany · link gotowy',
    pm_opt_tools: 'Tools — osobowość', pm_opt_result: 'Result — produktywność', pm_opt_logic: 'Logic — inteligencja', pm_opt_sales: 'Sales — sprzedaż',
    vm_vacancy: 'Wakat', vm_add: 'Dodaj wakat', vm_hint: 'Podaj pełną i dokładną nazwę — jest używana w e-mailu do kandydata.', vm_name: 'Nazwa wakatu', vm_name_ph: 'Wpisz nazwę', vm_section: 'Dział', vm_lang: 'Język wysyłanych e-maili', vm_add_btn: 'Dodaj', vm_need_name: 'Podaj nazwę', vm_del_confirm: 'Usunąć wakat „', vm_del_tail: '”? Kandydaci pozostaną, ale bez wakatu.',
    sec_modal_title: 'Dział', sec_modal_hint: 'Zmień nazwę lub usuń dział.', sec_lbl_name: 'Nazwa', sec_del_btn: 'Usuń dział', sec_prompt: 'Nazwa działu:', sec_del_confirm: 'Usunąć dział „', sec_del_tail: '”? Wakaty pozostaną, ale bez działu.',
    stat_title: 'Statystyki wakatów', stat_vac_col: 'Wakat', stat_cands: 'Kandydaci', stat_done: 'Ukończone', stat_pending: 'Oczekujące', stat_no_vac: 'Bez wakatu', close: 'Zamknij',
    col_cfg_title: 'Ustawienia tabeli kandydatów', col_cfg_sub: 'Wybierz, które kolumny pokazać na liście kandydatów.', apply: 'Zastosuj',
    tpl_title: 'Szablony wiadomości do kandydatów', mail_cat_send: 'Przy wysyłce testów', mail_cat_status: 'Przy zmianie statusu', tpl_subject: 'Temat wiadomości', tpl_body: 'Treść wiadomości', tpl_save_btn: 'Zapisz szablony', tpl_hint: 'Język — wg wakatu. SMS jest wysyłany, gdy w polu odbiorcy podano telefon.', sms_label: 'Treść SMS', sms_hint: 'Krótko, bez tematu — do ~360 znaków. Te same zmienne $…$.', st_rejected: 'Odrzucono', st_interview: 'Rozmowa', st_reserve: 'Rezerwa', st_accepted: 'Przyjęty', mail_vars: 'Zmienne',
    rte_bold: 'Pogrubienie', rte_italic: 'Kursywa', rte_underline: 'Podkreślenie', rte_font: 'Czcionka', rte_format: 'Format', rte_size: 'Rozmiar', rte_color: 'Kolor tekstu', rte_ul: 'Lista punktowana', rte_ol: 'Lista numerowana', rte_link: 'Wstaw link', rte_img: 'Wstaw obraz', rte_html: 'Edytuj HTML', fmt_normal: 'Zwykły', fmt_h2: 'Nagłówek', fmt_h3: 'Podnagłówek', sz_small: 'Mały', sz_normal: 'Zwykły', sz_large: 'Duży', g_bold: 'B', g_italic: 'I', g_underline: 'U',
    links_sent: 'Testy wysłane', links_sub: 'Wiadomość do kandydata (e-mail lub SMS) i linki do wypełnienia',
    tp_none: 'Testy nie zostały jeszcze wysłane.', queued_badge: 'w kolejce', links_seq: 'Pierwszy test wysłany. Kolejny trafi do kandydata automatycznie — po ukończeniu poprzedniego.', tst_done: 'Ukończony', tst_prog: 'W trakcie', tst_wait: 'Czekamy na odpowiedź', tp_started: 'Rozpoczął', tp_finished: 'Zakończył', tp_time: 'Czas', tp_status: 'Status', tp_link: 'Link do testu', tp_copy: 'Kopiuj link', tp_see: 'Zobacz wynik →', tp_open: 'Otwórz test', tp_del: 'Usuń test', prev_test: 'Poprzedni test', next_test: 'Następny test', rep_print: 'Drukuj', rep_vacancy: 'Wakat', rep_close: 'Zamknij', ai_hint: 'Podpowiedź AI', synd_h: 'Syndromy i przewagi', z_vlow: 'Bardzo niski', z_low: 'Niski', z_mid: 'Średni', z_high: 'Wysoki', z_vhigh: 'Bardzo wysoki',
    lr_correct: 'Poprawnych', lr_question: 'Pytanie', lr_matrix: 'Abstrakcyjna macierz — oceniana ręcznie.', lr_answer: 'Odpowiedź:', lr_right: 'Poprawna:', iq_note_h: 'IQ to tylko część układanki', iq_note: 'Inteligencja pokazuje zdolność dostrzegania podobieństw i różnic, rozsądnego myślenia i podejmowania decyzji. Szczególnie ważna przy wyborze kierownika. Nie decyduj wyłącznie na podstawie IQ — oceń produktywność testem „Result” i charakter testem „Tools”.',
    share_title: 'Publiczny link do wyniku', share_sub: 'Podgląd dostępny dla każdego, kto ma link.', share_active: 'Aktywny', share_inactive: 'Nieaktywny', share_on: 'Aktywuj', share_off: 'Wyłącz', decision: 'Decyzja:', act_interview: 'Rozmowa', act_reserve: 'Do rezerwy', act_reject: 'Odrzuć', spectrum: 'Spektrum profilu', interp_h: 'Objaśnienie wyników', sales_profile: 'Profil sprzedawcy · 12 wskaźników', answers_q: 'Odpowiedzi wg pytań', ans_maybe: 'Odpowiedzi „Może”', ans_sometimes: 'Odpowiedzi „Czasami”', mark_visual: 'Wizualne', mark_correct: '✔ Poprawnie', mark_skipped: '— Pominięte', mark_wrong: '✕ Błędnie', opt_right: 'poprawny', opt_chosen: 'wybrany', variant: 'Wariant',
    csv_no_data: 'Brak danych do eksportu', csv_tests: 'Testy', csv_done: 'ukończony', csv_pending: 'oczekuje',
    faq_help: 'Pomoc', faq_title: 'Odpowiedzi na najczęstsze pytania', faq_search: 'Szukaj w pytaniach…',
    faqcat_start: 'Od czego zacząć', faqcat_general: 'Pytania ogólne', faqcat_tech: 'Pytania techniczne', faqcat_func: 'Funkcje systemu', faqcat_tests: 'Pytania o testy', faqcat_pricing: 'Płatności i cennik',
    ak_eyebrow: 'Zbieranie zgłoszeń', ak_my: 'Moje ankiety', ak_create: 'Utwórz ankietę', ak_prefix: 'Prefiks krótkich linków', ak_prefix_ph: 'np. mycompany', ak_prefix_auto: 'Tworzony automatycznie z pierwszego słowa nazwy Twojej firmy (Ustawienia → Profil).', ak_copy: 'Kopiuj', ak_edit: 'Edytuj', ak_delete: 'Usuń', ak_empty: 'Nie utworzono jeszcze żadnej ankiety.', ak_empty_link: 'Utwórzmy pierwszą ankietę?', ak_vac_pfx: 'Wakat: ', ak_tests_word: 'test(ów) · zgłoszeń:',
    ak_intro: 'Ankieta to Twoja osobista „mini-strona” z krótkim linkiem do zbierania zgłoszeń. Umieść ją w ogłoszeniu, w social media lub wyślij bezpośrednio — kandydaci zgłoszą się i od razu trafią do Twojego lejka.', ak_after: 'Po zgłoszeniu system automatycznie:', ak_after1: 'doda kandydata do właściwego wakatu', ak_after2: 'uruchomi wybrane testy oceny', ak_after3: 'pokaże wynik w Twoim panelu',
    ae_edit_title: 'Edycja ankiety', ae_create_title: 'Tworzenie ankiety', ae_name: 'Nazwa ankiety', ae_name_ph: 'Wpisz nazwę', ae_pick_vac: 'Wybierz wakat', ae_slug: 'Krótki link', ae_slug_ph: 'np. sales-manager', ae_btntext: 'Tekst przycisku zgłoszenia', ae_ptitle: 'Nagłówek strony', ae_ptitle_ph: 'Np. Zgłoszenie na wakat', ae_nocaptcha: 'Wyłącz captcha', ae_sendemail: 'Wysyłać e-mail do kandydata', ae_msgapply: 'Wiadomość po zgłoszeniu (bez testów)', ae_msgdone: 'Wiadomość po ukończeniu testów', ae_tests: 'Testy, które otrzyma kandydat', ae_desc: 'Opis (tekst mini-strony)', ae_save_create: 'Utwórz ankietę', ae_preview: 'Podgląd',
  },
  en: {
    nav_vacancies: 'Recruitment', rec_applications: 'Applications', rec_vacancies: 'Vacancies', nav_anketas: 'Forms', nav_candidates: 'Candidates', nav_calendar: 'Calendar', nav_tests: 'Tests', nav_education: 'Learning', nav_integrations: 'Integrations', nav_balance: 'Balance', nav_faq: 'FAQ', nav_settings: 'Settings', nav_logout: 'Log out', nav_theme: 'Theme',
    brand_tag: 'Technology that<br>reads people', role_admin: 'Administrator',
    edu: 'Learning', edu_kb: 'Knowledge base', edu_soon: 'Materials are being prepared.', loading: 'Loading…',
    edu_free: 'Free', edu_paid: 'Paid', lp_programs: 'Training programs', lp_none: 'Programs are coming soon.',
    lp_price: 'Price', lp_tests_unit: 'tests', lp_sections: 'sections', lp_progress: 'Progress', lp_locked: 'Locked',
    lp_locked_hint: 'Complete the previous program first', lp_buy: 'Buy', lp_open: 'Open', lp_continue: 'Continue',
    lp_completed: 'Completed', lp_purchased: 'Purchased', lp_not_enough: 'Not enough balance', lp_topup: 'Top up',
    lp_buy_confirm: 'Buy the program “{t}” for {n} tests?', lp_bought: 'Program purchased', lp_back: '← To programs',
    lp_content: 'Contents', lp_section: 'Section', lp_mark_done: 'Mark as done', lp_done: 'Done',
    lp_quiz: 'Final test', lp_quiz_locked: 'Complete all sections to unlock the test', lp_quiz_pass: 'Pass threshold',
    lp_quiz_submit: 'Check', lp_quiz_passed: 'Test passed — program completed!', lp_quiz_failed: 'Not passed. Try again: {c} of {t} correct ({p}%)',
    lp_quiz_result: 'Result: {c} of {t} ({p}%)', lp_pick_answer: 'Answer all questions', lp_your_balance: 'Your balance',
    lp_close: 'Close', lp_protected: 'This material is copyright-protected. Copying, downloading and distribution are prohibited.', lp_hidden: 'Content hidden', lp_copy_blocked: 'Copying is disabled — material is protected', lp_read_to_end: 'Read to the end', lp_reading: 'Read',
    lp_trailer: 'Trailer', lp_trailer_locked: 'The trailer unlocks after buying the previous program', lp_trailer_soon: 'Trailer coming soon', lp_buy_title: 'Buy program', lp_buy_after: 'Balance after purchase', lp_buy_btn: 'Buy for {n} tests', lp_cancel: 'Cancel',
    lp_quiz_intro: 'A check test for the program. Opens in a separate window.', lp_quiz_start: 'Take the test', lp_questions: 'questions', lp_sec_locked: 'Complete the previous section first', lp_material: 'Learning material', lp_module: 'Module', lp_min_read: 'min read', lp_passed_title: 'Material completed', lp_passed_sub: 'Progress saved in your training program', lp_mark_passed: 'Mark as completed',
    lp_bookmark: 'Bookmark', lp_bookmark_on: 'Bookmarked', lp_bookmark_set: 'Bookmark saved', lp_bookmark_removed: 'Bookmark removed', lp_bookmark_resumed: 'Opened at your bookmark', lp_bm_q_title: 'Save a bookmark?', lp_bm_q_text: 'We will save where you stopped so you can reopen this material right at that spot next time.', lp_bm_set_btn: 'Save bookmark', lp_bm_exit: 'Exit without bookmark',
    tab_info: 'Overview', tab_rules: 'Rules', tab_spec: 'Specification', tab_video: 'Video',
    stub_dev: 'Section under development', stub_soon: 'Content will appear later.',
    dash_overview: 'Overview', dash_title: 'Dashboard', balance: 'Balance',
    kpi_candidates: 'Candidates', kpi_done: 'Tests completed', kpi_pending: 'Pending', kpi_apps: 'Form applications', kpi_vacancies: 'Vacancies', kpi_conversion: 'Hiring conversion',
    funnel_title: 'Hiring funnel', funnel_sub: 'candidate → hire', stages_title: 'Distribution by stage', types_title: 'Tests by type', newcands_title: 'New candidates · 14 days', recent_title: 'Recent candidates', all_link: 'All →', topvac_title: 'Top vacancies',
    nav_dashboard: 'Dashboard', dash_ai_kick: 'AI assistant', dash_ai_wait: 'awaiting your decision', dash_ai_lead: 'AI has already built the spectrum profiles. Open a card — strengths, weaknesses and a recommendation are visible at once.',
    send_test: 'Send test', search_cand_ph: 'Search candidate…', tests_word: 'tests', cand_word_1: 'candidate', cand_word_2: 'candidates', cand_word_5: 'candidates',
    quick_ph: 'Email or phone — send a test instantly', send_btn: 'Send', without_vacancy: 'No vacancy', no_candidates: 'No candidates yet.', no_vacancies: 'No vacancies.', pick_tests: 'Select tests', topup: 'Top up',
    total_word: 'total', no_data: 'No data',
    home_title: 'Send a test to a candidate', send_ph: 'Email or phone — several, comma-separated', all_sections: 'All departments', no_section: 'No department', add_btn: '＋ Add', all_vacancies: 'All vacancies', add_vacancy: '＋ Vacancy', edit_btn: '✎ Edit',
    f_all_tests: 'All tests', f_all_stages: 'All stages', f_any_status: 'Any status', f_done: 'Completed', f_pending: 'Pending', sort_new: 'Newest first', sort_name: 'By name', search: 'Search', export_csv: 'Export CSV',
    col_candidate: 'Candidate', col_results: 'Results', col_id: 'ID', col_stage: 'Stage', col_sexage: 'Sex · age', col_tel: 'Phone', col_result: '★ Result', col_logic: '★ Logic', col_date: 'Date', col_city: 'City', col_comment: 'Comment', sending: 'Sending…',
    pick_title: 'Select tests to send', pick_sub: 'You can pick several — the candidate gets one test of each type.', q_word: 'questions', min_word: 'min', test_selected: 'Selected ✓', select_test: 'Select test', done: 'Done', pick_one: 'Select at least one test',
    desc_tools: 'Personality and character assessment across 10 traits', desc_result: 'Scenario test assessing the candidate’s productivity at previous jobs', desc_logic: 'Intelligence (IQ) test — thinking speed and decision-making', desc_sales: 'Sales competency assessment across 12 indicators',
    bal_eyebrow: 'Balance & payment', bal_title: 'Your test balance', bal_available: 'Available to send', bal_total: 'Total purchased', bal_pending: 'Pending charge', bal_topup_h: 'Top up balance', tests_word: 'tests', bal_save: 'Save', bal_per: 'per test', bal_buy: 'Buy', bal_hit: 'Popular', bal_history: 'Purchase history', bal_no_purch: 'No purchases yet.', bal_stripe: 'Card payment via Stripe.', bal_demo: 'Demo mode: payment credited instantly.', bal_paying: 'Processing…', bal_topped: 'Balance topped up ✓', bal_ttl_note: 'Tests are valid for 1 year from the top-up date.', bal_ttl_next: 'Next to expire —',
    set_account: 'Account', set_title: 'Account settings', set_profile: 'Profile', set_params: 'Parameters', set_notify: 'Notifications', set_templates: 'Email templates', set_security: 'Security',
    prof_edit: 'Edit information', prof_email: 'Your email', prof_name: 'First name', prof_surname: 'Last name', prof_company: 'Company name', prof_employees: 'Number of employees', prof_phone: 'Contact number', prof_logo: 'Company logo', prof_no_logo: 'No logo', prof_upload: 'Upload and crop', prof_remove: 'Remove', save: 'Save', saved: 'Saved', cancel: 'Cancel',
    par_tz: 'Time zone', par_uilang: 'Interface language', order_title: 'Test order', order_sub: 'The order in which the candidate receives tests when several are sent at once.', order_save: 'Save order',
    notif_title: 'Notifications and privacy', notif_sms: 'Also send test links via SMS', notif_comment: 'Send email notification on video interview comments', notif_search: 'Search candidates across all company accounts', notif_personal: 'Ask for the candidate’s personal data during the test',
    sec_title: 'Change password', sec_cur: 'Current password', sec_new: 'New password', sec_rep: 'Repeat new password', sec_change: 'Change password', sec_mismatch: 'Passwords do not match', sec_changed: 'Password changed',
    pm_name: 'First name', pm_surname: 'Last name', pm_email: 'Email', pm_city: 'City', pm_vacancy: 'Vacancy', pm_sex: 'Sex', pm_male: 'Male', pm_female: 'Female', pm_age: 'Age', pm_stage: 'Stage', pm_comment: 'Private comment', pm_cv: 'Resume (CV)', pm_years: 'y.o.', pm_delete: 'Delete', pm_send_more: 'Send the candidate another test', pm_deleted: 'Candidate deleted', pm_del_confirm: 'Delete the candidate and all their tests?', pm_sent: 'Test sent · link ready',
    pm_opt_tools: 'Tools — personality', pm_opt_result: 'Result — productivity', pm_opt_logic: 'Logic — intelligence', pm_opt_sales: 'Sales — sales',
    vm_vacancy: 'Vacancy', vm_add: 'Add vacancy', vm_hint: 'Use the full, exact title — it appears in the candidate email.', vm_name: 'Vacancy title', vm_name_ph: 'Enter a title', vm_section: 'Department', vm_lang: 'Language of sent emails', vm_add_btn: 'Add', vm_need_name: 'Enter a title', vm_del_confirm: 'Delete vacancy “', vm_del_tail: '”? Candidates stay, but without a vacancy.',
    sec_modal_title: 'Department', sec_modal_hint: 'Rename or delete the department.', sec_lbl_name: 'Name', sec_del_btn: 'Delete department', sec_prompt: 'Department name:', sec_del_confirm: 'Delete department “', sec_del_tail: '”? Vacancies stay, but without a department.',
    stat_title: 'Vacancy statistics', stat_vac_col: 'Vacancy', stat_cands: 'Candidates', stat_done: 'Completed', stat_pending: 'Pending', stat_no_vac: 'No vacancy', close: 'Close',
    col_cfg_title: 'Candidate table settings', col_cfg_sub: 'Choose which columns to show in the candidate list.', apply: 'Apply',
    tpl_title: 'Candidate message templates', mail_cat_send: 'When sending tests', mail_cat_status: 'On status change', tpl_subject: 'Email subject', tpl_body: 'Email body', tpl_save_btn: 'Save templates', tpl_hint: 'Language is set by the vacancy. SMS is sent if the recipient field contains a phone.', sms_label: 'SMS text', sms_hint: 'Short, no subject — up to ~360 chars. Same $…$ variables.', st_rejected: 'Rejected', st_interview: 'Interview', st_reserve: 'Reserve', st_accepted: 'Accepted', mail_vars: 'Variables',
    rte_bold: 'Bold', rte_italic: 'Italic', rte_underline: 'Underline', rte_font: 'Font', rte_format: 'Format', rte_size: 'Size', rte_color: 'Text color', rte_ul: 'Bulleted list', rte_ol: 'Numbered list', rte_link: 'Insert link', rte_img: 'Insert image', rte_html: 'Edit HTML', fmt_normal: 'Normal', fmt_h2: 'Heading', fmt_h3: 'Subheading', sz_small: 'Small', sz_normal: 'Normal', sz_large: 'Large', g_bold: 'B', g_italic: 'I', g_underline: 'U',
    links_sent: 'Tests sent', links_sub: 'Message to the candidate (email or SMS) and links to take the tests',
    tp_none: 'No tests sent yet.', queued_badge: 'queued', links_seq: 'The first test is sent. The next one goes to the candidate automatically once they finish the previous one.', tst_done: 'Completed', tst_prog: 'In progress', tst_wait: 'Awaiting answer', tp_started: 'Started', tp_finished: 'Finished', tp_time: 'Time', tp_status: 'Status', tp_link: 'Test link', tp_copy: 'Copy link', tp_see: 'View result →', tp_open: 'Open test', tp_del: 'Delete test', prev_test: 'Previous test', next_test: 'Next test', rep_print: 'Print', rep_vacancy: 'Vacancy', rep_close: 'Close', ai_hint: 'AI hint', synd_h: 'Syndromes and imbalances', z_vlow: 'Very low', z_low: 'Low', z_mid: 'Medium', z_high: 'High', z_vhigh: 'Very high',
    lr_correct: 'Correct', lr_question: 'Question', lr_matrix: 'Abstract matrix — graded manually.', lr_answer: 'Answer:', lr_right: 'Correct:', iq_note_h: 'IQ is only part of the picture', iq_note: 'Intelligence shows the ability to see similarities and differences, reason soundly and make decisions. It matters especially when choosing a manager. Do not decide on IQ alone — assess productivity with “Result” and character with “Tools”.',
    share_title: 'Public result link', share_sub: 'Viewable by anyone with the link.', share_active: 'Active', share_inactive: 'Inactive', share_on: 'Activate', share_off: 'Disable', decision: 'Decision:', act_interview: 'Interview', act_reserve: 'To reserve', act_reject: 'Reject', spectrum: 'Profile spectrum', interp_h: 'Results explanation', sales_profile: 'Salesperson profile · 12 indicators', answers_q: 'Answers by question', ans_maybe: '“Maybe” answers', ans_sometimes: '“Sometimes” answers', mark_visual: 'Visual', mark_correct: '✔ Correct', mark_skipped: '— Skipped', mark_wrong: '✕ Wrong', opt_right: 'correct', opt_chosen: 'chosen', variant: 'Option',
    csv_no_data: 'No data to export', csv_tests: 'Tests', csv_done: 'completed', csv_pending: 'pending',
    faq_help: 'Help', faq_title: 'Frequently asked questions', faq_search: 'Search questions…',
    faqcat_start: 'Getting started', faqcat_general: 'General questions', faqcat_tech: 'Technical questions', faqcat_func: 'System features', faqcat_tests: 'About the tests', faqcat_pricing: 'Payment & pricing',
    ak_eyebrow: 'Collecting applications', ak_my: 'My forms', ak_create: 'Create form', ak_prefix: 'Short link prefix', ak_prefix_ph: 'e.g. mycompany', ak_prefix_auto: 'Generated automatically from the first word of your company name (Settings → Profile).', ak_copy: 'Copy', ak_edit: 'Edit', ak_delete: 'Delete', ak_empty: 'No forms created yet.', ak_empty_link: 'Create the first form?', ak_vac_pfx: 'Vacancy: ', ak_tests_word: 'test(s) · applications:',
    ak_intro: 'A form is your personal “mini-site” with a short link for collecting applications. Post it in a job ad, on social media, or send it directly — candidates apply and go straight into your funnel.', ak_after: 'After an application, the system automatically:', ak_after1: 'adds the candidate to the right vacancy', ak_after2: 'launches the selected assessment tests', ak_after3: 'shows the result in your dashboard',
    ae_edit_title: 'Edit form', ae_create_title: 'Create form', ae_name: 'Form name', ae_name_ph: 'Enter a name', ae_pick_vac: 'Select a vacancy', ae_slug: 'Short link', ae_slug_ph: 'e.g. sales-manager', ae_btntext: 'Apply button text', ae_ptitle: 'Page heading', ae_ptitle_ph: 'e.g. Apply for the vacancy', ae_nocaptcha: 'Disable captcha', ae_sendemail: 'Send email to candidate', ae_msgapply: 'Message after applying (no tests)', ae_msgdone: 'Message after finishing tests', ae_tests: 'Tests the candidate will receive', ae_desc: 'Description (mini-site text)', ae_save_create: 'Create form', ae_preview: 'Preview',
  },
};
const FAQ_CAT_KEY = { 'С чего начать': 'faqcat_start', 'Общие вопросы': 'faqcat_general', 'Технические вопросы': 'faqcat_tech', 'Функционал системы': 'faqcat_func', 'Вопросы по тестам': 'faqcat_tests', 'Оплата и тарифы': 'faqcat_pricing' };
function faqCat(name) { return t(FAQ_CAT_KEY[name] || '') !== (FAQ_CAT_KEY[name] || '') ? t(FAQ_CAT_KEY[name]) : name; }
function testDesc(ty) { return t('desc_' + ty); }
function t(k) { return (I18N[LANG] && I18N[LANG][k] != null) ? I18N[LANG][k] : (I18N.ru[k] != null ? I18N.ru[k] : k); }
function tv(k, vars) { return String(t(k)).replace(/\{(\w+)\}/g, (m, n) => (vars && vars[n] != null ? vars[n] : m)); }
// перевод серверных названий этапов/воронки (данные приходят на русском)
const STAGE_I18N = {
  'Без этапа': { pl: 'Bez etapu', en: 'No stage' }, 'Новый': { pl: 'Nowy', en: 'New' },
  'Собеседование': { pl: 'Rozmowa', en: 'Interview' }, 'Резерв': { pl: 'Rezerwa', en: 'Reserve' },
  'Принят': { pl: 'Przyjęty', en: 'Accepted' }, 'Отказ': { pl: 'Odrzucony', en: 'Rejected' },
  'Кандидаты': { pl: 'Kandydaci', en: 'Candidates' }, 'Прошли тест': { pl: 'Ukończyli test', en: 'Completed test' }, 'Приняты': { pl: 'Przyjęci', en: 'Hired' },
  'Мужской': { pl: 'Mężczyzna', en: 'Male' }, 'Женский': { pl: 'Kobieta', en: 'Female' },
};
function tr(s) { if (LANG === 'ru' || !s) return s; const e = STAGE_I18N[s]; return (e && e[LANG]) ? e[LANG] : s; }
function applyI18n() {
  document.documentElement.lang = LANG;
  $$('[data-i18n]').forEach(el => { const html = t(el.dataset.i18n); if (/</.test(html)) el.innerHTML = html; else el.textContent = html; });
}
function setLang(code) {
  if (!PORTAL_LANGS.some(l => l.code === code)) return;
  LANG = code; localStorage.setItem('hp_lang', code);
  applyI18n(); renderLangSwitch(); fillSideUser();
  setView(state.view || 'dashboard');
}
function renderLangSwitch() {
  const host = $('#lang-switch'); if (!host) return;
  const cur = PORTAL_LANGS.find(l => l.code === LANG) || PORTAL_LANGS[0];
  host.innerHTML = `<button class="lang-cur" id="lang-cur" aria-label="Язык">${_svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" fill="none"/>')}<span>${cur.short}</span>${_svg('<path d="M6 9l6 6 6-6" stroke-linecap="round"/>')}</button>
    <div class="lang-menu" id="lang-menu">${PORTAL_LANGS.map(l => `<button class="lang-opt ${l.code === LANG ? 'on' : ''}" data-lang="${l.code}">${esc(l.name)}<span class="lang-sh">${l.short}</span></button>`).join('')}</div>`;
  const menu = $('#lang-menu');
  $('#lang-cur').onclick = e => { e.stopPropagation(); menu.classList.toggle('open'); };
  $$('#lang-menu [data-lang]').forEach(b => b.onclick = () => { menu.classList.remove('open'); setLang(b.dataset.lang); });
  document.addEventListener('click', () => menu.classList.remove('open'), { once: true });
}
const TEST_LABEL = { result: 'Резалт', tools: 'Тулс', logic: 'Логис', sales: 'Сэйлс' };
const _svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const TEST_SVG = {
  tools: _svg('<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="14.5" cy="7" r="2.1"/><circle cx="8" cy="12" r="2.1"/><circle cx="16.5" cy="17" r="2.1"/><circle cx="8" cy="12" r="1" fill="currentColor" stroke="none"/>'),
  result: _svg('<polyline points="4 17 9.5 11.2 13 14.4 20 7"/><polyline points="15.6 7 20 7 20 11.4"/><circle cx="4" cy="17" r="1.6" fill="currentColor" stroke="none"/>'),
  logic: _svg('<path d="M12 3.2a5.8 5.8 0 0 0-3.4 10.5c.6.5 1 1.2 1 2v1h4.8v-1c0-.8.4-1.5 1-2A5.8 5.8 0 0 0 12 3.2Z"/><path d="M10 20h4"/><circle cx="12" cy="9" r="1.4" fill="currentColor" stroke="none"/>'),
  sales: _svg('<circle cx="12" cy="12" r="7.2"/><circle cx="12" cy="12" r="3.6"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><path d="M12 12 18.5 5.5"/><path d="M18.5 5.5h-3M18.5 5.5v3"/>'),
};
const TEST_ICON = TEST_SVG;
const ICON_SEARCH = _svg('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>');
const ICON_PRINT = _svg('<path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8" rx="1"/><path d="M6 17H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/>');
const ICON_SPARK = _svg('<path d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8L12 3Z"/>');
const ICON_COPY = _svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>');
const ICON_KNOWLEDGE = _svg('<path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="3"/>');
const ICON_TRASH = _svg('<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>');
const ICON_PHONE = _svg('<path d="M5 4h3l1.8 4.5-2.2 1.7a12.5 12.5 0 0 0 6.2 6.2l1.7-2.2L20 16v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/>');
// Единая иконка ИИ по порталу (искра вместо эмодзи-робота)
const AI_IC = `<span class="ai-ic">${ICON_SPARK}</span>`;
const ICON_FLAME = _svg('<path d="M12 3c.6 3-2.4 4.6-2.4 7.2a2.4 2.4 0 0 0 4.8.3c1.2 1.2 3.1 2.7 3.1 5A5.5 5.5 0 1 1 6.5 15c0-2.3 1.3-3.8 2.3-5.1.4 1.1 1.1 1.7 1.1 1.7C9.6 8.9 10.8 6.4 12 3Z"/>');
const ICON_BOLT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>';
const ICON_LINK = _svg('<path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>');
const ICON_IMG = _svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l5-5 4 4 3-3 4 4"/>');
const EDU_SVG = {
  rules: _svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>'),
  instruct: _svg('<path d="M12 6.5A3.5 3.5 0 0 0 8.5 3H3v15h5.5a3.5 3.5 0 0 1 3.5 3.5M12 6.5A3.5 3.5 0 0 1 15.5 3H21v15h-5.5a3.5 3.5 0 0 0-3.5 3.5M12 6.5v15"/>'),
  personality: TEST_SVG.tools, productivity: TEST_SVG.result, logic: TEST_SVG.logic, sales: TEST_SVG.sales,
};
// candidate pipeline stages (HR-scanner parity) — colored
const STAGES = [
  { id: 'Без этапа', color: '' },
  { id: 'Новый', color: '#3d6cd1' },
  { id: 'Собеседование', color: '#c98a1e' },
  { id: 'Резерв', color: '#5847b5' },
  { id: 'Принят', color: '#1f9d6b' },
  { id: 'Отказ', color: '#d24b4b' },
];
const stageColor = s => (STAGES.find(x => x.id === s) || {}).color || '';
function stagePill(stage) {
  const s = stage || 'Без этапа', c = stageColor(s);
  if (!c) return `<span class="stage-pill none">${esc(tr(s))}</span>`;
  return `<span class="stage-pill" style="color:${c};background:${c}1f;border-color:${c}55">${esc(tr(s))}</span>`;
}
function stageOptions(cur) { return STAGES.map(s => `<option value="${s.id}" ${(cur || 'Без этапа') === s.id ? 'selected' : ''}>${tr(s.id)}</option>`).join(''); }
window.setStageFromReport = async (pid, stage) => { try { await api('/api/participants/' + pid, { method: 'PUT', body: JSON.stringify({ stage }) }); toast('Этап: ' + stage); const rp = state.participants.find(p => p.id === pid); if (rp) rp.stage = stage; } catch (e) { toast(e.message); } };

const AV_COLORS = ['#3d6cd1', '#2a4fa0', '#1f9d6b', '#e8553b', '#23306a', '#4e79da'];
const avColor = s => AV_COLORS[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length];
const initials = (n, e) => { const t = (n || '').trim(); return (t ? t.split(/\s+/).map(w => w[0]).slice(0, 2).join('') : (e || '?')[0]).toUpperCase(); };

// theme
// Портал — только тёмный hi-tech дизайн (светлой темы нет)
document.documentElement.setAttribute('data-theme', 'dark');
$('#logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); location.href = '/'; };

// ---- выпадающее меню пользователя (FAQ / Настройки / язык / тема / Админка / Выход) ----
(function initUserMenu() {
  const btn = $('#user-menu-btn'), menu = $('#user-menu');
  if (!btn || !menu) return;
  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); };
  btn.onclick = e => { e.stopPropagation(); menu.classList.contains('open') ? close() : open(); };
  // Закрытие по клику вне меню/кнопки
  document.addEventListener('click', e => { if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) close(); });
  // Пункты, которые уводят/меняют вид — закрывают меню (язык и тема остаются)
  menu.addEventListener('click', e => {
    const item = e.target.closest('[data-view],.logout,#nav-admin');
    if (item) close();
  });
})();

// ---- global search palette (Ctrl+K) ----
const gs = document.getElementById('gsearch');
if (gs) gs.onclick = () => openSearchPalette();
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (document.getElementById('sp-input')) closeModal(); else openSearchPalette(); }
});
let spSel = 0, spList = [];
async function openSearchPalette() {
  await loadParticipantsAll();
  $('#modal-root').innerHTML = `<div class="overlay palette" id="ov"><div class="cmdk">
    <div class="cmdk-top"><span class="cmdk-ic">${ICON_SEARCH}</span><input id="sp-input" placeholder="Поиск кандидатов по имени, email, телефону, городу…" autocomplete="off"><button class="cmdk-x" onclick="closeModal()" aria-label="Закрыть">×</button></div>
    <div class="cmdk-body" id="sp-body"></div>
    <div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> навигация</span><span><kbd>↵</kbd> открыть</span><span><kbd>Esc</kbd> закрыть</span></div>
  </div></div>`;
  $('#ov').onclick = e => { if (e.target.id === 'ov') closeModal(); };
  const inp = $('#sp-input'); inp.focus();
  const draw = () => {
    const q = inp.value.toLowerCase().trim();
    spList = q ? state.participants.filter(p => (p.name + ' ' + p.surname + ' ' + p.email + ' ' + (p.tel || '') + ' ' + (p.city || '')).toLowerCase().includes(q)).slice(0, 40) : [];
    spSel = 0;
    if (!q) { $('#sp-body').innerHTML = `<div class="cmdk-empty">${ICON_SEARCH}<p>Введите запрос, чтобы найти кандидата</p><span><kbd>Ctrl</kbd>+<kbd>K</kbd> — открыть / закрыть</span></div>`; return; }
    if (!spList.length) { $('#sp-body').innerHTML = `<div class="cmdk-empty"><p>Ничего не найдено</p></div>`; return; }
    $('#sp-body').innerHTML = spList.map((p, i) => { const nm = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email; return `<button class="cmdk-item ${i === spSel ? 'sel' : ''}" data-i="${i}"><span class="avatar" style="width:30px;height:30px;background:${avColor(nm)}">${esc(initials(nm, p.email))}</span><span class="ci-main"><b>${esc(nm)}</b><span class="ci-sub">${esc(p.email)}${p.vacancyName ? ' · ' + esc(p.vacancyName) : ''}</span></span>${stagePill(p.stage)}</button>`; }).join('');
    $$('#sp-body .cmdk-item').forEach(b => b.onclick = () => { closeModal(); openParticipant(spList[+b.dataset.i].id); });
  };
  const move = d => { if (!spList.length) return; spSel = (spSel + d + spList.length) % spList.length; $$('#sp-body .cmdk-item').forEach((b, i) => b.classList.toggle('sel', i === spSel)); const el = $$('#sp-body .cmdk-item')[spSel]; if (el) el.scrollIntoView({ block: 'nearest' }); };
  inp.oninput = draw;
  inp.onkeydown = e => { if (e.key === 'ArrowDown') { e.preventDefault(); move(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); } else if (e.key === 'Enter') { e.preventDefault(); if (spList[spSel]) { closeModal(); openParticipant(spList[spSel].id); } } else if (e.key === 'Escape') closeModal(); };
  draw();
}

$$('.nav-item[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
{ const bh = $('#brand-home'); if (bh) bh.onclick = () => setView('dashboard'); }
function setView(v) {
  state.view = v;
  $('#main').classList.remove('vac-lock');
  $$('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  { const bh = $('#brand-home'); if (bh) bh.classList.toggle('active', v === 'dashboard'); }
  ({ dashboard: renderDashboard, home: renderHome, anketas: renderAnketas, education: renderEducation, balance: renderBalance, settings: renderSettings, faq: renderFAQ, vacancies: renderRecruitment, candidates: renderCandidates, integrations: renderJobPortals, calendar: renderCalendar }[v] || renderHome)();
}

// ============ РЕКРУТАЦИЯ (полный workflow найма) ============
// Изолированный словарь, чтобы не трогать хрупкий основной I18N.
const RI18N = {
  ru: {
    req_new: 'Создать заявку', req_empty: 'Заявок пока нет. Создайте первую или отправьте ссылку руководителю.',
    req_st_draft: 'Черновик', req_st_submitted: 'На согласовании', req_st_approved: 'Утверждена', req_st_rejected: 'Отклонена',
    req_save: 'Сохранить', req_approve: 'Утвердить и создать вакансию', req_reject: 'Отклонить', req_delete: 'Удалить заявку',
    req_share: 'Ссылка руководителю', req_share_hint: 'Отправьте эту ссылку руководителю, чтобы он заполнил заявку сам.',
    req_analysis: 'Анализ ИИ', req_position: 'Должность', req_open: 'Открыть', req_created_vac: 'Вакансия создана',
    req_new_title: 'Новая заявка на подбор', req_edit_title: 'Заявка на подбор',
    req_lang: 'Язык вакансии и тестирования кандидата (укажите реальный язык, на котором кандидат будет общаться большую часть рабочего времени — критически важный для должности)',
    req_by_manager: 'От руководителя', req_has_vac: 'Вакансия создана',
    vac_empty: 'Утверждённых вакансий пока нет. Утвердите заявку во вкладке «Заявки».',
    vac_config: 'Настроить', vac_open: 'Открыть', vac_ad: 'Объявление о вакансии',
    vac_ad_gen: 'Сгенерировать ИИ', vac_ad_fallback: 'ИИ недоступен — показан базовый шаблон', vac_ad_manual: 'Или отредактируйте вручную:', vac_ad_target: 'Кого ищем',
    vac_target_auto: 'Автоопределение', vac_target_performer: 'Виннер', vac_target_executor: 'Дуер',
    vac_target_boss_hint: 'Руководящая должность — всегда ищем Виннера',
    vac_stages: 'Этапы отбора', vac_knowledge: 'Проверка знаний', vac_motivation: 'Оценка мотивации',
    vac_publish: 'Опубликовать (создать анкету)', vac_published: 'Опубликована', vac_apply_link: 'Ссылка на анкету',
    vac_stat_cands: 'Кандидатов', vac_stat_done: 'Пройдено', vac_stat_wait: 'Ожидание', vac_draft: 'Черновик', vac_new_card: 'Новая вакансия',
    vac_save: 'Сохранить настройки',
    kn_builder: 'Конструктор проверки знаний', kn_add: 'Добавить вопрос', kn_q: 'Текст вопроса',
    kn_opt: 'Вариант ответа', kn_add_opt: 'Добавить вариант', kn_correct: 'верный', kn_type: 'Тип',
    kn_single: 'Один ответ', kn_multi: 'Несколько ответов', kn_image: 'Картинка (URL)', kn_video: 'Видео (URL)',
    kn_pass: 'Порог прохождения, %', kn_save: 'Сохранить тест', kn_empty: 'Вопросов нет. Добавьте первый.',
    kn_new_test: 'Новый тест', kn_name: 'Название теста', kn_name_ph: 'напр. Знание ассортимента', kn_del_test: 'Удалить тест',
    kn_ai: 'Составить тест ИИ', kn_del_confirm: 'Вы действительно хотите удалить тест',
    jp_title: 'Порталы трудоустройства', jp_on: 'Подключено', jp_off: 'Не подключено', jp_connect: 'Подключить', jp_edit: 'Изменить доступы', jp_disconnect: 'Отключить', jp_login: 'Логин кабинета работодателя', jp_pass: 'Пароль', jp_connected: 'Портал подключён',
    jp_intro: 'Три способа: 1) агрегаторы (Indeed, Google for Jobs, Adzuna, Trovit) сами забирают ваши вакансии из публичного фида — просто дайте им ссылку ниже; 2) порталы с API (Jooble) — вставьте ключ, работает сразу; 3) остальные (pracuj.pl, OLX и др.) — вход по логину кабинета или партнёрскому доступу.',
    jp_by_feed: 'по фиду', jp_by_login: 'по логину', jp_copy_feed: 'Скопировать фид', jp_test: 'Проверить', jp_jobs_found: 'вакансий в API', jp_feed_ready: 'Фид готов',
    jp_feed_h: 'Фид ваших вакансий (JobPosting XML)', jp_feed_hint: 'Опубликованные вакансии в стандарте, который принимают агрегаторы. Добавьте эту ссылку в кабинете любого портала-агрегатора — вакансии проиндексируются автоматически.', jp_open_feed: 'Открыть',
    adp_tab_editor: 'Объявление', adp_tab_list: 'Объявления', adp_portal: 'Портал', adp_title: 'Название', adp_url: 'Ссылка на публикацию', adp_add: 'Добавить размещение', adp_link: 'Ссылка с меткой', adp_resp: 'Отклики', adp_motiv: 'Мотивация', adp_knowl: 'Знания', adp_conv: 'Конверсия', adp_empty: 'Размещений пока нет. Добавьте портал, где опубликовано объявление.',
    adp_hint: 'Для каждого размещения создаётся своя ссылка на анкету с меткой — раздавайте её на соответствующем портале, и отклики будут считаться по каждому размещению отдельно.',
    wf_open: 'Процесс найма', wf_title: 'Процесс найма кандидата', wf_pass: 'Прошёл', wf_fail: 'Не прошёл', wf_reset: 'Сброс',
    wf_skip: 'Пропустить этот шаг', wf_skipped: 'Пропущен', wf_unskip: 'Вернуть шаг в процесс',
    wf_resend: 'Отправить повторно', wf_resent: 'Ссылка отправлена повторно',
    wf_conduct: 'Провести', dec_hire: 'Трудоустроить', dec_interview: 'Пригласить на собеседование', dec_change: 'Изменить',
    v_bad_phone: 'Укажите корректный телефон (9–15 цифр)', v_bad_age: 'Возраст — две цифры, от 16 до 79',
    iv_title: 'Собеседование', iv_done: 'Проведено', iv_planned: 'Запланировано', iv_fill: 'Добавить детали', iv_created: 'Карточка собеседования создана',
    iv_date: 'Дата и время', iv_people: 'Участники собеседования', iv_people_ph: 'руководитель, директор…', iv_impr: 'Общие впечатления о кандидате', iv_scores: 'Оценочные показатели', iv_scores_ph: 'например: коммуникация 4/5, экспертиза 3/5…', iv_questions: 'Вопросы по кандидату', iv_notes: 'Личный комментарий',
    req_unlock: 'Изменить заявку',
    req_f_active: 'Новые (без утверждённых)', req_f_all: 'Все статусы', req_f_all_pos: 'Все должности',
    wf_motiv_guide: 'Как оценивать мотивацию (шкала и правила)',
    wf_motiv_scale_hint: 'Не делайте вывод по одному ответу — оценивайте совокупность: ответы, опыт, результат «Тулса». Вопросы о зарплате — это нормально; смотрите, интересует ли кандидата что-то КРОМЕ денег (продукт, клиенты, инструменты — исходящий поток). Красивые слова о будущем разворачивайте в прошлое и записывайте, кто может подтвердить факты.',
    wf_motiv_q_hint: 'Как спрашивать и на что смотреть',
    wf_motiv_ans_ph: 'Запишите ответ кандидата и свои наблюдения…',
    wf_motiv_mark: 'О чём говорит ответ:',
    wf_mk_out: 'Про дело и продукт', wf_mk_mix: 'Смешанно', wf_mk_in: 'Про деньги и выгоду',
    wf_mk_out_t: 'Исходящий поток: кандидату интересны продукт, клиенты, инструменты', wf_mk_in_t: 'Входящий поток: кандидата интересует только личная выгода',
    wf_motiv_suggest: 'По отметкам похоже на',
    ref_intro_h: 'Что такое референс и как его получить',
    ref_intro: 'Наведение справок — фундамент методики: факты из прошлого можно проверить, а обещания о будущем — нет. Позвоните бывшему руководителю кандидата по контактам, которые кандидат оставил сам. Представьтесь, скажите, что кандидат указал собеседника как человека, способного подтвердить его результаты, и попросите 5–10 минут. Задавайте вопросы по порядку и записывайте формулировки дословно. Главное наблюдение: при воспоминании о продуктивном сотруднике настроение собеседника заметно улучшается; сухость, паузы и уклончивость — тревожный знак.',
    wf_suggested: 'Рекомендация ИИ', wf_decision: 'Итоговое решение', wf_hired: 'К трудоустройству', wf_rejected: 'Отказ',
    wf_inprogress: 'В процессе', wf_pending: 'Ожидает', wf_no_test: 'Тест не отправлен', wf_send_knowledge: 'Отправить проверку знаний',
    wf_motiv_level: 'Уровень мотивации', wf_motiv_notes: 'Заметки по интервью', wf_motiv_save: 'Сохранить мотивацию',
    wf_ref_save: 'Сохранить референс', wf_open_test: 'Открыть тест', wf_see_res: 'Смотреть результат', wf_set_decision: 'Зафиксировать решение',
    common_gen: 'Генерация…', common_saved: 'Сохранено', common_copy: 'Копировать', common_close: 'Закрыть',
    req_share_company: 'Поделиться ссылкой', req_share_company_hint: 'Одна универсальная ссылка компании. По ней любой руководитель может создать свою заявку — заявок можно создавать сколько угодно.',
    req_page_hint: 'Заявка — фундамент подбора по методике: вы или руководитель описываете должность, её продукт и требования к кандидату. После утверждения заявка превращается в вакансию с настроенным процессом найма. Создайте заявку сами или отправьте руководителю ссылку — он заполнит её без доступа к порталу.',
    vac_quick_create: 'Создать вакансию', vac_quick_name: 'Название вакансии (должности)',
    vac_quick_hint: 'Для эффективного создания вакансии лучше заполнить её через заявку — так вы сразу поймёте, кто именно вам нужен.',
    vac_quick_go: 'Создать', vac_quick_via_req: 'Заполнить через заявку', vac_quick_need_name: 'Укажите название вакансии',
    vac_back: '← К вакансиям', vac_tab_dashboard: 'Дашборд', vac_tab_kanban: 'Канбан', vac_tab_ad: 'Объявление', vac_tab_knowledge: 'Проверка знаний',
    vac_tab_req: 'Заявка', vac_tab_anketas: 'Анкеты', vac_tab_cands: 'Кандидаты', vac_tab_process: 'Процесс найма',
    vp_auto: 'Автоворонка', vp_auto_hint: 'Портал сам ведёт кандидата по шагам: как только кандидат попадает в воронку, ему автоматически уходит первый тест, а после прохождения — следующий. Ручные шаги (референсы, мотивация) остаются за рекрутёром и автоотправку не блокируют.',
    vp_stages_h: 'Шаги процесса', vp_stages_hint: 'Включайте и выключайте шаги под конкретную должность. Выключенный шаг исчезает из процесса кандидата и канбана и не влияет на итоговое решение.',
    vp_st_result: 'Продуктивность (Резалт)', vp_st_references: 'Референсы', vp_st_tools: 'Личность (Тулс)',
    vp_st_logic: 'Тест на логику (Логис)', vp_st_sales: 'Тест на продажи (Sales)', vp_st_motivation: 'Уровень мотивации', vp_st_knowledge: 'Проверка знаний',
    vp_ref_hint: 'Проводит рекрутёр по контактам руководителей из «Резалта»',
    vp_ai_first: 'Звонок ИИ: первый контакт', vp_ai_afterResult: 'Звонок ИИ после «Резалта»', vp_ai_afterTools: 'Звонок ИИ после «Тулса»', vp_ai_motivation: 'Оценка мотивации в звонке с ИИ',
    vp_ai_references: 'Получение референсов с помощью ИИ', vp_ai_references_hint: 'ИИ сам звонит руководителям из «Резалта» и собирает справку',
    refai_btn: 'Звонок ИИ', refai_calling: 'ИИ звонит…', refai_hint: 'ИИ позвонит руководителю и соберёт референс', refai_started: 'ИИ звонит руководителю — справка появится после разговора', refai_done: 'Референс собран ИИ', refai_err: 'Не удалось запустить ИИ-звонок',
    aicalls_btn: 'Звонки ИИ', aicalls_title: 'Звонки ИИ', aicalls_refresh: 'Обновить', aicalls_tab_active: 'Звонки', aicalls_tab_history: 'История',
    aicalls_no_active: 'Активных звонков нет', aicalls_no_history: 'Завершённых звонков пока нет', aicalls_transcript: 'Транскрипция', aicalls_no_tr: 'Транскрипт пока недоступен',
    aicalls_no_rec: 'Запись недоступна', aicalls_attempt: 'Попытка', aicalls_cont: 'дозвон', aicalls_calls: 'звонка(ов)', aicalls_answers: 'Собранные ответы', aicalls_remaining: 'осталось',
    aic_st_calling: 'Идёт звонок', aic_st_analyzing: 'Анализ', aic_st_continuing: 'Перезвон', aic_st_done: 'Завершён', aic_st_failed: 'Не удалось',
    wf_see_ai: 'Смотреть результат (звонок ИИ)', aic_result_title: 'Результат ИИ-звонка',
    aicfg_btn: 'Настройки ИИ-звонков', aicfg_title: 'Настройки ИИ-звонков', aicfg_own: 'свои настройки', aicfg_inherited: 'унаследовано',
    aicfg_agent: 'Имя агента', aicfg_agent_ph: 'Ева', aicfg_agent_hint: 'Как агент представляется в звонке. Пусто — по языку: Ева / Ewa / Eva.',
    aicfg_mission: 'Миссия компании', aicfg_mission_hint: '1–3 предложения о цели и продукте компании. Если пусто — агент не задаёт вопрос о миссии.',
    aicfg_hours: 'Время звонков', aicfg_days: 'Дни звонков', aicfg_daynames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    aicfg_maxdur: 'Макс. длительность, мин', aicfg_maxdur_hint: 'Дольше — разговор прерывается.',
    aicfg_retry_after: 'Перезвон при неответе, мин', aicfg_retry_after_hint: 'Если не подняли трубку.',
    aicfg_retry_count: 'Попыток дозвона', aicfg_retry_count_hint: 'После стольких неответов звонки по этапу прекращаются; на следующем этапе счётчик заново.',
    aicfg_offhours: 'Если просят перезвонить в нерабочее время', aicfg_offhours_defer: 'Перенести на следующий рабочий день', aicfg_offhours_call: 'Звонить в нерабочее время', aicfg_offhours_hint: 'Как поступать, если удобное время вне окна звонков.',
    aicfg_save: 'Сохранить', aicfg_apply_all: 'Применить ко всем вакансиям', aicfg_apply_all_confirm: 'Перезаписать настройки ИИ-звонков во ВСЕХ ваших вакансиях текущими значениями?', aicfg_applied: 'Применено к {n} вакансиям',
    aicfg_err_days: 'Выберите хотя бы один день', aicfg_err_hours: 'Время «с» должно быть раньше «до»',
    wf_final_h: 'Финальный анализ', wf_final_hint: 'ИИ оценит кандидата по всем этапам, заявке и объявлению', wf_final_locked: 'Доступно после прохождения всех этапов',
    wf_final_run: 'Финальный анализ', wf_final_rerun: 'Пересчитать', wf_final_view: 'Смотреть', wf_final_running: 'Анализирую…',
    wf_final_title: 'Итоговый ИИ-анализ кандидата', wf_final_hire: 'Рекомендован', wf_final_reject: 'Лучше отклонить', wf_final_consider: 'Под вопросом',
    wf_final_fit: 'Соответствие должности', wf_final_strengths: 'Сильные стороны', wf_final_concerns: 'Риски и слабые места', wf_final_reco: 'Рекомендация', wf_final_at: 'Анализ выполнен',
    cand_col_ai: 'ИИ анализ', ai_tag_hire: 'Рекомендован', ai_tag_reject: 'Отклонить', ai_tag_consider: 'Под вопросом', ai_tag_pending: 'В процессе',
    vp_ai_note: 'Для звонков ИИ нужны подключённая интеграция звонков (Vapi) и телефон кандидата. Если интеграция не настроена, шаг тихо пропускается.',
    vp_kn_q: 'вопросов', vp_kn_add: 'Добавить тест знаний', vp_kn_setup: 'Настроить', vp_kn_blank: 'Тест',
    vp_kn_hint: 'Пустые тесты-болванки наполняются во вкладке «Проверка знаний» — и наоборот: созданные там тесты появляются в этом списке.',
    vp_kn_del_confirm: 'Удалить этот тест знаний?',
    vp_linkdays: 'Срок жизни ссылки на тест, дней', vp_linkdays_hint: 'Если кандидат не открыл тест за это время, ссылка истекает — её можно отправить повторно.',
    vp_order_h: 'Очерёдность тестов', vp_order_hint: 'Порядок, в котором кандидат получает тесты этой вакансии — в автоворонке и при отправке нескольких тестов сразу.',
    vp_crit_h: 'Критерии отбора',
    vp_crit_hint: 'Отметьте, что критически важно для этой должности. Если критичный шаг не пройден, кандидат дальше по воронке не идёт: автоворонка останавливается, решение — отказ. Некритичный шаг остаётся в общей картине, но процесс не стопорит.',
    vp_crit_on: 'Критично: дальше не пропускаем', vp_crit_off: 'Не критично: процесс продолжается',
    vp_crit_result: 'Продуктивность — фундамент методики: прошлые результаты человека не изменить. Если тест показывает не того, кто нужен (Виннер или Дуер под задачу должности), пропускать кандидата дальше нет смысла.',
    vp_crit_references: 'Референсы подтверждают факты из прошлого. Негативные или уклончивые отзывы бывших руководителей — серьёзный сигнал, что заявленных результатов не было.',
    vp_crit_tools: 'Один из важнейших тестов: личностные качества должны соответствовать требованиям должности из заявки. Быстро изменить качества нельзя — несоответствие лучше не пропускать.',
    vp_crit_motivation: 'Уровень мотивации можно поднять — это работа с вовлечённостью. Отсеивайте по мотивации только там, где сразу нужен человек с уровнем убеждения или долга.',
    vp_crit_knowledge: 'Знаниям можно обучить, поэтому обычно это не причина для отказа. Но есть должности, где знания обязательны с первого дня — решайте по конкретному случаю.',
    funnel_title: 'Воронка кандидатов', board_empty: 'По этой вакансии пока нет кандидатов. Опубликуйте анкету и пригласите кандидатов.',
    kanban_hint: 'Перетаскивайте карточки между колонками. Кандидаты также перемещаются автоматически по мере прохождения этапов.',
    cand_found: 'Найдено', cand_passed_tests: 'Прошли тесты', cand_hired: 'Наняты',
    kpi7_cands: 'Кандидатов', kpi7_started: 'Приступило к рекрутации', kpi7_result: 'Прошли Резалт', kpi7_tools: 'Прошли Тулс', kpi7_motiv: 'Проверены на мотивацию', kpi7_knowledge: 'Проверены на знания', kpi7_hired: 'Наняты',
    kn_upload_img: 'Загрузить картинку', kn_upload_vid: 'Загрузить видео', kn_uploading: 'Загрузка…', kn_remove: 'Убрать',
    vac_apply_open: 'Ссылка на анкету', vac_publish_done: 'Анкета опубликована',
    wf_optional_h: 'Дополнительные оценки', wf_send_opt: 'Отправить тест',
    cand_title: 'Кандидаты', cand_search: 'Поиск по имени, email, телефону…', cand_empty: 'Кандидатов пока нет. Они появятся здесь после откликов на объявления.',
    cand_add: 'Добавить кандидата',
    cand_import_cv: 'Импорт CV', cand_cv_parsing: 'ИИ читает резюме…', cand_cv_done: 'Импортировано: {n}', cand_cv_fail: 'Не распознано: {n}', cand_cv_none: 'Не удалось распознать ни одного файла', cand_cv_hint: 'PDF или фото резюме — ИИ распознает и создаст карточки',
    kn_pass_lbl: 'порог прохождения',
    cand_col_name: 'Кандидат', cand_col_vac: 'Вакансия', cand_col_stage: 'Этап', cand_col_tests: 'Тестов пройдено', cand_col_date: 'Добавлен',
    cand_all_vac: 'Все вакансии', cand_info: 'Данные кандидата', pipe_now: 'Сейчас здесь',
    req_level: 'Уровень должности', lvl_staff: 'Рядовой сотрудник', lvl_lead: 'Руководитель',
    pos_recognized: 'Распознана должность', traits_rec_for: 'Для должности', traits_rec_lead_phrase: 'Для руководителя направления',
    traits_rec_advise: 'методика рекомендует обратить внимание на качества', traits_apply: 'Отметить в списке',
  },
  pl: {
    req_new: 'Utwórz wniosek', req_empty: 'Brak wniosków. Utwórz pierwszy lub wyślij link przełożonemu.',
    req_st_draft: 'Szkic', req_st_submitted: 'Do zatwierdzenia', req_st_approved: 'Zatwierdzony', req_st_rejected: 'Odrzucony',
    req_save: 'Zapisz', req_approve: 'Zatwierdź i utwórz wakat', req_reject: 'Odrzuć', req_delete: 'Usuń wniosek',
    req_share: 'Link dla przełożonego', req_share_hint: 'Wyślij ten link przełożonemu, aby sam wypełnił wniosek.',
    req_analysis: 'Analiza AI', req_position: 'Stanowisko', req_open: 'Otwórz', req_created_vac: 'Wakat utworzony',
    req_new_title: 'Nowy wniosek o dobór', req_edit_title: 'Wniosek o dobór',
    req_lang: 'Język wakatu i testowania kandydata (podaj rzeczywisty język, którym kandydat będzie się posługiwał przez większość czasu pracy — krytyczny dla stanowiska)',
    req_by_manager: 'Od przełożonego', req_has_vac: 'Wakat utworzony',
    vac_empty: 'Brak zatwierdzonych wakatów. Zatwierdź wniosek w zakładce „Wnioski”.',
    vac_config: 'Konfiguruj', vac_open: 'Otwórz', vac_ad: 'Ogłoszenie o pracę',
    vac_ad_gen: 'Generuj AI', vac_ad_fallback: 'AI niedostępne — pokazano szablon', vac_ad_manual: 'Lub edytuj ręcznie:', vac_ad_target: 'Kogo szukamy',
    vac_target_auto: 'Automatycznie', vac_target_performer: 'Winner', vac_target_executor: 'Doer',
    vac_target_boss_hint: 'Stanowisko kierownicze — zawsze szukamy Winnera',
    vac_stages: 'Etapy selekcji', vac_knowledge: 'Sprawdzenie wiedzy', vac_motivation: 'Ocena motywacji',
    vac_publish: 'Opublikuj (utwórz ankietę)', vac_published: 'Opublikowany', vac_apply_link: 'Link do ankiety',
    vac_stat_cands: 'Kandydaci', vac_stat_done: 'Ukończone', vac_stat_wait: 'Oczekuje', vac_draft: 'Szkic', vac_new_card: 'Nowy wakat',
    vac_save: 'Zapisz ustawienia',
    kn_builder: 'Kreator sprawdzenia wiedzy', kn_add: 'Dodaj pytanie', kn_q: 'Treść pytania',
    kn_opt: 'Wariant odpowiedzi', kn_add_opt: 'Dodaj wariant', kn_correct: 'poprawny', kn_type: 'Typ',
    kn_single: 'Jedna odpowiedź', kn_multi: 'Kilka odpowiedzi', kn_image: 'Obraz (URL)', kn_video: 'Wideo (URL)',
    kn_pass: 'Próg zaliczenia, %', kn_save: 'Zapisz test', kn_empty: 'Brak pytań. Dodaj pierwsze.',
    kn_new_test: 'Nowy test', kn_name: 'Nazwa testu', kn_name_ph: 'np. Znajomość asortymentu', kn_del_test: 'Usuń test',
    kn_ai: 'Utwórz test AI', kn_del_confirm: 'Czy na pewno chcesz usunąć test',
    jp_title: 'Portale pracy', jp_on: 'Połączono', jp_off: 'Nie połączono', jp_connect: 'Połącz', jp_edit: 'Zmień dostępy', jp_disconnect: 'Odłącz', jp_login: 'Login konta pracodawcy', jp_pass: 'Hasło', jp_connected: 'Portal połączony',
    jp_intro: 'Trzy sposoby: 1) agregatory (Indeed, Google for Jobs, Adzuna, Trovit) same pobierają Twoje oferty z publicznego feeda — podaj im link poniżej; 2) portale z API (Jooble) — wklej klucz, działa od razu; 3) pozostałe (pracuj.pl, OLX i in.) — logowanie do konta lub dostęp partnerski.',
    jp_by_feed: 'przez feed', jp_by_login: 'przez login', jp_copy_feed: 'Kopiuj feed', jp_test: 'Sprawdź', jp_jobs_found: 'ofert w API', jp_feed_ready: 'Feed gotowy',
    jp_feed_h: 'Feed Twoich ofert (JobPosting XML)', jp_feed_hint: 'Opublikowane oferty w standardzie akceptowanym przez agregatory. Dodaj ten link w koncie dowolnego portalu-agregatora — oferty zaindeksują się automatycznie.', jp_open_feed: 'Otwórz',
    adp_tab_editor: 'Ogłoszenie', adp_tab_list: 'Ogłoszenia', adp_portal: 'Portal', adp_title: 'Nazwa', adp_url: 'Link do publikacji', adp_add: 'Dodaj publikację', adp_link: 'Link z tagiem', adp_resp: 'Zgłoszenia', adp_motiv: 'Motywacja', adp_knowl: 'Wiedza', adp_conv: 'Konwersja', adp_empty: 'Brak publikacji. Dodaj portal, gdzie opublikowano ogłoszenie.',
    adp_hint: 'Dla każdej publikacji tworzony jest osobny link do ankiety z tagiem — udostępniaj go na danym portalu, a zgłoszenia będą liczone dla każdej publikacji osobno.',
    wf_open: 'Proces rekrutacji', wf_title: 'Proces rekrutacji kandydata', wf_pass: 'Zaliczył', wf_fail: 'Nie zaliczył', wf_reset: 'Reset',
    wf_skip: 'Pomiń ten krok', wf_skipped: 'Pominięty', wf_unskip: 'Przywróć krok do procesu',
    wf_resend: 'Wyślij ponownie', wf_resent: 'Link wysłany ponownie',
    wf_conduct: 'Przeprowadź', dec_hire: 'Zatrudnij', dec_interview: 'Zaproś na rozmowę', dec_change: 'Zmień',
    v_bad_phone: 'Podaj poprawny telefon (9–15 cyfr)', v_bad_age: 'Wiek — dwie cyfry, od 16 do 79',
    iv_title: 'Rozmowa kwalifikacyjna', iv_done: 'Przeprowadzona', iv_planned: 'Zaplanowana', iv_fill: 'Dodaj szczegóły', iv_created: 'Karta rozmowy utworzona',
    iv_date: 'Data i godzina', iv_people: 'Uczestnicy rozmowy', iv_people_ph: 'kierownik, dyrektor…', iv_impr: 'Ogólne wrażenia o kandydacie', iv_scores: 'Wskaźniki oceny', iv_scores_ph: 'np.: komunikacja 4/5, wiedza 3/5…', iv_questions: 'Pytania dot. kandydata', iv_notes: 'Komentarz prywatny',
    req_unlock: 'Edytuj wniosek',
    req_f_active: 'Nowe (bez zatwierdzonych)', req_f_all: 'Wszystkie statusy', req_f_all_pos: 'Wszystkie stanowiska',
    wf_motiv_guide: 'Jak oceniać motywację (skala i zasady)',
    wf_motiv_scale_hint: 'Nie wyciągaj wniosków z jednej odpowiedzi — oceń całość: odpowiedzi, doświadczenie, wynik „Tools”. Pytania o pensję są normalne; patrz, czy kandydata interesuje coś POZA pieniędzmi (produkt, klienci, narzędzia — strumień wychodzący). Piękne słowa o przyszłości zawracaj do przeszłości i zapisuj, kto może potwierdzić fakty.',
    wf_motiv_q_hint: 'Jak pytać i na co patrzeć',
    wf_motiv_ans_ph: 'Zapisz odpowiedź kandydata i swoje obserwacje…',
    wf_motiv_mark: 'O czym mówi odpowiedź:',
    wf_mk_out: 'O pracy i produkcie', wf_mk_mix: 'Mieszane', wf_mk_in: 'O pieniądzach i korzyściach',
    wf_mk_out_t: 'Strumień wychodzący: kandydata interesują produkt, klienci, narzędzia', wf_mk_in_t: 'Strumień przychodzący: kandydata interesuje tylko własna korzyść',
    wf_motiv_suggest: 'Wg ocen wygląda na',
    ref_intro_h: 'Czym są referencje i jak je zdobyć',
    ref_intro: 'Sprawdzanie referencji to fundament metodyki: fakty z przeszłości można zweryfikować, a obietnice o przyszłości — nie. Zadzwoń do byłego przełożonego kandydata na kontakty, które kandydat sam zostawił. Przedstaw się, powiedz, że kandydat wskazał rozmówcę jako osobę mogącą potwierdzić jego wyniki, i poproś o 5–10 minut. Zadawaj pytania po kolei i zapisuj wypowiedzi dosłownie. Najważniejsza obserwacja: przy wspomnieniu produktywnego pracownika nastrój rozmówcy wyraźnie się poprawia; oschłość, pauzy i wymijające odpowiedzi to znak ostrzegawczy.',
    wf_suggested: 'Rekomendacja AI', wf_decision: 'Decyzja końcowa', wf_hired: 'Do zatrudnienia', wf_rejected: 'Odmowa',
    wf_inprogress: 'W trakcie', wf_pending: 'Oczekuje', wf_no_test: 'Test nie wysłany', wf_send_knowledge: 'Wyślij sprawdzenie wiedzy',
    wf_motiv_level: 'Poziom motywacji', wf_motiv_notes: 'Notatki z rozmowy', wf_motiv_save: 'Zapisz motywację',
    wf_ref_save: 'Zapisz referencje', wf_open_test: 'Otwórz test', wf_see_res: 'Zobacz wynik', wf_set_decision: 'Zapisz decyzję',
    common_gen: 'Generowanie…', common_saved: 'Zapisano', common_copy: 'Kopiuj', common_close: 'Zamknij',
    req_share_company: 'Udostępnij link', req_share_company_hint: 'Jeden uniwersalny link firmy. Każdy przełożony może przez niego utworzyć swój wniosek — wniosków można tworzyć dowolnie wiele.',
    req_page_hint: 'Wniosek to fundament rekrutacji według metodyki: Ty lub przełożony opisujecie stanowisko, jego produkt i wymagania wobec kandydata. Po zatwierdzeniu wniosek staje się wakatem z ustawionym procesem rekrutacji. Utwórz wniosek samodzielnie lub wyślij przełożonemu link — wypełni go bez dostępu do portalu.',
    vac_quick_create: 'Utwórz wakat', vac_quick_name: 'Nazwa wakatu (stanowiska)',
    vac_quick_hint: 'Aby skutecznie utworzyć wakat, lepiej wypełnić go przez wniosek — od razu zrozumiesz, kogo dokładnie potrzebujesz.',
    vac_quick_go: 'Utwórz', vac_quick_via_req: 'Wypełnij przez wniosek', vac_quick_need_name: 'Podaj nazwę wakatu',
    vac_back: '← Do wakatów', vac_tab_dashboard: 'Pulpit', vac_tab_kanban: 'Kanban', vac_tab_ad: 'Ogłoszenie', vac_tab_knowledge: 'Sprawdzenie wiedzy',
    vac_tab_req: 'Wniosek', vac_tab_anketas: 'Ankiety', vac_tab_cands: 'Kandydaci', vac_tab_process: 'Proces rekrutacji',
    vp_auto: 'Autolejek', vp_auto_hint: 'Portal sam prowadzi kandydata przez kroki: gdy kandydat trafia do lejka, automatycznie dostaje pierwszy test, a po zaliczeniu — kolejny. Kroki ręczne (referencje, motywacja) pozostają po stronie rekrutera i nie blokują automatu.',
    vp_stages_h: 'Kroki procesu', vp_stages_hint: 'Włączaj i wyłączaj kroki pod konkretne stanowisko. Wyłączony krok znika z procesu kandydata i kanbanu i nie wpływa na decyzję.',
    vp_st_result: 'Produktywność (Result)', vp_st_references: 'Referencje', vp_st_tools: 'Osobowość (Tools)',
    vp_st_logic: 'Test logiki (Logic)', vp_st_sales: 'Test sprzedaży (Sales)', vp_st_motivation: 'Poziom motywacji', vp_st_knowledge: 'Sprawdzenie wiedzy',
    vp_ref_hint: 'Przeprowadza rekruter na podstawie kontaktów z „Result”',
    vp_ai_first: 'Telefon AI: pierwszy kontakt', vp_ai_afterResult: 'Telefon AI po „Result”', vp_ai_afterTools: 'Telefon AI po „Tools”', vp_ai_motivation: 'Ocena motywacji w rozmowie z AI',
    vp_ai_references: 'Zbieranie referencji przez AI', vp_ai_references_hint: 'AI samo dzwoni do przełożonych z „Result” i zbiera referencję',
    refai_btn: 'Telefon AI', refai_calling: 'AI dzwoni…', refai_hint: 'AI zadzwoni do przełożonego i zbierze referencję', refai_started: 'AI dzwoni do przełożonego — referencja pojawi się po rozmowie', refai_done: 'Referencja zebrana przez AI', refai_err: 'Nie udało się uruchomić telefonu AI',
    aicalls_btn: 'Rozmowy AI', aicalls_title: 'Rozmowy AI', aicalls_refresh: 'Odśwież', aicalls_tab_active: 'Rozmowy', aicalls_tab_history: 'Historia',
    aicalls_no_active: 'Brak aktywnych rozmów', aicalls_no_history: 'Brak zakończonych rozmów', aicalls_transcript: 'Transkrypcja', aicalls_no_tr: 'Transkrypcja niedostępna',
    aicalls_no_rec: 'Nagranie niedostępne', aicalls_attempt: 'Próba', aicalls_cont: 'oddzwonienie', aicalls_calls: 'rozmów', aicalls_answers: 'Zebrane odpowiedzi', aicalls_remaining: 'pozostało',
    aic_st_calling: 'Trwa rozmowa', aic_st_analyzing: 'Analiza', aic_st_continuing: 'Oddzwanianie', aic_st_done: 'Zakończono', aic_st_failed: 'Nieudane',
    wf_see_ai: 'Zobacz wynik (rozmowa AI)', aic_result_title: 'Wynik rozmowy AI',
    aicfg_btn: 'Ustawienia rozmów AI', aicfg_title: 'Ustawienia rozmów AI', aicfg_own: 'własne ustawienia', aicfg_inherited: 'odziedziczone',
    aicfg_agent: 'Imię agenta', aicfg_agent_ph: 'Ewa', aicfg_agent_hint: 'Jak agent się przedstawia. Puste — wg języka: Ева / Ewa / Eva.',
    aicfg_mission: 'Misja firmy', aicfg_mission_hint: '1–3 zdania o celu i produkcie firmy. Jeśli puste — agent nie pyta o misję.',
    aicfg_hours: 'Godziny rozmów', aicfg_days: 'Dni rozmów', aicfg_daynames: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
    aicfg_maxdur: 'Maks. długość, min', aicfg_maxdur_hint: 'Dłużej — rozmowa się przerywa.',
    aicfg_retry_after: 'Oddzwonienie po nieodebraniu, min', aicfg_retry_after_hint: 'Jeśli nie odebrano.',
    aicfg_retry_count: 'Prób połączenia', aicfg_retry_count_hint: 'Po tylu nieodebraniach rozmowy na etapie ustają; na kolejnym etapie licznik od nowa.',
    aicfg_offhours: 'Gdy proszą o telefon poza godzinami', aicfg_offhours_defer: 'Przenieś na następny dzień roboczy', aicfg_offhours_call: 'Dzwoń poza godzinami', aicfg_offhours_hint: 'Co robić, gdy dogodny czas jest poza oknem rozmów.',
    aicfg_save: 'Zapisz', aicfg_apply_all: 'Zastosuj do wszystkich wakatów', aicfg_apply_all_confirm: 'Nadpisać ustawienia rozmów AI we WSZYSTKICH wakatach bieżącymi wartościami?', aicfg_applied: 'Zastosowano do {n} wakatów',
    aicfg_err_days: 'Wybierz co najmniej jeden dzień', aicfg_err_hours: 'Godzina „od” musi być wcześniejsza niż „do”',
    wf_final_h: 'Analiza końcowa', wf_final_hint: 'AI oceni kandydata na podstawie wszystkich etapów, zapotrzebowania i ogłoszenia', wf_final_locked: 'Dostępne po przejściu wszystkich etapów',
    wf_final_run: 'Analiza końcowa', wf_final_rerun: 'Przelicz', wf_final_view: 'Zobacz', wf_final_running: 'Analizuję…',
    wf_final_title: 'Końcowa analiza AI kandydata', wf_final_hire: 'Rekomendowany', wf_final_reject: 'Lepiej odrzucić', wf_final_consider: 'Do rozważenia',
    wf_final_fit: 'Dopasowanie do stanowiska', wf_final_strengths: 'Mocne strony', wf_final_concerns: 'Ryzyka i słabe punkty', wf_final_reco: 'Rekomendacja', wf_final_at: 'Analiza wykonana',
    cand_col_ai: 'Analiza AI', ai_tag_hire: 'Rekomendowany', ai_tag_reject: 'Odrzucić', ai_tag_consider: 'Do rozważenia', ai_tag_pending: 'W trakcie',
    vp_ai_note: 'Telefony AI wymagają podłączonej integracji połączeń (Vapi) i numeru telefonu kandydata. Bez integracji krok jest pomijany.',
    vp_kn_q: 'pytań', vp_kn_add: 'Dodaj test wiedzy', vp_kn_setup: 'Konfiguruj', vp_kn_blank: 'Test',
    vp_kn_hint: 'Puste testy uzupełnia się w zakładce „Sprawdzenie wiedzy” — i odwrotnie: testy utworzone tam pojawiają się na tej liście.',
    vp_kn_del_confirm: 'Usunąć ten test wiedzy?',
    vp_linkdays: 'Czas życia linku do testu, dni', vp_linkdays_hint: 'Jeśli kandydat nie otworzy testu w tym czasie, link wygasa — można wysłać go ponownie.',
    vp_order_h: 'Kolejność testów', vp_order_hint: 'Kolejność, w jakiej kandydat otrzymuje testy tego wakatu — w autolejku i przy wysyłce kilku testów naraz.',
    vp_crit_h: 'Kryteria selekcji',
    vp_crit_hint: 'Zaznacz, co jest krytycznie ważne dla tego stanowiska. Jeśli krytyczny krok nie jest zaliczony, kandydat nie idzie dalej: autolejek się zatrzymuje, decyzja — odmowa. Krok niekrytyczny pozostaje w ocenie, ale nie blokuje procesu.',
    vp_crit_on: 'Krytyczne: dalej nie przepuszczamy', vp_crit_off: 'Niekrytyczne: proces trwa',
    vp_crit_result: 'Produktywność to fundament metodyki: przeszłych wyników nie da się zmienić. Jeśli test pokazuje nie tego, kogo potrzeba (Winner lub Doer pod zadanie stanowiska), nie ma sensu przepuszczać kandydata dalej.',
    vp_crit_references: 'Referencje potwierdzają fakty z przeszłości. Negatywne lub wymijające opinie byłych przełożonych to poważny sygnał, że deklarowanych wyników nie było.',
    vp_crit_tools: 'Jeden z najważniejszych testów: cechy osobowości muszą odpowiadać wymaganiom stanowiska z wniosku. Cech nie da się szybko zmienić — niedopasowania lepiej nie przepuszczać.',
    vp_crit_motivation: 'Poziom motywacji można podnieść — to praca z zaangażowaniem. Odsiewaj po motywacji tylko tam, gdzie od razu potrzebny jest poziom przekonania lub obowiązku.',
    vp_crit_knowledge: 'Wiedzy można nauczyć, więc zwykle nie jest to powód odmowy. Są jednak stanowiska, gdzie wiedza jest obowiązkowa od pierwszego dnia — decyduj indywidualnie.',
    funnel_title: 'Lejek kandydatów', board_empty: 'Brak kandydatów na ten wakat. Opublikuj ankietę i zaproś kandydatów.',
    kanban_hint: 'Przeciągaj karty między kolumnami. Kandydaci przesuwają się też automatycznie w miarę przechodzenia etapów.',
    cand_found: 'Znalezieni', cand_passed_tests: 'Zaliczyli testy', cand_hired: 'Zatrudnieni',
    kpi7_cands: 'Kandydatów', kpi7_started: 'Rozpoczęło rekrutację', kpi7_result: 'Zaliczyli Result', kpi7_tools: 'Zaliczyli Tools', kpi7_motiv: 'Sprawdzeni pod kątem motywacji', kpi7_knowledge: 'Sprawdzeni z wiedzy', kpi7_hired: 'Zatrudnieni',
    kn_upload_img: 'Wgraj obraz', kn_upload_vid: 'Wgraj wideo', kn_uploading: 'Wgrywanie…', kn_remove: 'Usuń',
    vac_apply_open: 'Link do ankiety', vac_publish_done: 'Ankieta opublikowana',
    wf_optional_h: 'Dodatkowe oceny', wf_send_opt: 'Wyślij test',
    cand_title: 'Kandydaci', cand_search: 'Szukaj po imieniu, e-mailu, telefonie…', cand_empty: 'Brak kandydatów. Pojawią się tu po zgłoszeniach z ogłoszeń.',
    cand_add: 'Dodaj kandydata',
    cand_import_cv: 'Import CV', cand_cv_parsing: 'AI czyta CV…', cand_cv_done: 'Zaimportowano: {n}', cand_cv_fail: 'Nierozpoznane: {n}', cand_cv_none: 'Nie udało się rozpoznać żadnego pliku', cand_cv_hint: 'PDF lub zdjęcie CV — AI rozpozna i utworzy karty',
    kn_pass_lbl: 'próg zaliczenia',
    cand_col_name: 'Kandydat', cand_col_vac: 'Wakat', cand_col_stage: 'Etap', cand_col_tests: 'Testy zaliczone', cand_col_date: 'Dodano',
    cand_all_vac: 'Wszystkie wakaty', cand_info: 'Dane kandydata', pipe_now: 'Teraz tutaj',
    req_level: 'Poziom stanowiska', lvl_staff: 'Szeregowy pracownik', lvl_lead: 'Kierownik',
    pos_recognized: 'Rozpoznane stanowisko', traits_rec_for: 'Dla stanowiska', traits_rec_lead_phrase: 'Dla kierownika działu',
    traits_rec_advise: 'metodyka zaleca zwrócić uwagę na cechy', traits_apply: 'Zaznacz na liście',
  },
  en: {
    req_new: 'Create requisition', req_empty: 'No requisitions yet. Create one or send a link to a manager.',
    req_st_draft: 'Draft', req_st_submitted: 'Pending review', req_st_approved: 'Approved', req_st_rejected: 'Rejected',
    req_save: 'Save', req_approve: 'Approve & create vacancy', req_reject: 'Reject', req_delete: 'Delete requisition',
    req_share: 'Manager link', req_share_hint: 'Send this link to a manager so they can fill in the requisition.',
    req_analysis: 'AI analysis', req_position: 'Position', req_open: 'Open', req_created_vac: 'Vacancy created',
    req_new_title: 'New hiring requisition', req_edit_title: 'Hiring requisition',
    req_lang: 'Vacancy and candidate testing language (state the real language the candidate will use most of the working time — critical for the role)',
    req_by_manager: 'From manager', req_has_vac: 'Vacancy created',
    vac_empty: 'No approved vacancies yet. Approve a requisition in the “Requisitions” tab.',
    vac_config: 'Configure', vac_open: 'Open', vac_ad: 'Job ad',
    vac_ad_gen: 'Generate with AI', vac_ad_fallback: 'AI unavailable — showing basic template', vac_ad_manual: 'Or edit manually:', vac_ad_target: 'Who we seek',
    vac_target_auto: 'Auto-detect', vac_target_performer: 'Winner', vac_target_executor: 'Doer',
    vac_target_boss_hint: 'Leadership role — we always look for a Winner',
    vac_stages: 'Selection stages', vac_knowledge: 'Knowledge check', vac_motivation: 'Motivation assessment',
    vac_publish: 'Publish (create form)', vac_published: 'Published', vac_apply_link: 'Application form link',
    vac_stat_cands: 'Candidates', vac_stat_done: 'Completed', vac_stat_wait: 'Pending', vac_draft: 'Draft', vac_new_card: 'New vacancy',
    vac_save: 'Save settings',
    kn_builder: 'Knowledge test builder', kn_add: 'Add question', kn_q: 'Question text',
    kn_opt: 'Answer option', kn_add_opt: 'Add option', kn_correct: 'correct', kn_type: 'Type',
    kn_single: 'Single answer', kn_multi: 'Multiple answers', kn_image: 'Image (URL)', kn_video: 'Video (URL)',
    kn_pass: 'Pass threshold, %', kn_save: 'Save test', kn_empty: 'No questions. Add the first one.',
    kn_new_test: 'New test', kn_name: 'Test name', kn_name_ph: 'e.g. Product knowledge', kn_del_test: 'Delete test',
    kn_ai: 'Generate test with AI', kn_del_confirm: 'Do you really want to delete the test',
    jp_title: 'Job boards', jp_on: 'Connected', jp_off: 'Not connected', jp_connect: 'Connect', jp_edit: 'Edit credentials', jp_disconnect: 'Disconnect', jp_login: 'Employer account login', jp_pass: 'Password', jp_connected: 'Portal connected',
    jp_intro: 'Three ways: 1) aggregators (Indeed, Google for Jobs, Adzuna, Trovit) pull your jobs from a public feed — just give them the link below; 2) boards with an API (Jooble) — paste the key, works instantly; 3) the rest (pracuj.pl, OLX, etc.) — account login or partner access.',
    jp_by_feed: 'via feed', jp_by_login: 'via login', jp_copy_feed: 'Copy feed', jp_test: 'Test', jp_jobs_found: 'jobs in API', jp_feed_ready: 'Feed ready',
    jp_feed_h: 'Your jobs feed (JobPosting XML)', jp_feed_hint: 'Your published jobs in the standard aggregators accept. Add this link in any aggregator’s dashboard — jobs get indexed automatically.', jp_open_feed: 'Open',
    adp_tab_editor: 'Job ad', adp_tab_list: 'Placements', adp_portal: 'Portal', adp_title: 'Title', adp_url: 'Publication link', adp_add: 'Add placement', adp_link: 'Tagged link', adp_resp: 'Applications', adp_motiv: 'Motivation', adp_knowl: 'Knowledge', adp_conv: 'Conversion', adp_empty: 'No placements yet. Add the portal where the ad is published.',
    adp_hint: 'Each placement gets its own tagged application link — share it on that portal, and applications are counted per placement.',
    wf_open: 'Hiring process', wf_title: 'Candidate hiring process', wf_pass: 'Passed', wf_fail: 'Failed', wf_reset: 'Reset',
    wf_skip: 'Skip this step', wf_skipped: 'Skipped', wf_unskip: 'Bring the step back',
    wf_resend: 'Resend', wf_resent: 'Link resent',
    wf_conduct: 'Conduct', dec_hire: 'Hire', dec_interview: 'Invite to interview', dec_change: 'Change',
    v_bad_phone: 'Enter a valid phone (9–15 digits)', v_bad_age: 'Age — two digits, 16 to 79',
    iv_title: 'Interview', iv_done: 'Conducted', iv_planned: 'Scheduled', iv_fill: 'Add details', iv_created: 'Interview card created',
    iv_date: 'Date & time', iv_people: 'Interview participants', iv_people_ph: 'manager, director…', iv_impr: 'Overall impressions of the candidate', iv_scores: 'Assessment scores', iv_scores_ph: 'e.g.: communication 4/5, expertise 3/5…', iv_questions: 'Questions about the candidate', iv_notes: 'Private comment',
    req_unlock: 'Edit requisition',
    req_f_active: 'New (approved hidden)', req_f_all: 'All statuses', req_f_all_pos: 'All positions',
    wf_motiv_guide: 'How to assess motivation (scale and rules)',
    wf_motiv_scale_hint: 'Never judge by one answer — assess the whole picture: answers, experience, the “Tools” result. Salary questions are normal; watch whether the candidate cares about anything BESIDES money (product, clients, tools — the outflow). Turn fine words about the future back to the past and note who can confirm the facts.',
    wf_motiv_q_hint: 'How to ask and what to watch for',
    wf_motiv_ans_ph: 'Write down the candidate’s answer and your observations…',
    wf_motiv_mark: 'What the answer points to:',
    wf_mk_out: 'The work and product', wf_mk_mix: 'Mixed', wf_mk_in: 'Money and benefits',
    wf_mk_out_t: 'Outflow: the candidate cares about the product, clients, tools', wf_mk_in_t: 'Inflow: the candidate only cares about personal gain',
    wf_motiv_suggest: 'Based on the marks, looks like',
    ref_intro_h: 'What a reference is and how to get one',
    ref_intro: 'Reference checks are the foundation of the method: facts from the past can be verified, promises about the future cannot. Call the candidate’s former supervisor using the contacts the candidate provided. Introduce yourself, say the candidate named them as someone who can confirm their results, and ask for 5–10 minutes. Go through the questions in order and write answers down verbatim. The key observation: recalling a productive employee visibly lifts the referee’s mood; dryness, pauses and evasiveness are a warning sign.',
    wf_suggested: 'AI recommendation', wf_decision: 'Final decision', wf_hired: 'Proceed to employment', wf_rejected: 'Reject',
    wf_inprogress: 'In progress', wf_pending: 'Pending', wf_no_test: 'Test not sent', wf_send_knowledge: 'Send knowledge check',
    wf_motiv_level: 'Motivation level', wf_motiv_notes: 'Interview notes', wf_motiv_save: 'Save motivation',
    wf_ref_save: 'Save reference', wf_open_test: 'Open test', wf_see_res: 'View result', wf_set_decision: 'Save decision',
    common_gen: 'Generating…', common_saved: 'Saved', common_copy: 'Copy', common_close: 'Close',
    req_share_company: 'Share link', req_share_company_hint: 'One universal company link. Any manager can create their own requisition through it — create as many requisitions as you like.',
    req_page_hint: 'The requisition is the foundation of methodical hiring: you or the manager describe the position, its product and candidate requirements. Once approved, it becomes a vacancy with a configured hiring process. Create one yourself or send the manager a link — they can fill it in without portal access.',
    vac_quick_create: 'Create vacancy', vac_quick_name: 'Vacancy (position) name',
    vac_quick_hint: 'To create a vacancy effectively, it’s better to fill it in via a requisition — you’ll immediately understand exactly who you need.',
    vac_quick_go: 'Create', vac_quick_via_req: 'Fill in via requisition', vac_quick_need_name: 'Enter the vacancy name',
    vac_back: '← To vacancies', vac_tab_dashboard: 'Dashboard', vac_tab_kanban: 'Kanban', vac_tab_ad: 'Job ad', vac_tab_knowledge: 'Knowledge check',
    vac_tab_req: 'Requisition', vac_tab_anketas: 'Forms', vac_tab_cands: 'Candidates', vac_tab_process: 'Hiring process',
    vp_auto: 'Auto-funnel', vp_auto_hint: 'The portal walks the candidate through the steps on its own: as soon as a candidate enters the funnel, the first test is sent automatically, and the next one goes out after each pass. Manual steps (references, motivation) stay with the recruiter and don’t block the automation.',
    vp_stages_h: 'Process steps', vp_stages_hint: 'Turn steps on and off for this specific position. A disabled step disappears from the candidate’s process and the kanban and doesn’t affect the final decision.',
    vp_st_result: 'Productivity (Result)', vp_st_references: 'References', vp_st_tools: 'Personality (Tools)',
    vp_st_logic: 'Logic test (Logic)', vp_st_sales: 'Sales test (Sales)', vp_st_motivation: 'Motivation level', vp_st_knowledge: 'Knowledge check',
    vp_ref_hint: 'Done by the recruiter using manager contacts from “Result”',
    vp_ai_first: 'AI call: first contact', vp_ai_afterResult: 'AI call after “Result”', vp_ai_afterTools: 'AI call after “Tools”', vp_ai_motivation: 'Motivation assessed in an AI call',
    vp_ai_references: 'Collect references with AI', vp_ai_references_hint: 'AI calls the managers from “Result” itself and gathers the reference',
    refai_btn: 'AI call', refai_calling: 'AI is calling…', refai_hint: 'AI will call the manager and collect the reference', refai_started: 'AI is calling the manager — the reference will appear after the call', refai_done: 'Reference collected by AI', refai_err: 'Could not start the AI call',
    aicalls_btn: 'AI calls', aicalls_title: 'AI calls', aicalls_refresh: 'Refresh', aicalls_tab_active: 'Calls', aicalls_tab_history: 'History',
    aicalls_no_active: 'No active calls', aicalls_no_history: 'No completed calls yet', aicalls_transcript: 'Transcript', aicalls_no_tr: 'Transcript not available yet',
    aicalls_no_rec: 'Recording unavailable', aicalls_attempt: 'Attempt', aicalls_cont: 'follow-up', aicalls_calls: 'calls', aicalls_answers: 'Collected answers', aicalls_remaining: 'remaining',
    aic_st_calling: 'Calling', aic_st_analyzing: 'Analyzing', aic_st_continuing: 'Calling back', aic_st_done: 'Completed', aic_st_failed: 'Failed',
    wf_see_ai: 'View result (AI call)', aic_result_title: 'AI call result',
    aicfg_btn: 'AI call settings', aicfg_title: 'AI call settings', aicfg_own: 'own settings', aicfg_inherited: 'inherited',
    aicfg_agent: 'Agent name', aicfg_agent_ph: 'Eva', aicfg_agent_hint: 'How the agent introduces itself. Empty — by language: Ева / Ewa / Eva.',
    aicfg_mission: 'Company mission', aicfg_mission_hint: '1–3 sentences about the company’s purpose and product. If empty — the agent skips the mission question.',
    aicfg_hours: 'Call hours', aicfg_days: 'Call days', aicfg_daynames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    aicfg_maxdur: 'Max duration, min', aicfg_maxdur_hint: 'Longer — the call is cut off.',
    aicfg_retry_after: 'Retry after no answer, min', aicfg_retry_after_hint: 'If the call was not picked up.',
    aicfg_retry_count: 'Dial attempts', aicfg_retry_count_hint: 'After this many no-answers, calls for the stage stop; the next stage restarts the counter.',
    aicfg_offhours: 'If asked to call back off-hours', aicfg_offhours_defer: 'Defer to next working day', aicfg_offhours_call: 'Call off-hours', aicfg_offhours_hint: 'What to do when the convenient time is outside the call window.',
    aicfg_save: 'Save', aicfg_apply_all: 'Apply to all vacancies', aicfg_apply_all_confirm: 'Overwrite AI call settings across ALL your vacancies with the current values?', aicfg_applied: 'Applied to {n} vacancies',
    aicfg_err_days: 'Select at least one day', aicfg_err_hours: 'Start time must be earlier than end time',
    wf_final_h: 'Final analysis', wf_final_hint: 'AI will assess the candidate across all stages, the requisition and the ad', wf_final_locked: 'Available after all stages are completed',
    wf_final_run: 'Final analysis', wf_final_rerun: 'Recalculate', wf_final_view: 'View', wf_final_running: 'Analyzing…',
    wf_final_title: 'Final AI assessment', wf_final_hire: 'Recommended', wf_final_reject: 'Better to reject', wf_final_consider: 'Borderline',
    wf_final_fit: 'Fit for the position', wf_final_strengths: 'Strengths', wf_final_concerns: 'Risks and weak points', wf_final_reco: 'Recommendation', wf_final_at: 'Analysis done',
    cand_col_ai: 'AI analysis', ai_tag_hire: 'Recommended', ai_tag_reject: 'Reject', ai_tag_consider: 'Borderline', ai_tag_pending: 'In progress',
    vp_ai_note: 'AI calls require the calls integration (Vapi) and the candidate’s phone number. Without the integration the step is silently skipped.',
    vp_kn_q: 'questions', vp_kn_add: 'Add knowledge test', vp_kn_setup: 'Configure', vp_kn_blank: 'Test',
    vp_kn_hint: 'Empty draft tests are filled in on the “Knowledge check” tab — and vice versa: tests created there show up in this list.',
    vp_kn_del_confirm: 'Delete this knowledge test?',
    vp_linkdays: 'Test link lifetime, days', vp_linkdays_hint: 'If the candidate doesn’t open the test in this time, the link expires — you can resend it.',
    vp_order_h: 'Test order', vp_order_hint: 'The order in which the candidate receives this vacancy’s tests — in the auto-funnel and when several tests are sent at once.',
    vp_crit_h: 'Selection criteria',
    vp_crit_hint: 'Mark what is critically important for this position. If a critical step is failed, the candidate goes no further: the auto-funnel stops and the decision is a rejection. A non-critical step stays in the overall picture but doesn’t block the process.',
    vp_crit_on: 'Critical: no pass-through', vp_crit_off: 'Non-critical: process continues',
    vp_crit_result: 'Productivity is the foundation of the method: past results can’t be changed. If the test shows the wrong type (a Winner or Doer for this role’s task), there is no point letting the candidate through.',
    vp_crit_references: 'References confirm facts from the past. Negative or evasive feedback from former managers is a serious signal the claimed results weren’t real.',
    vp_crit_tools: 'One of the most important tests: personality traits must match the role requirements from the requisition. Traits can’t be changed quickly — a mismatch is better not passed through.',
    vp_crit_motivation: 'Motivation level can be raised — that’s engagement work. Filter by motivation only where you need conviction- or duty-level motivation from day one.',
    vp_crit_knowledge: 'Knowledge can be taught, so it’s usually not a reason to reject. But some roles require knowledge from day one — decide case by case.',
    funnel_title: 'Candidate funnel', board_empty: 'No candidates for this vacancy yet. Publish the form and invite candidates.',
    kanban_hint: 'Drag cards between columns. Candidates also move automatically as they pass stages.',
    cand_found: 'Found', cand_passed_tests: 'Passed tests', cand_hired: 'Hired',
    kpi7_cands: 'Candidates', kpi7_started: 'Entered recruitment', kpi7_result: 'Passed Result', kpi7_tools: 'Passed Tools', kpi7_motiv: 'Motivation checked', kpi7_knowledge: 'Knowledge checked', kpi7_hired: 'Hired',
    kn_upload_img: 'Upload image', kn_upload_vid: 'Upload video', kn_uploading: 'Uploading…', kn_remove: 'Remove',
    vac_apply_open: 'Application form link', vac_publish_done: 'Form published',
    wf_optional_h: 'Additional assessments', wf_send_opt: 'Send test',
    cand_title: 'Candidates', cand_search: 'Search by name, email, phone…', cand_empty: 'No candidates yet. They will appear here after applying to job ads.',
    cand_add: 'Add candidate',
    cand_import_cv: 'Import CV', cand_cv_parsing: 'AI is reading the CV…', cand_cv_done: 'Imported: {n}', cand_cv_fail: 'Not recognized: {n}', cand_cv_none: 'Could not recognize any file', cand_cv_hint: 'PDF or a photo of a CV — AI will parse it and create cards',
    kn_pass_lbl: 'pass threshold',
    cand_col_name: 'Candidate', cand_col_vac: 'Vacancy', cand_col_stage: 'Stage', cand_col_tests: 'Tests passed', cand_col_date: 'Added',
    cand_all_vac: 'All vacancies', cand_info: 'Candidate details', pipe_now: 'Here now',
    req_level: 'Position level', lvl_staff: 'Regular employee', lvl_lead: 'Manager',
    pos_recognized: 'Recognized position', traits_rec_for: 'For the position', traits_rec_lead_phrase: 'For a department head',
    traits_rec_advise: 'the methodology recommends focusing on the qualities', traits_apply: 'Select in the list',
  },
};
function rt(k) { const m = RI18N[LANG] || RI18N.ru; return m[k] != null ? m[k] : (RI18N.ru[k] || k); }
const REQ_STATUS_CLS = { draft: 'st-draft', submitted: 'st-sub', approved: 'st-appr', rejected: 'st-rej' };

// ---------- Страница «Кандидаты» (отклики с объявлений + все кандидаты) ----------
let candVacFilter = 'all';
async function renderCandidates() {
  const { candidates } = await api('/api/candidates?lang=' + LANG);
  const vacs = [...new Map(candidates.filter(c => c.vacancyId).map(c => [c.vacancyId, c.vacancyName])).entries()];
  const colBadge = c => {
    const cls = c.column === 'hired' ? 'cs-hired' : c.column === 'rejected' ? 'cs-rej' : c.column === 'new' ? 'cs-new' : 'cs-stage';
    return `<span class="cand-stage ${cls}">${esc(c.columnTitle)}</span>`;
  };
  const draw = q => {
    const rows = candidates.filter(c => candVacFilter === 'all' || c.vacancyId === candVacFilter)
      .filter(c => !q || (c.name + ' ' + c.email + ' ' + (c.tel || '') + ' ' + (c.vacancyName || '')).toLowerCase().includes(q))
      .map(c => `<tr onclick="openParticipant('${c.id}')" style="cursor:pointer">
        <td><div class="cand"><span class="avatar" style="width:32px;height:32px;background:${avColor(c.name)}">${esc(initials(c.name, c.email))}</span><div><b>${esc(c.name)}</b><div class="muted" style="font-size:12px">${esc(c.email || c.tel || '')}</div></div></div></td>
        <td>${esc(c.vacancyName || '—')}</td><td>${colBadge(c)}</td>
        <td style="white-space:nowrap">${(c.tests || []).map(tt => `<span class="res-icon res-${tt.type}" title="${testTitle(tt.type)}" onclick="event.stopPropagation();openReport('${tt.id}')">${TEST_ICON[tt.type] || ICON_KNOWLEDGE}</span>`).join('') || '<span class="muted">—</span>'}</td><td class="muted">${fmtDate(c.createdAt)}</td></tr>`).join('');
    $('#cand-rows').innerHTML = rows || `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">${rt('cand_empty')}</td></tr>`;
  };
  const vacOpts = `<option value="all">${rt('cand_all_vac')}</option>` + vacs.map(([id, name]) => `<option value="${id}" ${candVacFilter === id ? 'selected' : ''}>${esc(name)}</option>`).join('');
  $('#main').innerHTML = `<div class="eyebrow reveal">${t('nav_candidates')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${rt('cand_title')}</h1>
    <div class="card reveal d2">
      <div class="row" style="gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div class="search-wrap grow" style="flex:1;min-width:220px"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="cand-q" aria-label="${rt('cand_search')}" placeholder="${rt('cand_search')}"></div>
        <select class="field" id="cand-vac" style="max-width:240px">${vacOpts}</select>
        <label class="btn ghost ic-btn" id="cand-cv-lbl" title="${rt('cand_cv_hint')}">${_svg('<path d="M14 3v5h5M9 13h6M9 17h6M8 3h6l5 5v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke-linecap="round" stroke-linejoin="round"/>')}${rt('cand_import_cv')}<input type="file" id="cand-cv-inp" accept="application/pdf,image/*" multiple hidden></label>
        <button class="btn ic-btn" id="cand-add">${_svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>')}${rt('cand_add')}</button></div>
      <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>${rt('cand_col_name')}</th><th>${rt('cand_col_vac')}</th><th>${rt('cand_col_stage')}</th><th>${t('col_results')}</th><th>${rt('cand_col_date')}</th></tr></thead><tbody id="cand-rows"></tbody></table></div>
    </div>`;
  $('#cand-q').oninput = e => draw(e.target.value.toLowerCase().trim());
  $('#cand-vac').onchange = e => { candVacFilter = e.target.value; draw($('#cand-q').value.toLowerCase().trim()); };
  $('#cand-add').onclick = () => createCandidate(candVacFilter !== 'all' ? candVacFilter : null);
  $('#cand-cv-inp').onchange = e => importCV(e.target.files, candVacFilter !== 'all' ? candVacFilter : null);
  draw('');
}
// Импорт CV: файлы → dataURL → edge (Claude vision) → карточки кандидатов
function fileToDataUrl(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); }
async function importCV(fileList, vacancyId) {
  const files = [...(fileList || [])].slice(0, 20);
  if (!files.length) return;
  const lbl = $('#cand-cv-lbl'); if (lbl) lbl.classList.add('is-busy');
  toast(rt('cand_cv_parsing'));
  try {
    const payload = [];
    for (const f of files) { try { payload.push({ name: f.name, dataUrl: await fileToDataUrl(f) }); } catch (e) {} }
    const r = await api('/api/candidates/import-cv', { method: 'POST', body: JSON.stringify({ files: payload, vacancyId }) });
    const nOk = (r.created || []).length, nBad = (r.failed || []).length;
    if (nOk) { toast(rt('cand_cv_done').replace('{n}', nOk) + (nBad ? ' · ' + rt('cand_cv_fail').replace('{n}', nBad) : '')); invalidateParts && invalidateParts(); renderCandidates(); }
    else toast(rt('cand_cv_none'));
  } catch (e) { toast((e && e.message) || rt('cand_cv_none')); }
  finally { if (lbl) lbl.classList.remove('is-busy'); const inp = $('#cand-cv-inp'); if (inp) inp.value = ''; }
}
let recTab = 'applications';
let recMeta = null;
async function ensureRecMeta() { if (!recMeta) recMeta = await api('/api/recruit/meta?lang=' + LANG); return recMeta; }
async function renderRecruitment() {
  recMeta = null; // перечитать под текущий язык
  const tabs = [['applications', t('rec_applications')], ['vacancies', t('rec_vacancies')]];
  if (!tabs.some(x => x[0] === recTab)) recTab = 'applications';
  $('#main').innerHTML = `<div class="eyebrow reveal">${t('nav_vacancies')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('nav_vacancies')}</h1>
    <div class="settabs reveal d2">${tabs.map(([k, l]) => `<button class="seg-tab ${recTab === k ? 'on' : ''}" data-rtab="${k}">${esc(l)}</button>`).join('')}</div>
    <div class="reveal d2" id="rec-body"><p class="muted">${t('loading')}</p></div>`;
  $$('[data-rtab]').forEach(b => b.onclick = () => { recTab = b.dataset.rtab; renderRecruitment(); });
  if (recTab === 'applications') renderReqTab(); else renderVacTab();
}

// ---------- Вкладка «Заявки» ----------
// Фильтры: по умолчанию показываем только новые (утверждённые скрыты — включаются фильтром статуса)
let reqFilter = { q: '', status: 'active', pos: 'all' };
async function renderReqTab() {
  const { requisitions } = await api('/api/requisitions');
  const positions = [...new Set(requisitions.map(r => (r.position || '').trim()).filter(Boolean))].sort();
  const drawRows = () => {
    const q = reqFilter.q.toLowerCase();
    const list = requisitions
      .filter(r => reqFilter.status === 'all' ? true : reqFilter.status === 'active' ? r.status !== 'approved' : r.status === reqFilter.status)
      .filter(r => reqFilter.pos === 'all' || (r.position || '').trim() === reqFilter.pos)
      .filter(r => !q || JSON.stringify(r).toLowerCase().includes(q));
    const rows = list.map(r => {
      const cls = REQ_STATUS_CLS[r.status] || 'st-draft';
      return `<div class="vac-card rec-click" data-req="${r.id}">
        <div class="vac-top"><div style="min-width:0"><div class="vac-name">${esc(r.position || '—')}</div>
          <div class="vac-dept">${r.createdBy === 'manager' ? rt('req_by_manager') + ' · ' : ''}${fmtDate(r.createdAt)}</div></div>
          <span class="req-badge ${cls}">${rt('req_st_' + r.status)}</span></div>
        <div class="vac-foot"><span class="muted">${r.vacancyId ? rt('req_has_vac') : ''}</span><span class="vac-open">${rt('req_open')} →</span></div>
      </div>`;
    }).join('');
    $('#req-list-box').innerHTML = rows ? `<div class="vac-grid">${rows}</div>` : `<div class="card stub-card"><p class="muted" style="max-width:460px;text-align:center">${rt('req_empty')}</p></div>`;
    $$('[data-req]').forEach(b => b.onclick = () => openReqForm(b.dataset.req));
  };
  const stOpts = [['active', rt('req_f_active')], ['all', rt('req_f_all')], ['draft', rt('req_st_draft')], ['submitted', rt('req_st_submitted')], ['approved', rt('req_st_approved')], ['rejected', rt('req_st_rejected')]]
    .map(([v, l]) => `<option value="${v}" ${reqFilter.status === v ? 'selected' : ''}>${esc(l)}</option>`).join('');
  const posOpts = `<option value="all">${rt('req_f_all_pos')}</option>` + positions.map(p => `<option value="${esc(p)}" ${reqFilter.pos === p ? 'selected' : ''}>${esc(p)}</option>`).join('');
  $('#rec-body').innerHTML = `<p class="muted" style="margin:0 0 14px;max-width:860px;font-size:13px;line-height:1.55">${rt('req_page_hint')}</p>
    <div class="row" style="gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
      <div class="search-wrap" style="flex:1;min-width:200px"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="req-q" value="${esc(reqFilter.q)}" placeholder="${t('search')}…"></div>
      <select class="field" id="req-f-pos" style="max-width:220px">${posOpts}</select>
      <select class="field" id="req-f-status" style="max-width:200px">${stOpts}</select>
      <button class="btn ghost ic-btn" id="req-share" style="white-space:nowrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke-linecap="round"/><path d="M16 6l-4-4-4 4M12 2v13" stroke-linecap="round" stroke-linejoin="round"/></svg>${rt('req_share_company')}</button>
      <button class="btn" id="req-new" style="white-space:nowrap">+ ${rt('req_new')}</button></div>
    <div id="req-share-box"></div>
    <div id="req-list-box"></div>`;
  $('#req-q').oninput = e => { reqFilter.q = e.target.value.trim(); drawRows(); };
  $('#req-f-pos').onchange = e => { reqFilter.pos = e.target.value; drawRows(); };
  $('#req-f-status').onchange = e => { reqFilter.status = e.target.value; drawRows(); };
  drawRows();
  $('#req-new').onclick = () => openReqForm(null);
  $('#req-share').onclick = async () => {
    const box = $('#req-share-box');
    if (box.innerHTML) { box.innerHTML = ''; return; }
    const d = await api('/api/company/req-link');
    box.innerHTML = `<div class="share-block" style="margin-bottom:14px"><div class="lbl">${rt('req_share_company')}</div>
      <span class="req-hint">${rt('req_share_company_hint')}</span>
      <div class="row" style="gap:6px;margin-top:6px"><input class="field sm" style="flex:1" readonly value="${esc(d.link)}" id="cmp-link">
      <button class="btn ghost xs" id="cmp-copy">${rt('common_copy')}</button></div></div>`;
    $('#cmp-copy').onclick = () => copyLink(d.link);
  };
}

// ---------- Форма заявки (23 поля, сгруппированы по секциям) ----------
function reqFieldHtml(f, val) {
  const lab = reqLabel(f.label, LANG);
  const desc = (f.desc || f.hint) ? `<span class="req-hint">${esc(reqLabel(f.desc || f.hint, LANG))}</span>` : '';
  const id = 'rq-' + f.key;
  if (f.type === 'textarea')
    return `<div class="full"><label class="lbl">${esc(lab)}${f.req ? ' *' : ''}</label>${desc}<textarea class="field" id="${id}" rows="2">${esc(val || '')}</textarea></div>`;
  if (f.type === 'number')
    return `<div><label class="lbl">${esc(lab)}</label>${desc}<input class="field" id="${id}" type="number" value="${esc(val || '')}"></div>`;
  if (f.type === 'select') {
    const opts = f.options.map(o => `<option value="${o.value}" ${val === o.value ? 'selected' : ''}>${esc(reqLabel(o.label, LANG))}</option>`).join('');
    return `<div><label class="lbl">${esc(lab)}</label>${desc}<select class="field" id="${id}"><option value="">—</option>${opts}</select></div>`;
  }
  if (f.type === 'section') {
    // Комбобокс с поиском: выбрать существующий раздел или ввести новый (datalist)
    return `<div><label class="lbl">${esc(lab)}</label>${desc}<input class="field" id="${id}" list="req-sec-list" value="${esc(val || '')}" autocomplete="off"><datalist id="req-sec-list"></datalist></div>`;
  }
  if (f.type === 'traits') {
    const cur = Array.isArray(val) ? val : (typeof val === 'string' && val ? val.split(',') : []);
    const rows = REQ_SCHEMA.traits.map(tr => `<tr class="trait-row ${cur.includes(tr.key) ? 'on' : ''}">
        <td class="trait-check"><input type="checkbox" value="${tr.key}" ${cur.includes(tr.key) ? 'checked' : ''} data-trait></td>
        <td class="trait-name">${esc(reqLabel(tr.l, LANG))}</td>
        <td class="trait-desc">${esc(reqLabel(tr.d, LANG))}</td></tr>`).join('');
    return `<div class="full"><label class="lbl">${esc(lab)}</label>${desc}
      <div class="traits-rec" id="traits-rec"></div>
      <table class="trait-table" id="${id}" data-max="${f.max || 3}"><tbody>${rows}</tbody></table></div>`;
  }
  if (f.key === 'position')
    return `<div class="full"><label class="lbl">${esc(lab)}${f.req ? ' *' : ''}</label>${desc}<input class="field" id="${id}" value="${esc(val || '')}"><div class="pos-hint" id="pos-hint"></div></div>`;
  return `<div class="full"><label class="lbl">${esc(lab)}${f.req ? ' *' : ''}</label>${desc}<input class="field" id="${id}" value="${esc(val || '')}"></div>`;
}
function reqFormSections(form) {
  return REQ_SCHEMA.sections.map(sec => {
    const fields = REQ_SCHEMA.fields.filter(f => f.section === sec.key);
    if (!fields.length) return '';
    return `<div class="req-sec"><div class="req-sec-h">${esc(reqLabel(sec.title, LANG))}</div>
      <div class="form-grid">${fields.map(f => reqFieldHtml(f, form[f.key])).join('')}</div></div>`;
  }).join('');
}
function collectReqForm() {
  const form = {};
  REQ_SCHEMA.fields.forEach(f => {
    if (f.type === 'traits') {
      const wrap = document.getElementById('rq-' + f.key);
      form[f.key] = wrap ? $$('[data-trait]:checked', wrap).map(c => c.value) : [];
    } else {
      const el = document.getElementById('rq-' + f.key);
      form[f.key] = el ? el.value : '';
    }
  });
  const lvl = document.getElementById('rq-level');
  form.level = lvl ? lvl.dataset.level : 'staff';
  return form;
}
// ИИ распознаёт должность и рекомендует качества (рядовой → качества должности; руководитель → качества руководителя)
function analyzeReqPosition() {
  const posEl = document.getElementById('rq-position'); if (!posEl) return;
  const hint = document.getElementById('pos-hint'), rec = document.getElementById('traits-rec');
  const lvlSeg = document.getElementById('rq-level');
  const level = lvlSeg ? lvlSeg.dataset.level : 'staff';
  const pos = matchPosition(posEl.value);
  if (hint) hint.innerHTML = pos ? `${AI_IC} ${rt('pos_recognized')}: <b>«${esc(reqLabel(pos.name, LANG))}»</b>` : '';
  if (!rec) return;
  if (level !== 'lead' && !pos) { rec.innerHTML = ''; return; }
  const quals = recommendedQualities(pos, level, LANG);
  if (!quals.length) { rec.innerHTML = ''; return; }
  const traitKeys = [...new Set(quals.map(q => q.trait).filter(Boolean))];
  const forWhom = level === 'lead' ? `<b>${esc(rt('traits_rec_lead_phrase'))}</b>` : `${rt('traits_rec_for')} <b>«${esc(reqLabel(pos.name, LANG))}»</b>`;
  const points = level === 'lead' ? POSITION_REF[0].points : (pos ? pos.points : '');
  rec.innerHTML = `<div class="tr-rec"><div class="tr-rec-txt">${AI_IC} ${forWhom} ${rt('traits_rec_advise')}: <b>${quals.map(q => esc(q.label)).join(', ')}</b>${points ? ` <span class="muted">(${points})</span>` : ''}</div>${traitKeys.length ? `<button type="button" class="btn ghost xs" id="traits-apply">${rt('traits_apply')}</button>` : ''}</div>`;
  const ap = document.getElementById('traits-apply'); if (ap) ap.onclick = () => applyRecommendedTraits(traitKeys);
  // Автоотметка рекомендованных качеств при распознанной должности (если рекомендация изменилась)
  const recKey = (level === 'lead' ? 'lead' : (pos ? reqLabel(pos.name, 'ru') : '')) + ':' + traitKeys.join(',');
  if (traitKeys.length && recKey !== analyzeReqPosition._applied) {
    const tw = document.getElementById('rq-traits');
    const hasManual = tw && $$('[data-trait]:checked', tw).length > 0;
    // при первом открытии формы не затираем уже сохранённый выбор
    if (!(analyzeReqPosition._applied == null && hasManual)) applyRecommendedTraits(traitKeys);
    analyzeReqPosition._applied = recKey;
  }
}
function applyRecommendedTraits(keys) {
  const tw = document.getElementById('rq-traits'); if (!tw) return;
  const pick = keys.slice(0, +tw.dataset.max || 3);
  $$('[data-trait]', tw).forEach(c => { c.checked = pick.includes(c.value); });
  $$('.trait-row', tw).forEach(r => r.classList.toggle('on', r.querySelector('input').checked));
}
async function openReqForm(id, unlock) {
  let req = null, analysis = null, link = '';
  if (id) { const d = await api('/api/requisitions/' + id + '?lang=' + LANG); req = d.requisition; analysis = d.analysis; link = d.link; }
  // Утверждённая заявка — только чтение; редактирование по явной кнопке «Изменить заявку» (эйчар)
  const locked = !!(req && req.status === 'approved' && !unlock);
  const form = (req && req.form) || {};
  const lang = (req && req.lang) || LANG;
  const langOpts = PORTAL_LANGS.map(l => `<option value="${l.code}" ${lang === l.code ? 'selected' : ''}>${l.name}</option>`).join('');
  const shareBlock = req ? `<div class="share-block"><div class="lbl">${rt('req_share')}</div><span class="req-hint">${rt('req_share_hint')}</span>
      <div class="row" style="gap:6px;margin-top:6px"><input class="field sm" style="flex:1" readonly value="${esc(link)}" id="req-link"><button class="btn ghost xs" id="req-copy">${rt('common_copy')}</button></div></div>` : '';
  const aiBlock = analysis ? `<div class="ai-note ${analysis.ready ? 'tone-good' : 'tone-mid'}"><div class="ai-h">${AI_IC} ${rt('req_analysis')}</div><ul>${analysis.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` : '';
  openModal(`<div class="report-head"><h2 style="margin:0;font-size:22px">${req ? rt('req_edit_title') : rt('req_new_title')}</h2>
      ${req ? `<span class="req-badge ${REQ_STATUS_CLS[req.status]}">${rt('req_st_' + req.status)}</span>` : ''}</div>
    <div class="req-form-wrap">
      <div class="req-sec"><div class="form-grid">
        <div><label class="lbl">${rt('req_lang')}</label><select class="field" id="rq-lang" style="max-width:240px">${langOpts}</select></div>
        <div><label class="lbl">${rt('req_level')}</label>
          <div class="seg-toggle" id="rq-level" data-level="${(form.level === 'lead') ? 'lead' : 'staff'}">
            <button type="button" class="seg-opt ${form.level !== 'lead' ? 'on' : ''}" data-lvl="staff">${rt('lvl_staff')}</button>
            <button type="button" class="seg-opt ${form.level === 'lead' ? 'on' : ''}" data-lvl="lead">${rt('lvl_lead')}</button>
          </div></div>
      </div></div>
      ${reqFormSections(form)}
      ${shareBlock}${aiBlock}
      <div class="row" style="gap:8px;margin-top:16px;flex-wrap:wrap">
        ${locked ? '' : `<button class="btn" id="req-save">${rt('req_save')}</button>`}
        ${!locked && req && req.status !== 'approved' ? `<button class="btn soft" id="req-approve">${rt('req_approve')}</button>` : ''}
        ${req && req.vacancyId ? `<button class="btn soft" id="req-tovac">→ ${rt('vac_open')}</button>` : ''}
        ${locked ? `<button class="btn soft" id="req-unlock">✎ ${rt('req_unlock')}</button>` : ''}
        ${req ? `<button class="btn ghost danger" id="req-del">${rt('req_delete')}</button>` : ''}
      </div>
    </div>`, true);
  if (locked) {
    $$('.req-form-wrap .field, .req-form-wrap [data-trait], .req-form-wrap .seg-opt').forEach(el => { if (el.id !== 'req-link') el.disabled = true; });
    const ul = $('#req-unlock'); if (ul) ul.onclick = () => openReqForm(id, true);
  }
  // ограничение выбора качеств (макс 3) — таблица
  const tw = document.getElementById('rq-traits');
  if (tw) tw.addEventListener('change', (e) => {
    const max = +tw.dataset.max || 3; const checked = $$('[data-trait]:checked', tw);
    if (checked.length > max) { e.target.checked = false; toast('Максимум ' + max); }
    $$('.trait-row', tw).forEach(r => r.classList.toggle('on', r.querySelector('input').checked));
  });
  // ИИ-подсказка качеств по должности + уровню (рядовой/руководитель)
  const posEl = document.getElementById('rq-position');
  if (posEl) { let td; posEl.addEventListener('input', () => { clearTimeout(td); td = setTimeout(analyzeReqPosition, 350); }); }
  const lvlSeg = document.getElementById('rq-level');
  if (lvlSeg) $$('[data-lvl]', lvlSeg).forEach(b => b.onclick = () => {
    lvlSeg.dataset.level = b.dataset.lvl;
    $$('[data-lvl]', lvlSeg).forEach(x => x.classList.toggle('on', x === b));
    analyzeReqPosition();
  });
  analyzeReqPosition._applied = null; // новая форма — сбросить состояние автоотметки качеств
  analyzeReqPosition();
  // Наполнить список разделов для комбобокса «Раздел (направление)»
  api('/api/sections').then(d => {
    const dl = document.getElementById('req-sec-list');
    if (dl) dl.innerHTML = (d.sections || []).map(s => `<option value="${esc(s.name)}">`).join('');
  }).catch(() => {});
  if (req) { $('#req-copy').onclick = () => copyLink(link); }
  const sv = $('#req-save'); if (sv) sv.onclick = async () => {
    const body = { form: collectReqForm(), lang: $('#rq-lang').value };
    if (id) { await api('/api/requisitions/' + id, { method: 'PUT', body: JSON.stringify(body) }); }
    else { await api('/api/requisitions', { method: 'POST', body: JSON.stringify(body) }); }
    toast(rt('common_saved')); closeModal(); renderRecruitment();
  };
  const ap = $('#req-approve'); if (ap) ap.onclick = async () => {
    await api('/api/requisitions/' + id, { method: 'PUT', body: JSON.stringify({ form: collectReqForm(), lang: $('#rq-lang').value }) });
    const d = await api('/api/requisitions/' + id + '/approve', { method: 'POST' });
    toast(rt('req_created_vac')); closeModal(); recTab = 'vacancies'; renderRecruitment();
  };
  const tv = $('#req-tovac'); if (tv) tv.onclick = () => { closeModal(); openVacancyPage(req.vacancyId); };
  const dl = $('#req-del'); if (dl) dl.onclick = async () => { if (!confirm(rt('req_delete') + '?')) return; await api('/api/requisitions/' + id, { method: 'DELETE' }); closeModal(); renderRecruitment(); };
}

// ---------- Вкладка «Вакансии» ----------
async function renderVacTab() {
  const { vacancies } = await api('/api/vacancies?sectionId=all');
  await loadParticipants();
  const withReq = vacancies.filter(v => v.requisitionId);
  const statOf = vid => { const ps = state.participants.filter(p => p.vacancyId === vid);
    return { c: ps.length, done: ps.filter(p => p.tests.some(t => t.status === 'done')).length, wait: ps.filter(p => p.tests.some(t => t.status !== 'done')).length }; };
  const cards = withReq.map(v => { const s = statOf(v.id);
    return `<div class="vac-card rec-click" data-vac="${v.id}">
      <div class="vac-top"><div style="min-width:0"><div class="vac-name">${esc(v.name)}</div><div class="vac-dept">${esc(langName(v.lang))}</div></div>
        <span class="vac-badge ${v.published ? 'pub' : 'draft'}">${v.published ? rt('vac_published') : rt('vac_draft')}</span></div>
      <div class="vac-stats"><div><b>${s.c}</b><span>${rt('vac_stat_cands')}</span></div><div><b class="g">${s.done}</b><span>${rt('vac_stat_done')}</span></div><div><b class="a">${s.wait}</b><span>${rt('vac_stat_wait')}</span></div></div>
    </div>`; }).join('');
  $('#rec-body').innerHTML = `<p class="muted" style="margin:0 0 14px;max-width:860px;font-size:13px;line-height:1.55">${rt('vac_quick_hint')}</p>
    <div class="vac-grid">${cards}<div class="vac-card vac-new" id="vac-quick-new">＋ ${rt('vac_new_card')}</div></div>`;
  $$('[data-vac]').forEach(b => b.onclick = () => openVacancyPage(b.dataset.vac));
  $('#vac-quick-new').onclick = () => {
    openModal(`<h2 style="margin:0 0 8px">${rt('vac_quick_create')}</h2>
      <p class="muted" style="margin:0 0 14px;font-size:13px;line-height:1.55">${rt('vac_quick_hint')}</p>
      <label class="lbl">${rt('vac_quick_name')}</label><input class="field" id="vq-name" autocomplete="off">
      <div class="row" style="gap:8px;margin-top:16px">
        <button class="btn" id="vq-go">${rt('vac_quick_go')}</button>
        <button class="btn soft" id="vq-req">${rt('vac_quick_via_req')}</button>
        <button class="btn ghost" onclick="closeModal()">${rt('common_close')}</button></div>`);
    $('#vq-name').focus();
    // Быстрое создание: заявка с одним названием сразу утверждается → появляется вакансия
    $('#vq-go').onclick = async () => {
      const name = $('#vq-name').value.trim();
      if (!name) return toast(rt('vac_quick_need_name'));
      const d = await api('/api/requisitions', { method: 'POST', body: JSON.stringify({ form: { position: name }, lang: docLang() }) });
      const a = await api('/api/requisitions/' + d.requisition.id + '/approve', { method: 'POST' });
      toast(rt('req_created_vac')); closeModal(); openVacancyPage(a.vacancyId);
    };
    // Полный путь: открыть форму заявки (название предзаполняется)
    $('#vq-req').onclick = async () => {
      const name = $('#vq-name').value.trim();
      closeModal();
      await openReqForm(null);
      const pos = $('#rq-position');
      if (pos && name) { pos.value = name; pos.dispatchEvent(new Event('input')); }
    };
  };
}

// ---------- Страница вакансии: дашборд-воронка / канбан / объявление / знания ----------
let vacPage = { id: null, tab: 'dashboard', board: null };
async function openVacancyPage(id, tab) {
  vacPage.id = id; vacPage.tab = tab || 'dashboard';
  $('#main').classList.add('vac-lock');
  $('#main').innerHTML = `<p class="muted">${t('loading')}</p>`;
  await renderVacancyPage();
}
window.openVacancyPage = openVacancyPage;
async function renderVacancyPage() {
  const id = vacPage.id;
  vacPage.board = await api('/api/vacancies/' + id + '/board?lang=' + LANG);
  const b = vacPage.board;
  const tabs = [['dashboard', rt('vac_tab_dashboard')], ['req', rt('vac_tab_req')], ['ad', rt('vac_tab_ad')], ['anketas', rt('vac_tab_anketas')], ['process', rt('vac_tab_process')], ['candidates', rt('vac_tab_cands')], ['kanban', rt('vac_tab_kanban')], ['knowledge', rt('vac_tab_knowledge')]];
  if (!tabs.some(x => x[0] === vacPage.tab)) vacPage.tab = 'dashboard';
  $('#main').innerHTML = `
    <button class="btn ghost sm" id="vac-back" style="margin-bottom:12px">${rt('vac_back')}</button>
    <div class="eyebrow reveal">${t('nav_vacancies')}${b.vacancy.published ? ` · <span style="color:var(--good)">${rt('vac_published')}</span>` : ''}</div>
    <h1 class="page-h reveal d1" style="margin-top:6px">${esc(b.vacancy.name)}</h1>
    <div class="settabs reveal d2">${tabs.map(([k, l]) => `<button class="seg-tab ${vacPage.tab === k ? 'on' : ''}" data-vtab="${k}">${esc(l)}</button>`).join('')}</div>
    <div class="reveal d2" id="vac-page-body"></div>`;
  $('#vac-back').onclick = () => { recTab = 'vacancies'; setView('vacancies'); };
  $$('[data-vtab]').forEach(x => x.onclick = () => { vacPage.tab = x.dataset.vtab; renderVacancyPage(); });
  const body = $('#vac-page-body');
  if (vacPage.tab === 'dashboard') renderVacDashboard(body, b);
  else if (vacPage.tab === 'req') await renderVacReq(body, id);
  else if (vacPage.tab === 'ad') await renderVacAd(body, id);
  else if (vacPage.tab === 'anketas') await renderVacAnketas(body, id);
  else if (vacPage.tab === 'process') await renderVacProcess(body, id);
  else if (vacPage.tab === 'candidates') await renderVacCandidates(body, id);
  else if (vacPage.tab === 'kanban') renderVacKanban(body, b);
  else if (vacPage.tab === 'knowledge') await renderVacKnowledge(body, id);
}
// ---------- Вкладка «Заявка» — дубль заявки этой вакансии (только чтение) ----------
async function renderVacReq(body, id) {
  const { vacancy } = await api('/api/vacancies/' + id + '/full');
  if (!vacancy.requisitionId) { body.innerHTML = `<div class="card stub-card"><p class="muted" style="text-align:center">${rt('req_empty')}</p></div>`; return; }
  const d = await api('/api/requisitions/' + vacancy.requisitionId + '?lang=' + LANG);
  const req = d.requisition, form = req.form || {};
  body.innerHTML = `<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <span class="req-badge ${REQ_STATUS_CLS[req.status] || 'st-draft'}">${rt('req_st_' + req.status)}</span>
      <button class="btn soft sm" id="vreq-open">${rt('req_open')}</button></div>
    <div class="req-form-wrap">${reqFormSections(form)}</div></div>`;
  $$('.req-form-wrap .field, .req-form-wrap [data-trait]', body).forEach(el => { el.disabled = true; });
  // Снять id с read-only копии формы: иначе модалка «Открыть» с теми же id читает
  // при сохранении фоновые поля вкладки, и правки не сохраняются
  $$('.req-form-wrap [id]', body).forEach(el => el.removeAttribute('id'));
  $('#vreq-open').onclick = () => { window.__onModalClose = () => openVacancyPage(id, 'req'); openReqForm(vacancy.requisitionId); };
}
// ---------- Вкладка «Анкеты» — анкеты этой вакансии ----------
async function renderVacAnketas(body, id) {
  const ak = await api('/api/anketas');
  const list = ak.anketas.filter(a => a.vacancyId === id);
  const cards = list.map(a => `<div class="ak-card">
    <div class="ak-main"><b>${esc(a.title)}</b><div class="muted" style="font-size:13px;margin:2px 0 6px">${(a.tests || []).length} ${t('ak_tests_word')} <b>${a.applied}</b></div>
      <a class="ak-url" href="${a.url}" target="_blank">${esc(a.url)}</a></div>
    <div class="ak-acts"><button class="btn ghost sm" onclick="copyLink('${a.url}')">${t('ak_copy')}</button>
      <button class="btn soft sm" data-vak-edit="${a.id}">${t('ak_edit')}</button>
      <button class="btn ghost danger sm" data-vak-del="${a.id}">${t('ak_delete')}</button></div></div>`).join('');
  body.innerHTML = `<div class="row" style="justify-content:flex-end;margin-bottom:12px">
      <button class="btn ic-btn" id="vak-new">${_svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>')}${t('ak_create')}</button></div>
    ${list.length ? `<div class="ak-list">${cards}</div>` : `<div class="card stub-card"><p class="muted" style="text-align:center">${t('ak_empty')}</p></div>`}`;
  const back = () => openVacancyPage(id, 'anketas');
  $('#vak-new').onclick = () => renderAnketaEdit(null, { vacancyId: id, onBack: back });
  $$('[data-vak-edit]').forEach(b => b.onclick = () => renderAnketaEdit(b.dataset.vakEdit, { onBack: back }));
  $$('[data-vak-del]').forEach(b => b.onclick = async () => {
    if (!confirm(t('ak_delete') + '?')) return;
    await api('/api/anketas/' + b.dataset.vakDel, { method: 'DELETE' }); toast(t('saved')); back();
  });
}
// ---------- Вкладка «Процесс найма» — настройка процесса под конкретную должность ----------
// Тумблеры шагов, доп. тестов и звонков ИИ сохраняются сразу; тесты знаний двусторонне
// синхронизированы со вкладкой «Проверка знаний» (болванка отсюда → наполняется там)
async function renderVacProcess(body, id) {
  const { vacancy } = await api('/api/vacancies/' + id + '/full');
  const proc = vacancy.process || {};
  const st = proc.stages || {}, op = proc.optional || {}, ac = proc.aiCalls || {}, cr = proc.critical || {};
  const kts = vacancy.knowledgeTests || [];
  const sw = (path, on) => `<span class="switch ${on ? 'on' : ''}" data-vp="${path}" role="switch" tabindex="0" aria-checked="${on}"><i></i></span>`;
  const order = (proc.order || ['result', 'tools', 'logic', 'sales', 'knowledge']).slice();
  // Мотивация участвует в очерёдности наравне с тестами (по умолчанию — сразу под «Продуктивностью»)
  if (!order.includes('motivation')) { const ri = order.indexOf('result'); order.splice(ri >= 0 ? ri + 1 : order.length, 0, 'motivation'); }
  // Стрелки очередности прямо в «Шагах процесса»
  const ordArrows = key => { const i = order.indexOf(key); if (i < 0) return '';
    return `<span class="vp-ord"><span class="vp-ordn">${i + 1}</span>
      <button class="vp-ord-b" data-vpord-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Раньше">${_svg('<path d="M18 15l-6-6-6 6" stroke-linecap="round" stroke-linejoin="round"/>')}</button>
      <button class="vp-ord-b" data-vpord-dn="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Позже">${_svg('<path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>')}</button></span>`; };
  // Переключатель Виннер/Дуер (тип цели вакансии) на этапе «Резалт»
  const targetSeg = () => { const cur = proc.target === 'executor' ? 'executor' : 'performer';
    return `<span class="vp-seg"><button class="vp-seg-b ${cur === 'performer' ? 'on' : ''}" data-vptarget="performer">Виннер</button><button class="vp-seg-b ${cur === 'executor' ? 'on' : ''}" data-vptarget="executor">Дуер</button></span>`; };
  const stRow = (icon, iconCls, title, hint, swHtml, o) => `<div class="vp-row${o && o.ai ? ' vp-ai' : ''}${o && o.off ? ' off' : ''}">
      <span class="cstep-ic ${iconCls || ''}"${o && o.style ? ` style="${o.style}"` : ''}>${icon}</span>
      <div class="vp-t"><b>${title}</b>${hint ? `<span>${hint}</span>` : ''}</div>
      ${swHtml}</div>`;
  const aiRow = key => stRow(ICON_PHONE, '', `${AI_IC} ${rt('vp_ai_' + key)}`, '', sw('aiCalls.' + key, !!ac[key]),
    { ai: true, off: !ac[key], style: 'background:#eef2ff;color:#4e5ed3' });
  // Критерии отбора: критичный этап не пройден → кандидат дальше не идёт
  const critRow = (key, icon, iconCls, style) => `<div class="vp-row">
      <span class="cstep-ic ${iconCls || ''}"${style ? ` style="${style}"` : ''}>${icon}</span>
      <div class="vp-t"><b>${rt('vp_st_' + key)}</b><span>${rt('vp_crit_' + key)}</span></div>
      <span class="vp-crit-lbl ${cr[key] === false ? 'soft' : 'hard'}">${cr[key] === false ? rt('vp_crit_off') : rt('vp_crit_on')}</span>
      ${sw('critical.' + key, cr[key] !== false)}</div>`;
  const knList = `<div class="vp-kn">
      ${kts.map(kt => `<div class="vp-kn-item"><b style="flex:1;min-width:0">${esc(kt.name)}</b>
        <span class="muted" style="white-space:nowrap">${(kt.questions || []).length} ${rt('vp_kn_q')}</span>
        <button class="btn ghost xs" data-vpkn-edit="${kt.id}">${rt('vp_kn_setup')}</button>
        <button class="btn ghost danger xs" data-vpkn-del="${kt.id}" title="${t('kn_del_test')}">✕</button></div>`).join('')}
      <div class="row" style="gap:10px;align-items:center">
        <button class="btn soft xs" id="vp-kn-add">+ ${rt('vp_kn_add')}</button>
        <span class="muted" style="font-size:12px;flex:1">${rt('vp_kn_hint')}</span></div></div>`;
  // Рендер шага теста по ключу — чтобы шаги физически менялись местами по массиву order
  const testBlock = key => {
    if (key === 'result') return stRow(TEST_ICON.result, 'res-result', rt('vp_st_result'), '', ordArrows('result') + sw('stages.result', st.result !== false), { off: st.result === false })
      + (st.result !== false ? aiRow('afterResult') : '')
      + stRow(ICON_PHONE, '', rt('vp_st_references'), rt('vp_ref_hint'), sw('stages.references', st.references !== false), { off: st.references === false, style: 'background:#e4f6ec;color:#1f9d6b' })
      + (st.references !== false ? aiRow('references') : '');
    if (key === 'tools') return stRow(TEST_ICON.tools, 'res-tools', rt('vp_st_tools'), '', ordArrows('tools') + sw('stages.tools', st.tools !== false), { off: st.tools === false })
      + (st.tools !== false ? aiRow('afterTools') : '');
    if (key === 'logic') return stRow(TEST_ICON.logic, 'res-logic', rt('vp_st_logic'), '', ordArrows('logic') + sw('optional.logic', !!op.logic), { off: !op.logic });
    if (key === 'sales') return stRow(TEST_ICON.sales, 'res-sales', rt('vp_st_sales'), '', ordArrows('sales') + sw('optional.sales', !!op.sales), { off: !op.sales });
    if (key === 'knowledge') return stRow(ICON_KNOWLEDGE, 'res-knowledge', rt('vp_st_knowledge'), '', ordArrows('knowledge') + sw('stages.knowledge', st.knowledge !== false), { off: st.knowledge === false })
      + (st.knowledge !== false ? knList : '');
    if (key === 'motivation') return stRow(ICON_FLAME, '', rt('vp_st_motivation'), '', ordArrows('motivation') + sw('stages.motivation', st.motivation !== false), { off: st.motivation === false, style: 'background:#fff0e6;color:#d3641e' })
      + (st.motivation !== false ? aiRow('motivation') : '');
    return '';
  };
  body.innerHTML = `
    <div class="card" style="margin-bottom:14px"><div class="row" style="gap:16px;align-items:center">
      <div style="flex:1;min-width:0"><b style="font-size:15px">${rt('vp_auto')}</b>
        <p class="muted" style="margin:4px 0 0;font-size:13px;line-height:1.5">${rt('vp_auto_hint')}</p></div>
      <button class="btn ghost sm ic-btn" id="vp-aicall-cfg" title="${rt('aicfg_btn')}">${_svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>')}<span>${rt('aicfg_btn')}</span></button>
      ${sw('auto', !!proc.auto)}</div>
      <div class="row" style="gap:12px;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--line);flex-wrap:wrap">
        <div style="flex:1;min-width:220px"><b style="font-size:13.5px">${rt('vp_linkdays')}</b>
          <p class="muted" style="margin:3px 0 0;font-size:12.5px">${rt('vp_linkdays_hint')}</p></div>
        <input class="field" id="vp-linkdays" type="number" min="1" max="365" value="${proc.linkDays || 3}" style="width:110px"></div></div>
    <div class="card"><div class="cfg-h">${rt('vp_stages_h')}</div>
      <p class="muted" style="margin:0 0 12px;font-size:12.5px">${rt('vp_stages_hint')}</p>
      <div class="vp-list">
        ${aiRow('first')}
        ${order.map(testBlock).join('')}
      </div></div>
    <div class="card" style="margin-top:14px"><div class="cfg-h">${rt('vp_crit_h')}</div>
      <p class="muted" style="margin:0 0 12px;font-size:12.5px;line-height:1.5">${rt('vp_crit_hint')}</p>
      <div class="vp-list">
        ${st.result !== false ? `<div class="vp-row">
          <span class="cstep-ic res-result">${TEST_ICON.result}</span>
          <div class="vp-t"><b>${rt('vp_st_result')}</b><span>${rt('vp_crit_result')}</span></div>
          ${targetSeg()}
          <span class="vp-crit-lbl ${cr.result === false ? 'soft' : 'hard'}">${cr.result === false ? rt('vp_crit_off') : rt('vp_crit_on')}</span>
          ${sw('critical.result', cr.result !== false)}</div>` : ''}
        ${st.references !== false ? critRow('references', ICON_PHONE, '', 'background:#e4f6ec;color:#1f9d6b') : ''}
        ${st.tools !== false ? critRow('tools', TEST_ICON.tools, 'res-tools', '') : ''}
        ${st.motivation !== false ? critRow('motivation', ICON_FLAME, '', 'background:#fff0e6;color:#d3641e') : ''}
        ${st.knowledge !== false ? critRow('knowledge', ICON_KNOWLEDGE, 'res-knowledge', '') : ''}
      </div></div>`;
  const refresh = () => renderVacProcess(body, id);
  $$('[data-vp]', body).forEach(el => {
    const toggle = async () => {
      const [g, k] = el.dataset.vp.split('.');
      const on = !el.classList.contains('on');
      const payload = g === 'auto' ? { auto: on } : { [g]: { [k]: on } };
      await api('/api/vacancies/' + id + '/process', { method: 'PUT', body: JSON.stringify(payload) });
      toast(rt('common_saved')); refresh();
    };
    el.onclick = toggle;
    el.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } };
  });
  const ld = $('#vp-linkdays'); if (ld) ld.onchange = async () => {
    const v = Math.max(1, Math.min(365, parseInt(ld.value, 10) || 3)); ld.value = v;
    await api('/api/vacancies/' + id + '/process', { method: 'PUT', body: JSON.stringify({ linkDays: v }) });
    toast(rt('common_saved'));
  };
  const acb = $('#vp-aicall-cfg'); if (acb) acb.onclick = () => openAiCallCfgModal(id);
  // Очерёдность тестов: стрелки меняют порядок и сразу сохраняют
  const moveOrder = async (i, d) => {
    const ord = order.slice();   // тот же порядок, что отрисован (включая мотивацию)
    const j = i + d; if (j < 0 || j >= ord.length) return;
    [ord[i], ord[j]] = [ord[j], ord[i]];
    await api('/api/vacancies/' + id + '/process', { method: 'PUT', body: JSON.stringify({ order: ord }) });
    toast(rt('common_saved')); refresh();
  };
  $$('[data-vpord-up]', body).forEach(b => b.onclick = () => moveOrder(+b.dataset.vpordUp, -1));
  $$('[data-vpord-dn]', body).forEach(b => b.onclick = () => moveOrder(+b.dataset.vpordDn, 1));
  // Виннер/Дуер — цель вакансии
  $$('[data-vptarget]', body).forEach(b => b.onclick = async () => {
    if (b.classList.contains('on')) return;
    await api('/api/vacancies/' + id + '/process', { method: 'PUT', body: JSON.stringify({ target: b.dataset.vptarget }) });
    toast(rt('common_saved')); refresh();
  });
  const ka = $('#vp-kn-add'); if (ka) ka.onclick = async () => {
    await api('/api/vacancies/' + id + '/knowledge', { method: 'PUT', body: JSON.stringify({ name: rt('vp_kn_blank') + ' ' + (kts.length + 1), questions: [], passScore: 60 }) });
    toast(rt('common_saved')); refresh();
  };
  $$('[data-vpkn-edit]', body).forEach(b => b.onclick = () => openVacancyPage(id, 'knowledge'));
  $$('[data-vpkn-del]', body).forEach(b => b.onclick = async () => {
    if (!confirm(rt('vp_kn_del_confirm'))) return;
    await api('/api/vacancies/' + id + '/knowledge/' + b.dataset.vpknDel, { method: 'DELETE' });
    toast(rt('common_saved')); refresh();
  });
}
// ---------- Модалка «Настройки ИИ-звонков» (per-vacancy + наследование) ----------
async function openAiCallCfgModal(id) {
  let data;
  try { data = await api('/api/vacancies/' + id + '/ai-call'); }
  catch (e) { return toast(e.message); }
  const c = data.aiCall || {};
  const dn = rt('aicfg_daynames'); // массив [Пн..Вс]
  const days = Array.isArray(c.days) ? c.days.slice() : [1, 2, 3, 4, 5];
  const chips = [1, 2, 3, 4, 5, 6, 7].map(d => `<button type="button" class="aicfg-day${days.includes(d) ? ' on' : ''}" data-day="${d}">${dn[d - 1]}</button>`).join('');
  const ownTag = data.aiCallOwn ? `<span class="aicfg-tag own">${rt('aicfg_own')}</span>` : `<span class="aicfg-tag inh">${rt('aicfg_inherited')}</span>`;
  mkDecodeModal(`<div class="aicfg">
    <div class="aicfg-h"><h2>${rt('aicfg_title')}</h2>${ownTag}</div>
    <label class="db-lb">${rt('aicfg_agent')}</label>
    <input class="field" id="acf-agent" maxlength="60" placeholder="${rt('aicfg_agent_ph')}" value="${esc(c.agentName || '')}">
    <div class="aicfg-hint">${rt('aicfg_agent_hint')}</div>
    <label class="db-lb">${rt('aicfg_mission')}</label>
    <textarea class="field" id="acf-mission" rows="3" maxlength="1200" placeholder="…">${esc(c.companyMission || '')}</textarea>
    <div class="aicfg-hint">${rt('aicfg_mission_hint')}</div>
    <label class="db-lb">${rt('aicfg_hours')}</label>
    <div class="row" style="gap:10px;align-items:center"><input class="field" id="acf-from" type="time" value="${esc(c.hoursFrom || '10:00')}" style="width:130px"><span class="muted">—</span><input class="field" id="acf-to" type="time" value="${esc(c.hoursTo || '19:00')}" style="width:130px"></div>
    <label class="db-lb">${rt('aicfg_days')}</label>
    <div class="aicfg-days" id="acf-days">${chips}</div>
    <div class="row" style="gap:14px;flex-wrap:wrap;margin-top:6px">
      <div style="flex:1;min-width:150px"><label class="db-lb">${rt('aicfg_maxdur')}</label>
        <input class="field" id="acf-maxdur" type="number" min="1" max="30" value="${c.maxDurationMin || 10}"><div class="aicfg-hint">${rt('aicfg_maxdur_hint')}</div></div>
      <div style="flex:1;min-width:150px"><label class="db-lb">${rt('aicfg_retry_after')}</label>
        <input class="field" id="acf-retryafter" type="number" min="5" max="1440" value="${c.retryAfterMin || 60}"><div class="aicfg-hint">${rt('aicfg_retry_after_hint')}</div></div>
      <div style="flex:1;min-width:150px"><label class="db-lb">${rt('aicfg_retry_count')}</label>
        <input class="field" id="acf-retrycount" type="number" min="1" max="10" value="${c.retryCount || 3}"><div class="aicfg-hint">${rt('aicfg_retry_count_hint')}</div></div>
    </div>
    <label class="db-lb">${rt('aicfg_offhours')}</label>
    <select class="field" id="acf-offhours"><option value="defer"${c.offHoursCallback !== 'call' ? ' selected' : ''}>${rt('aicfg_offhours_defer')}</option><option value="call"${c.offHoursCallback === 'call' ? ' selected' : ''}>${rt('aicfg_offhours_call')}</option></select>
    <div class="aicfg-hint">${rt('aicfg_offhours_hint')}</div>
    <div class="db-modal-foot"><button class="btn ghost" id="acf-applyall">${rt('aicfg_apply_all')}</button><button class="btn" id="acf-save">${rt('aicfg_save')}</button></div>
  </div>`, true);
  const sel = new Set(days);
  $$('#acf-days .aicfg-day').forEach(b => b.onclick = () => { const d = +b.dataset.day; if (sel.has(d)) sel.delete(d); else sel.add(d); b.classList.toggle('on'); });
  const collect = () => ({
    agentName: ($('#acf-agent').value || '').trim(),
    companyMission: ($('#acf-mission').value || '').trim(),
    hoursFrom: $('#acf-from').value || '10:00', hoursTo: $('#acf-to').value || '19:00',
    days: Array.from(sel).sort((a, b) => a - b),
    maxDurationMin: +$('#acf-maxdur').value || 10, retryAfterMin: +$('#acf-retryafter').value || 60,
    retryCount: +$('#acf-retrycount').value || 3, offHoursCallback: $('#acf-offhours').value,
  });
  const validate = a => { if (!a.days.length) { toast(rt('aicfg_err_days')); return false; } if (a.hoursFrom >= a.hoursTo) { toast(rt('aicfg_err_hours')); return false; } return true; };
  $('#acf-save').onclick = async () => {
    const a = collect(); if (!validate(a)) return;
    try { await api('/api/vacancies/' + id + '/process', { method: 'PUT', body: JSON.stringify({ aiCall: a }) }); toast(rt('common_saved')); closeDecodeModal(); }
    catch (e) { toast(e.message); }
  };
  $('#acf-applyall').onclick = async () => {
    const a = collect(); if (!validate(a)) return;
    if (!confirm(rt('aicfg_apply_all_confirm'))) return;
    try { const r = await api('/api/vacancies/ai-call/apply-all', { method: 'POST', body: JSON.stringify({ aiCall: a }) }); toast(rt('aicfg_applied').replace('{n}', r.count)); closeDecodeModal(); }
    catch (e) { toast(e.message); }
  };
}
// ---------- Вкладка «Кандидаты» — кандидаты только этой должности ----------
async function renderVacCandidates(body, id) {
  const { candidates } = await api('/api/candidates?lang=' + LANG);
  const list = candidates.filter(c => c.vacancyId === id);
  const colBadge = c => {
    const cls = c.column === 'hired' ? 'cs-hired' : c.column === 'rejected' ? 'cs-rej' : c.column === 'new' ? 'cs-new' : 'cs-stage';
    return `<span class="cand-stage ${cls}">${esc(c.columnTitle)}</span>`;
  };
  // Тег итогового ИИ-анализа (как последняя строка процесса найма): брать / под вопросом / отклонить / в процессе
  const aiTag = c => {
    if (!c.final || !c.final.verdict) return `<span class="ai-tag pending">${rt('ai_tag_pending')}</span>`;
    const v = c.final.verdict, cls = v === 'hire' ? 'good' : v === 'reject' ? 'bad' : 'mid';
    const lbl = v === 'hire' ? rt('ai_tag_hire') : v === 'reject' ? rt('ai_tag_reject') : rt('ai_tag_consider');
    return `<span class="ai-tag ${cls}" title="${rt('cand_col_ai')}">${lbl}${c.final.fit != null ? ' · ' + c.final.fit + '%' : ''}</span>`;
  };
  body.innerHTML = `<div class="card">
    <div class="row" style="gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div class="search-wrap grow" style="flex:1;min-width:220px"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="vcand-q" placeholder="${rt('cand_search')}"></div>
      <button class="btn ic-btn" id="vcand-add">${_svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>')}${rt('cand_add')}</button></div>
    <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>${rt('cand_col_name')}</th><th>${rt('cand_col_stage')}</th><th>${rt('cand_col_ai')}</th><th style="text-align:center">${rt('cand_col_tests')}</th><th>${rt('cand_col_date')}</th></tr></thead><tbody id="vcand-rows"></tbody></table></div></div>`;
  const draw = q => {
    const rows = list.filter(c => !q || (c.name + ' ' + c.email + ' ' + (c.tel || '')).toLowerCase().includes(q))
      .map(c => `<tr data-vcid="${c.id}" style="cursor:pointer">
        <td><div class="cand"><span class="avatar" style="width:32px;height:32px;background:${avColor(c.name)}">${esc(initials(c.name, c.email))}</span><div><b>${esc(c.name)}</b><div class="muted" style="font-size:12px">${esc(c.email || c.tel || '')}</div></div></div></td>
        <td>${colBadge(c)}</td><td>${aiTag(c)}</td><td style="text-align:center"><b>${c.testsDone}</b></td><td class="muted">${fmtDate(c.createdAt)}</td></tr>`).join('');
    $('#vcand-rows').innerHTML = rows || `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">${rt('cand_empty')}</td></tr>`;
    $$('[data-vcid]').forEach(r => r.onclick = () => openParticipant(r.dataset.vcid, () => openVacancyPage(id, 'candidates')));
  };
  $('#vcand-q').oninput = e => draw(e.target.value.toLowerCase().trim());
  $('#vcand-add').onclick = () => createCandidate(id, () => openVacancyPage(id, 'candidates'));
  draw('');
}
// Дашборд вакансии — KPI + воронка
function renderVacDashboard(body, b) {
  if (!b.cards.length) { body.innerHTML = `<div class="card stub-card"><p class="muted" style="max-width:460px;text-align:center">${rt('board_empty')}</p></div>`; return; }
  const found = b.cards.length;
  const stagePassed = (c, k) => (c.stages.find(s => s.key === k) || {}).passed === true;
  const started = b.cards.filter(c => c.column !== 'new' || c.stages.some(s => s.passed != null || (s.status && s.status !== 'none'))).length;
  const hired = b.cards.filter(c => c.column === 'hired').length;
  const cnt = k => b.cards.filter(c => stagePassed(c, k)).length;
  const kpi = (n, l) => `<div class="vk-kpi"><div class="vk-num">${n}</div><div class="vk-lbl">${esc(l)}</div></div>`;
  // Компактная воронка горизонтальными полосами — умещается без скролла
  const funnelHtml = funnelBars(b.funnel.map(row => ({ label: row.label, value: row.count })));
  body.innerHTML = `<div class="vk-kpis">
      ${kpi(found, rt('kpi7_cands'))}${kpi(started, rt('kpi7_started'))}${kpi(cnt('result'), rt('kpi7_result'))}${kpi(cnt('tools'), rt('kpi7_tools'))}${kpi(cnt('motivation'), rt('kpi7_motiv'))}${kpi(cnt('knowledge'), rt('kpi7_knowledge'))}${kpi(hired, rt('kpi7_hired'))}</div>
    <div class="card vk-compact" style="margin-top:12px;padding:16px 20px"><div class="cfg-h" style="margin-bottom:10px">${rt('funnel_title')}</div>${funnelHtml}</div>`;
}
// Канбан кандидатов
function renderVacKanban(body, b) {
  if (!b.cards.length) { body.innerHTML = `<div class="card stub-card"><p class="muted" style="max-width:460px;text-align:center">${rt('board_empty')}</p></div>`; return; }
  const cols = b.columns.map(col => {
    const cards = b.cards.filter(c => c.column === col.key);
    const cardsHtml = cards.map(kanbanCard).join('');
    return `<div class="kb-col"><div class="kb-col-h">${esc(col.title)}<span class="kb-count">${cards.length}</span></div>
      <div class="kb-drop" data-col="${col.key}">${cardsHtml}</div></div>`;
  }).join('');
  body.innerHTML = `<p class="muted" style="margin:0 0 12px;font-size:13px">${rt('kanban_hint')}</p><div class="kanban">${cols}</div>`;
  wireKanban();
}
function kanbanCard(c) {
  const dots = c.stages.map(s => `<span class="kb-dot ${s.passed === true ? 'ok' : s.passed === false ? 'no' : s.status === 'done' ? 'done' : ''}" title="${esc(s.title)}"></span>`).join('');
  return `<div class="kb-card" draggable="true" data-cid="${c.id}"><b>${esc(c.name)}</b>
    <div class="kb-sub muted">${esc(c.email || c.tel || '')}</div><div class="kb-dots">${dots}</div></div>`;
}
function wireKanban() {
  let dragId = null;
  $$('.kb-card').forEach(card => {
    card.ondragstart = e => { dragId = card.dataset.cid; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
    card.ondragend = () => card.classList.remove('dragging');
    card.onclick = () => { const vid = vacPage.id; openParticipant(card.dataset.cid, () => openVacancyPage(vid, 'kanban')); };
  });
  $$('.kb-drop').forEach(drop => {
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    drop.ondrop = async e => {
      e.preventDefault(); drop.classList.remove('over');
      if (dragId) { await api('/api/participants/' + dragId + '/column', { method: 'POST', body: JSON.stringify({ column: drop.dataset.col }) }); renderVacancyPage(); }
    };
  });
}
// Объявление вакансии (подвкладки: редактор + таблица размещений)
let adSubTab = 'editor';
function adSubTabsHtml() {
  return `<div class="settabs" style="margin-bottom:12px">
    <button class="seg-tab ${adSubTab === 'editor' ? 'on' : ''}" data-adtab="editor">${rt('adp_tab_editor')}</button>
    <button class="seg-tab ${adSubTab === 'list' ? 'on' : ''}" data-adtab="list">${rt('adp_tab_list')}</button></div>`;
}
async function renderVacAd(body, id) {
  if (adSubTab === 'list') return renderVacAdList(body, id);
  await renderVacAdEditor(body, id);
}
// Таблица размещений объявления: портал, ссылка с меткой, статистика по этапам
async function renderVacAdList(body, id) {
  let placements = [];
  try { placements = (await api('/api/vacancies/' + id + '/placements?lang=' + LANG)).placements || []; }
  catch (e) { placements = []; }
  const draw = q => {
    const list = placements.filter(p => !q || (p.portal + ' ' + (p.title || '') + ' ' + (p.url || '')).toLowerCase().includes(q));
    const rows = list.map(p => `<tr>
      <td><b>${esc(p.portal)}</b>${p.url ? `<div><a href="${esc(p.url)}" target="_blank" class="muted" style="font-size:11.5px">${esc(p.url.slice(0, 44))}${p.url.length > 44 ? '…' : ''}</a></div>` : ''}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.title || '—')}</td>
      <td><button class="btn ghost xs ic-btn" onclick="copyLink('${esc(p.link)}')" title="${esc(p.link)}">${ICON_COPY}${t('ak_copy')}</button></td>
      <td style="text-align:center"><b>${p.stats.responses}</b></td>
      <td style="text-align:center">${p.stats.result}</td><td style="text-align:center">${p.stats.tools}</td>
      <td style="text-align:center">${p.stats.motivation}</td><td style="text-align:center">${p.stats.knowledge}</td>
      <td style="text-align:center"><b>${p.stats.hired}</b></td>
      <td style="text-align:center;color:${p.stats.conversion > 0 ? 'var(--good)' : 'var(--muted)'}"><b>${p.stats.conversion}%</b></td>
      <td><button class="btn ghost danger xs" data-pl-del="${p.id}">×</button></td></tr>`).join('');
    $('#vannp-rows').innerHTML = rows || `<tr><td colspan="11" class="muted" style="text-align:center;padding:26px">${rt('adp_empty')}</td></tr>`;
    $$('[data-pl-del]').forEach(b => b.onclick = async () => { if (!confirm('×?')) return; await api('/api/vacancies/' + id + '/placements/' + b.dataset.plDel, { method: 'DELETE' }); renderVacAdList(body, id); });
  };
  body.innerHTML = `${adSubTabsHtml()}
    <div class="card">
      <div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:flex-end">
        <div><label class="lbl">${rt('adp_portal')}</label><input class="field sm" id="vannp-portal" placeholder="pracuj.pl / OLX / LinkedIn…" style="width:170px"></div>
        <div><label class="lbl">${rt('adp_title')}</label><input class="field sm" id="vannp-title" style="width:200px"></div>
        <div style="flex:1;min-width:200px"><label class="lbl">${rt('adp_url')}</label><input class="field sm" id="vannp-url" placeholder="https://…"></div>
        <button class="btn sm" id="vannp-add">+ ${rt('adp_add')}</button></div>
      <div class="row" style="margin-bottom:10px"><div class="search-wrap grow"><span class="search-ic">${ICON_SEARCH}</span><input class="field sm" id="vannp-q" placeholder="${t('search')}…"></div></div>
      <p class="muted" style="font-size:12px;margin:0 0 10px">${rt('adp_hint')}</p>
      <div class="table-wrap" style="box-shadow:none"><table>
        <thead><tr><th>${rt('adp_portal')}</th><th>${rt('adp_title')}</th><th>${rt('adp_link')}</th><th>${rt('adp_resp')}</th><th>Резалт</th><th>Тулс</th><th>${rt('adp_motiv')}</th><th>${rt('adp_knowl')}</th><th>${rt('kpi7_hired')}</th><th>${rt('adp_conv')}</th><th></th></tr></thead>
        <tbody id="vannp-rows"></tbody></table></div></div>`;
  $$('[data-adtab]').forEach(b => b.onclick = () => { adSubTab = b.dataset.adtab; renderVacAd(body, id); });
  $('#vannp-add').onclick = async () => {
    try {
      await api('/api/vacancies/' + id + '/placements', { method: 'POST', body: JSON.stringify({ portal: $('#vannp-portal').value.trim(), title: $('#vannp-title').value.trim(), url: $('#vannp-url').value.trim() }) });
      toast(rt('common_saved')); renderVacAdList(body, id);
    } catch (e) { toast(e.message); }
  };
  $('#vannp-q').oninput = e => draw(e.target.value.toLowerCase().trim());
  draw('');
}
async function renderVacAdEditor(body, id) {
  const { vacancy } = await api('/api/vacancies/' + id + '/full');
  // Руководящая должность — всегда ищем Виннера; рядовая — Виннер или Дуер на выбор
  const isBoss = /руковод|директор|начальн|заведующ|управляющ|главн|kierownik|dyrektor|szef|prezes|head|chief|director|team lead|supervisor|ceo|coo|cto/i.test(vacancy.name || '');
  const targetOpts = (isBoss ? [['performer', rt('vac_target_performer')]] : [['performer', rt('vac_target_performer')], ['executor', rt('vac_target_executor')]])
    .map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
  body.innerHTML = `${adSubTabsHtml()}<div class="card">
    <div class="row" style="gap:8px;align-items:flex-end;margin-bottom:8px">
      <div style="flex:1;max-width:340px"><label class="lbl">${rt('vac_ad_target')}</label><select class="field" id="vann-target" ${isBoss ? 'disabled' : ''}>${targetOpts}</select>
      ${isBoss ? `<div class="muted" style="font-size:12px;margin-top:4px">${rt('vac_target_boss_hint')}</div>` : ''}</div>
      <button class="btn soft" id="vann-gen">${rt('vac_ad_gen')}</button></div>
    <label class="lbl">${rt('vac_ad_manual')}</label>
    <textarea class="field" id="vann-text" rows="16" style="font-family:inherit;min-height:340px">${esc(vacancy.adText || '')}</textarea>
    <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn" id="vann-save">${rt('vac_save')}</button>
      <button class="btn soft" id="vann-publish">${vacancy.published ? rt('vac_published') + ' ✓' : rt('vac_publish')}</button></div>
    <div id="publish-link"></div></div>`;
  $$('[data-adtab]').forEach(b => b.onclick = () => { adSubTab = b.dataset.adtab; renderVacAd(body, id); });
  $('#vann-gen').onclick = async () => {
    const bt = $('#vann-gen'); bt.disabled = true; const o = bt.textContent; bt.innerHTML = `<span class="db-spin"></span> ${rt('common_gen')}`;
    try {
      const d = await api('/api/vacancies/' + id + '/generate-ad', { method: 'POST', body: JSON.stringify({ lang: vacancy.lang, target: $('#vann-target').value }) });
      $('#vann-text').value = stripTags(d.ad);
      if (d.ai === false) toast(rt('vac_ad_fallback'));
    } catch (e) { toast(e.message); }
    bt.disabled = false; bt.textContent = o;
  };
  const saveAd = () => api('/api/vacancies/' + id + '/config', { method: 'PUT', body: JSON.stringify({ adText: $('#vann-text').value }) });
  $('#vann-save').onclick = async () => { await saveAd(); toast(rt('common_saved')); };
  $('#vann-publish').onclick = async () => {
    await saveAd();
    await api('/api/vacancies/' + id + '/config', { method: 'PUT', body: JSON.stringify({ published: true }) });
    const a = await api('/api/anketas', { method: 'POST', body: JSON.stringify({ title: vacancy.name, vacancyId: id, tests: ['result', 'tools'], description: $('#vann-text').value }) });
    const url = location.origin + '/a/' + a.anketa.slug;
    $('#publish-link').innerHTML = `<div class="share-block" style="margin-top:12px"><div class="lbl">${rt('vac_apply_open')}</div>
      <div class="row" style="gap:6px;margin-top:6px"><input class="field sm" style="flex:1" readonly value="${esc(url)}"><button class="btn ghost xs" onclick="copyLink('${url}')">${rt('common_copy')}</button></div></div>`;
    toast(rt('vac_publish_done'));
  };
}
function stripTags(html) {
  let s = String(html || '').replace(/<li[^>]*>/gi, '\n• ').replace(/<\/(p|h2|h3|div|ul|li)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
  const d = document.createElement('div'); d.innerHTML = s;
  return (d.textContent || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------- Конструктор проверки знаний (несколько тестов на вакансию, подвкладки) ----------
let knQuestions = [];
let knActiveKt = null;
async function renderVacKnowledge(body, vacId) {
  const { vacancy } = await api('/api/vacancies/' + vacId + '/full');
  const kts = vacancy.knowledgeTests || [];
  if (!kts.length) knActiveKt = 'new';
  else if (knActiveKt !== 'new' && !kts.some(k => k.id === knActiveKt)) knActiveKt = kts[0].id;
  const cur = knActiveKt === 'new' ? { id: null, name: '', questions: [], passScore: 60 } : (kts.find(k => k.id === knActiveKt) || { questions: [], passScore: 60 });
  knQuestions = JSON.parse(JSON.stringify(cur.questions || []));
  const tabs = kts.map(k => `<button class="seg-tab ${knActiveKt === k.id ? 'on' : ''}" data-kt-tab="${k.id}">${esc(k.name)}</button>`).join('')
    + `<button class="seg-tab ${knActiveKt === 'new' ? 'on' : ''}" data-kt-tab="new">+ ${rt('kn_new_test')}</button>`;
  body.innerHTML = `<div class="settabs" style="margin-bottom:12px">${tabs}</div>
    <div class="card">
    <div class="row" style="gap:10px;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap">
      <div><label class="lbl">${rt('kn_name')}</label><input class="field sm" id="kn-name" value="${esc(cur.name || '')}" placeholder="${rt('kn_name_ph')}" style="width:230px"></div>
      <div><label class="lbl">${rt('kn_pass')}</label><input class="field sm" id="kn-pass" type="number" min="0" max="100" value="${cur.passScore || 60}" style="width:110px"></div>
      <button class="btn soft sm" id="kn-ai">${AI_IC} ${rt('kn_ai')}</button>
      ${knActiveKt !== 'new' ? `<button class="btn ghost danger sm" id="kn-del">${rt('kn_del_test')}</button>` : ''}
      <button class="btn sm" id="kn-save" style="margin-left:auto">${rt('kn_save')}</button></div>
    <div id="kn-list"></div>
    <div class="row" style="margin-top:12px"><button class="btn soft sm" id="kn-add">+ ${rt('kn_add')}</button></div></div>`;
  $$('[data-kt-tab]').forEach(b => b.onclick = () => { knActiveKt = b.dataset.ktTab; renderVacKnowledge(body, vacId); });
  $('#kn-add').onclick = () => { syncKnFromDom(); knQuestions.push({ id: 'q' + Date.now().toString(36), text: '', type: 'single', image: '', video: '', options: [{ text: '', correct: true }, { text: '', correct: false }] }); redrawKn(); };
  $('#kn-save').onclick = async () => {
    syncKnFromDom();
    const d = await api('/api/vacancies/' + vacId + '/knowledge', { method: 'PUT', body: JSON.stringify({ ktId: knActiveKt === 'new' ? undefined : knActiveKt, name: $('#kn-name').value.trim(), questions: knQuestions, passScore: +$('#kn-pass').value }) });
    knActiveKt = d.ktId; toast(rt('common_saved')); renderVacKnowledge(body, vacId);
  };
  // Удаление теста — с подтверждением в модальном окне
  const kd = $('#kn-del'); if (kd) kd.onclick = () => {
    openModal(`<h2 style="margin:0 0 8px">${rt('kn_del_test')}?</h2>
      <p class="muted" style="margin:0 0 16px">${rt('kn_del_confirm')} «${esc(cur.name || '')}»</p>
      <div class="row" style="gap:8px"><button class="btn ghost danger" id="kn-del-yes">${rt('kn_del_test')}</button>
      <button class="btn ghost" onclick="closeModal()">${rt('common_close')}</button></div>`, true);
    $('#kn-del-yes').onclick = async () => {
      await api('/api/vacancies/' + vacId + '/knowledge/' + knActiveKt, { method: 'DELETE' });
      knActiveKt = null; closeModal(); toast(rt('common_saved')); renderVacKnowledge(body, vacId);
    };
  };
  // Составить тест ИИ по материалам вакансии (заявка + объявление)
  $('#kn-ai').onclick = async () => {
    const b = $('#kn-ai'); b.disabled = true; const o = b.textContent; b.textContent = rt('common_gen');
    try {
      const d = await api('/api/vacancies/' + vacId + '/knowledge-ai', { method: 'POST', body: JSON.stringify({ ktId: knActiveKt === 'new' ? undefined : knActiveKt }) });
      knActiveKt = d.ktId; toast(rt('common_saved')); renderVacKnowledge(body, vacId);
    } catch (e) { toast(e.message); b.disabled = false; b.textContent = o; }
  };
  redrawKn();
}
function knQuestionHtml(q, qi) {
  const opts = q.options.map((o, oi) => `<div class="kn-opt">
      <input type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="kn-c-${qi}" ${o.correct ? 'checked' : ''} data-kc="${qi}-${oi}" title="${rt('kn_correct')}">
      <input class="field sm" data-ko="${qi}-${oi}" value="${esc(o.text)}" placeholder="${rt('kn_opt')} ${oi + 1}">
      <button class="btn ghost xs danger ic-btn" data-kdel="${qi}-${oi}">×</button></div>`).join('');
  const media = `<div class="kn-media">
    ${q.image ? `<div class="kn-mprev"><img src="${esc(q.image)}"><button class="kn-mx" data-kimgdel="${qi}" title="${rt('kn_remove')}">×</button></div>` : ''}
    ${q.video ? `<div class="kn-mprev"><video src="${esc(q.video)}" controls></video><button class="kn-mx" data-kviddel="${qi}" title="${rt('kn_remove')}">×</button></div>` : ''}</div>`;
  return `<div class="kn-q" data-qi="${qi}">
    <div class="row" style="gap:8px;align-items:center"><b style="min-width:22px">${qi + 1}.</b>
      <input class="field" data-kq="${qi}" value="${esc(q.text)}" placeholder="${rt('kn_q')}" style="flex:1">
      <select class="field sm" data-kt="${qi}" style="width:150px"><option value="single" ${q.type === 'single' ? 'selected' : ''}>${rt('kn_single')}</option><option value="multi" ${q.type === 'multi' ? 'selected' : ''}>${rt('kn_multi')}</option></select>
      <button class="btn ghost xs danger ic-btn" data-qdel="${qi}">${ICON_TRASH}</button></div>
    ${media}
    <div class="row" style="gap:8px;margin-top:8px">
      <label class="btn ghost xs kn-up">${rt('kn_upload_img')}<input type="file" accept="image/*" hidden data-kupimg="${qi}"></label>
      <label class="btn ghost xs kn-up">${rt('kn_upload_vid')}<input type="file" accept="video/*" hidden data-kupvid="${qi}"></label></div>
    <div class="kn-opts">${opts}</div>
    <button class="btn ghost xs" data-koadd="${qi}" style="margin-top:6px">+ ${rt('kn_add_opt')}</button></div>`;
}
function syncKnFromDom() {
  knQuestions.forEach((q, qi) => {
    const qe = document.querySelector('[data-kq="' + qi + '"]'); if (qe) q.text = qe.value;
    const te = document.querySelector('[data-kt="' + qi + '"]'); if (te) q.type = te.value;
    q.options.forEach((o, oi) => {
      const oe = document.querySelector('[data-ko="' + qi + '-' + oi + '"]'); if (oe) o.text = oe.value;
      const ce = document.querySelector('[data-kc="' + qi + '-' + oi + '"]'); if (ce) o.correct = ce.checked;
    });
  });
}
async function uploadMedia(file) {
  const dataUrl = await new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(file); });
  const d = await api('/api/upload', { method: 'POST', body: JSON.stringify({ dataUrl, name: file.name }) });
  return d.url;
}
function wireKnList() {
  $$('[data-qdel]').forEach(b => b.onclick = () => { syncKnFromDom(); knQuestions.splice(+b.dataset.qdel, 1); redrawKn(); });
  $$('[data-koadd]').forEach(b => b.onclick = () => { syncKnFromDom(); knQuestions[+b.dataset.koadd].options.push({ text: '', correct: false }); redrawKn(); });
  $$('[data-kdel]').forEach(b => b.onclick = () => { syncKnFromDom(); const [qi, oi] = b.dataset.kdel.split('-').map(Number); knQuestions[qi].options.splice(oi, 1); redrawKn(); });
  $$('[data-kt]').forEach(s => s.onchange = () => { syncKnFromDom(); redrawKn(); });
  $$('[data-kimgdel]').forEach(b => b.onclick = () => { syncKnFromDom(); knQuestions[+b.dataset.kimgdel].image = ''; redrawKn(); });
  $$('[data-kviddel]').forEach(b => b.onclick = () => { syncKnFromDom(); knQuestions[+b.dataset.kviddel].video = ''; redrawKn(); });
  $$('[data-kupimg]').forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return; syncKnFromDom(); toast(rt('kn_uploading'));
    try { knQuestions[+inp.dataset.kupimg].image = await uploadMedia(f); redrawKn(); } catch (e) { toast(e.message); }
  });
  $$('[data-kupvid]').forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return; syncKnFromDom(); toast(rt('kn_uploading'));
    try { knQuestions[+inp.dataset.kupvid].video = await uploadMedia(f); redrawKn(); } catch (e) { toast(e.message); }
  });
}
function redrawKn() { $('#kn-list').innerHTML = knQuestions.length ? knQuestions.map((q, qi) => knQuestionHtml(q, qi)).join('') : `<p class="muted">${rt('kn_empty')}</p>`; wireKnList(); }

// ---------- Процесс найма кандидата (workflow) ----------
let wfPid = null, wfData = null, wfMeta = null;
async function openWorkflow(pid) {
  wfPid = pid;
  wfMeta = await ensureRecMeta();
  await loadWorkflow();
}
async function loadWorkflow() {
  wfData = await api('/api/participants/' + wfPid + '/workflow?lang=' + LANG);
  renderWorkflow();
}
function gateBtns(s) {
  const p = s.passed;
  if (s.skipped) return `<div class="wf-gate"><span class="wf-status">${rt('wf_skipped')}</span>
    <button class="wf-gbtn ghost" data-gate="${s.key}" data-val="unskip" title="${rt('wf_unskip')}">↩ ${rt('wf_reset')}</button></div>`;
  return `<div class="wf-gate">
    <button class="wf-gbtn ${p === true ? 'on-pass' : ''}" data-gate="${s.key}" data-val="1">${rt('wf_pass')}</button>
    <button class="wf-gbtn ${p === false ? 'on-fail' : ''}" data-gate="${s.key}" data-val="0">${rt('wf_fail')}</button>
    ${p != null ? `<button class="wf-gbtn ghost" data-gate="${s.key}" data-val="reset">${rt('wf_reset')}</button>`
      : `<button class="wf-gbtn ghost" data-gate="${s.key}" data-val="skip" title="${rt('wf_skip')}">✕</button>`}</div>`;
}
function aiNote(a) {
  if (!a) return '';
  const notes = (a.notes || []).map(n => `<li>${esc(n)}</li>`).join('');
  return `<div class="ai-note tone-${a.tone || 'mid'}"><div class="ai-h">${AI_IC} ${rt('wf_suggested')}: ${esc(a.verdict || '')}</div>${notes ? `<ul>${notes}</ul>` : ''}</div>`;
}
function renderWorkflow() {
  const d = wfData;
  const stages = d.stages.map((s, i) => {
    let inner = '';
    const stTag = st => `<span class="wf-status ${st}">${st === 'done' ? rt('wf_pass') : st === 'in_progress' ? t('tst_prog') : rt('wf_pending')}</span>`;
    if (s.kind === 'knowledge' && s.items && s.items.length) {
      // Несколько тестов знаний — показываем каждый со своим статусом и кнопками
      const mkLink = code => code ? `<div class="cstep-link" style="border-top:none;padding-top:4px"><span class="muted">${t('tp_link')}:</span><a href="${location.origin}/t/${code}" target="_blank">${location.origin}/t/${code}</a><button class="btn ghost xs ic-btn" onclick="copyLink('${location.origin}/t/${code}')">${ICON_COPY}${t('ak_copy')}</button></div>` : '';
      inner = (s.analysis ? aiNote(s.analysis) : '') + s.items.map(it => {
        let act = '';
        if (it.status === 'done') act = `<button class="btn ghost xs" data-wfres="${it.testId}">${rt('wf_see_res')}</button>`;
        else if (it.status === 'none') act = `<button class="btn soft xs" data-wfsendkn="${it.ktId}">${t('send_btn')}</button>`;
        else if (it.status === 'sent') act = `<button class="btn soft xs" data-wfresend="${it.testId}">${rt('wf_resend')}</button>`;
        else act = `<span class="muted" style="font-size:12px">${t('tst_prog')}…</span>`;
        return `<div class="wf-kn-item"><div class="row" style="gap:8px;align-items:center"><b style="flex:1;font-size:13px">${esc(it.name)}</b>${it.percent != null ? `<span class="cstep-st ${it.pass ? 'ok' : 'no'}">${it.percent}%</span>` : ''}${act}</div>${it.status !== 'done' && it.status !== 'none' ? mkLink(it.testCode) : ''}</div>`;
      }).join('');
    } else if (s.kind === 'test' || s.kind === 'knowledge') {
      // Тест открывает только кандидат — рекрутёру показываем ссылку с кнопкой копирования
      const linkRow = s.testCode ? `<div class="cstep-link" style="border-top:none;padding-top:4px"><span class="muted">${t('tp_link')}:</span><a href="${location.origin}/t/${s.testCode}" target="_blank">${location.origin}/t/${s.testCode}</a><button class="btn ghost xs ic-btn" onclick="copyLink('${location.origin}/t/${s.testCode}')">${ICON_COPY}${t('ak_copy')}</button></div>` : '';
      if (s.status === 'done') {
        inner = aiNote(s.analysis) + (s.testId ? `<button class="btn ghost sm" data-wfres="${s.testId}">${rt('wf_see_res')}</button>` : '');
      } else if (s.status === 'none') {
        inner = s.key === 'knowledge'
          ? `<p class="muted">${rt('wf_no_test')}</p><button class="btn soft sm" id="wf-send-kn">${rt('wf_send_knowledge')}</button>`
          : `<p class="muted">${rt('wf_no_test')}</p>`;
      } else if (s.status === 'sent') {
        inner = `<p class="muted" style="margin:0 0 8px">${t('tst_wait')}…</p><button class="btn soft sm" data-wfresend="${s.testId}">${rt('wf_resend')}</button>${linkRow}`;
      } else {
        inner = `<p class="muted" style="margin:0 0 8px">${t('tst_prog')}…</p>${linkRow}`;
      }
    } else if (s.kind === 'motivation') {
      const cur = (d.participant && d.participant.workflow && d.participant.workflow.motivation) || {};
      const curA = cur.answers || {};
      const lvlOpts = wfMeta.motivationLevels.map(l => `<option value="${l.key}" ${s.level === l.key ? 'selected' : ''}>${esc(l.label)}</option>`).join('');
      // Шкала уровней + главный принцип методики
      const scaleRows = wfMeta.motivationLevels.map(l => `<li><b>${esc(l.label)}</b> — ${esc(l.desc)}</li>`).join('');
      const guide = `<details class="mq-guide"><summary>${rt('wf_motiv_guide')}</summary>
        <ul>${scaleRows}</ul><p>${rt('wf_motiv_scale_hint')}</p></details>`;
      // Вопросы интервью с подсказками и отметкой «о чём говорит ответ»
      const qBlocks = (wfMeta.motivationQuestions || []).map((q, qi) => mqBlock(q, qi, curA[q.id] || {})).join('');
      inner = `${s.analysis ? aiNote(s.analysis) : ''}${guide}
        <div class="mq-list">${qBlocks}</div>
        <div class="mq-final">
          <div id="wf-motiv-suggest" class="mq-suggest"></div>
          <div class="mq-final-row">
            <div><label class="lbl">${rt('wf_motiv_level')}</label>
              <select class="field sm" id="wf-motiv-level" style="width:100%"><option value="">—</option>${lvlOpts}</select></div>
            <div><label class="lbl">${rt('wf_motiv_notes')}</label>
              <textarea class="field" id="wf-motiv-notes" rows="2">${esc(cur.notes || '')}</textarea></div>
          </div>
          <button class="btn sm" id="wf-motiv-save" style="align-self:flex-start">${rt('wf_motiv_save')}</button>
        </div>`;
    } else if (s.kind === 'references') {
      inner = `${s.analysis ? aiNote(s.analysis) : ''}<button class="btn soft sm" id="wf-ref-open">${rt('wf_ref_save')}…</button>`;
    }
    return `<div class="wf-stage ${s.passed === true ? 'passed' : s.passed === false ? 'failed' : ''}${s.skipped ? ' skipped' : ''}">
      <div class="wf-top"><span class="wf-num">${i + 1}</span><b>${esc(s.title)}</b>${gateBtns(s)}</div>
      ${s.skipped ? '' : `<div class="wf-body">${inner}</div>`}</div>`;
  });
  const dec = d.decision;
  const auto = d.autoDecision || {};
  const rec = !dec ? auto.decision : null; // рекомендация ИИ, если решение ещё не принято
  const decCls = dec === 'hired' ? 'd-hired' : dec === 'rejected' ? 'd-rej' : rec === 'hired' ? 'd-rec-hire' : rec === 'rejected' ? 'd-rec-rej' : '';
  const headline = dec === 'hired' ? rt('wf_hired') : dec === 'rejected' ? rt('wf_rejected') : rec ? esc(auto.verdict || '') : rt('wf_inprogress');
  const decBox = `<div class="wf-decision ${decCls}">
      <div class="wf-dec-h">${dec ? rt('wf_decision') + ': ' : rec ? AI_IC + ' ' : rt('wf_decision') + ': '}<b>${headline}</b></div>
      ${auto.notes && auto.notes.length ? `<p class="muted" style="margin:4px 0 0">${esc(auto.notes.join(' '))}</p>` : ''}
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn ${dec === 'hired' ? '' : 'soft'} sm ${rec === 'hired' ? 'wf-rec-hire' : ''}" data-dec="hired">${rt('wf_hired')}</button>
        <button class="btn ghost danger sm ${rec === 'rejected' ? 'wf-rec-rej' : ''}" data-dec="rejected">${rt('wf_rejected')}</button>
        ${dec ? `<button class="btn ghost sm" data-dec="reset">${rt('wf_reset')}</button>` : ''}</div></div>`;
  // Необязательные оценки (Sales, IQ/Логис) — после Tools, не блокируют пайплайн
  const optItems = (d.optional || []).map(o => {
    let inner;
    const linkRow = o.testCode ? `<div class="cstep-link" style="border-top:none;padding-top:4px"><span class="muted">${t('tp_link')}:</span><a href="${location.origin}/t/${o.testCode}" target="_blank">${location.origin}/t/${o.testCode}</a><button class="btn ghost xs ic-btn" onclick="copyLink('${location.origin}/t/${o.testCode}')">${ICON_COPY}${t('ak_copy')}</button></div>` : '';
    if (o.status === 'done') inner = (o.analysis ? `<div class="ai-note tone-mid"><div class="ai-h">${AI_IC} ${esc(o.analysis.verdict || '')}</div>${(o.analysis.notes && o.analysis.notes.length) ? `<ul>${o.analysis.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</div>` : '') + (o.testId ? `<button class="btn ghost sm" data-wfres="${o.testId}">${rt('wf_see_res')}</button>` : '');
    else if (o.status === 'none') inner = `<button class="btn soft sm" data-sendopt="${o.key}">${rt('wf_send_opt')}</button>`;
    else if (o.status === 'sent') inner = `<p class="muted" style="margin:0 0 8px">${t('tst_wait')}…</p><button class="btn soft sm" data-wfresend="${o.testId}">${rt('wf_resend')}</button>${linkRow}`;
    else inner = `<p class="muted" style="margin:0 0 8px">${t('tst_prog')}…</p>${linkRow}`;
    const skipCtl = o.skipped
      ? `<span class="wf-status">${rt('wf_skipped')}</span><button class="wf-gbtn ghost" data-gate="opt:${o.key}" data-val="unskip" title="${rt('wf_unskip')}">↩ ${rt('wf_reset')}</button>`
      : o.status !== 'done' ? `<button class="wf-gbtn ghost" data-gate="opt:${o.key}" data-val="skip" title="${rt('wf_skip')}">✕</button>` : '';
    return `<div class="wf-stage wf-opt${o.skipped ? ' skipped' : ''}"><div class="wf-top"><span class="cstep-ic res-${o.key}">${TEST_ICON[o.key] || ''}</span><b>${esc(o.title)}</b><div class="wf-gate" style="margin-left:auto">${skipCtl}</div></div>${o.skipped ? '' : `<div class="wf-body">${inner}</div>`}</div>`;
  }).join('');
  const optBlock = optItems ? `<div class="wf-opt-h">${rt('wf_optional_h')}</div>${optItems}` : '';
  // вставить блок необязательных оценок (Логис/Sales) СРАЗУ ПОСЛЕ этапа Tools
  if (optBlock) {
    const toolsIdx = d.stages.findIndex(s => s.key === 'tools');
    if (toolsIdx >= 0) stages.splice(toolsIdx + 1, 0, optBlock); else stages.push(optBlock);
  }
  const nm = ((d.participant.name || '') + ' ' + (d.participant.surname || '')).trim() || d.participant.email;
  openModal(`<div class="report-head"><h2 style="margin:0;font-size:22px">${rt('wf_title')}</h2><span class="tag">${esc(nm)}</span></div>
    <div class="wf-wrap"><div class="wf-list">${stages.join('')}</div>${decBox}</div>`, true);
  $$('[data-sendopt]').forEach(b => b.onclick = async () => {
    try { const d2 = await api('/api/participants/' + wfPid + '/send-test', { method: 'POST', body: JSON.stringify({ type: b.dataset.sendopt }) }); if (d2.balance) state.user = d2.balance; toast(rt('common_saved')); loadWorkflow(); }
    catch (e) { toast(e.message); }
  });
  // wiring
  $$('[data-gate]').forEach(b => b.onclick = async () => {
    const val = b.dataset.val;
    const body = val === 'skip' ? { stage: b.dataset.gate, skip: true }
      : val === 'unskip' ? { stage: b.dataset.gate, skip: false }
      : { stage: b.dataset.gate, passed: val === 'reset' ? null : val === '1' };
    await api('/api/participants/' + wfPid + '/gate', { method: 'POST', body: JSON.stringify(body) });
    loadWorkflow();
  });
  $$('[data-dec]').forEach(b => b.onclick = async () => {
    await api('/api/participants/' + wfPid + '/gate', { method: 'POST', body: JSON.stringify({ decision: b.dataset.dec }) });
    loadWorkflow();
  });
  $$('[data-wfres]').forEach(b => b.onclick = () => openReport(b.dataset.wfres));
  $$('[data-wfresend]').forEach(b => b.onclick = async () => {
    try { await api('/api/tests/' + b.dataset.wfresend + '/resend', { method: 'POST' }); toast(rt('wf_resent')); loadWorkflow(); }
    catch (e) { toast(e.message); }
  });
  const sk = $('#wf-send-kn'); if (sk) sk.onclick = async () => {
    try { await api('/api/participants/' + wfPid + '/send-knowledge', { method: 'POST' }); toast(rt('common_saved')); loadWorkflow(); }
    catch (e) { toast(e.message); }
  };
  $$('[data-wfsendkn]').forEach(b => b.onclick = async () => {
    try { await api('/api/participants/' + wfPid + '/send-knowledge', { method: 'POST', body: JSON.stringify({ ktId: b.dataset.wfsendkn }) }); toast(rt('common_saved')); loadWorkflow(); }
    catch (e) { toast(e.message); }
  });
  const ms = $('#wf-motiv-save'); if (ms) ms.onclick = async () => {
    const answers = {};
    $$('[data-mq]').forEach(el => { answers[el.dataset.mq] = answers[el.dataset.mq] || {}; answers[el.dataset.mq].text = el.value; });
    $$('[data-mmark]').forEach(el => { answers[el.dataset.mmark] = answers[el.dataset.mmark] || {}; answers[el.dataset.mmark].mark = el.dataset.val || ''; });
    await api('/api/participants/' + wfPid + '/motivation', { method: 'POST', body: JSON.stringify({ level: $('#wf-motiv-level').value, answers, notes: $('#wf-motiv-notes').value }) });
    toast(rt('common_saved')); loadWorkflow();
  };
  // Живая подсказка уровня по отметкам ответов (out=убеждение, mix=выгода, in=деньги)
  const updateSuggest = () => mqUpdateSuggest(wfMeta);
  wireMqMarks(updateSuggest);
  updateSuggest();
  const ro = $('#wf-ref-open'); if (ro) ro.onclick = () => openReferencesForm(wfPid, wfData, () => loadWorkflow());
}
window.openWorkflow = openWorkflow;

// ---------- Форма референсов (вопросы с подсказками методики; открывается из карточки кандидата) ----------
// Поллинг ИИ-звонка референса: ждём завершения звонка Vapi, затем обновляем карточку (справка заполнится сама)
const refAiPolls = {};
function pollRefAiCall(pid, refIndex) {
  const key = pid + ':' + refIndex;
  if (refAiPolls[key]) clearInterval(refAiPolls[key]);
  let tries = 0;
  refAiPolls[key] = setInterval(async () => {
    tries++;
    try {
      const d = await api('/api/participants/' + pid + '/references/ai-call/' + refIndex);
      if (d.status === 'done') { clearInterval(refAiPolls[key]); delete refAiPolls[key]; toast(rt('refai_done')); if (modalPart && modalPart.id === pid) refreshCandidateCard(); }
      else if (d.status === 'none' || tries > 90) { clearInterval(refAiPolls[key]); delete refAiPolls[key]; } // ~12 минут максимум
    } catch (e) {}
  }, 8000);
}
// refIndex — номер контакта руководителя из «Резалта»: своя форма справок на каждого
async function openReferencesForm(pid, wf, onSaved, refIndex) {
  pid = pid || wfPid; wf = wf || wfData;
  const meta = await ensureRecMeta();
  const wfRefs = (wf && wf.participant && wf.participant.workflow && wf.participant.workflow.references) || {};
  let cur = wfRefs.answers || {};
  let contact = null;
  if (refIndex != null) {
    cur = (wfRefs.multi && wfRefs.multi[refIndex] && wfRefs.multi[refIndex].answers) || {};
    const refStage = ((wf && wf.stages) || []).find(s => s.kind === 'references');
    const r = refStage && refStage.refs && refStage.refs.find(x => x.i === refIndex);
    contact = r ? r.contact : null;
    // предзаполнить «от кого получаем референс» контактом кандидата
    if (contact && !cur.r1) cur = Object.assign({}, cur, { r1: [((contact.name || '') + ' ' + (contact.surname || '')).trim(), contact.position, contact.phone].filter(Boolean).join(', ') });
  }
  const qHtml = meta.referenceQuestions.map((q, qi) => {
    let ctrl;
    if (q.kind === 'open') ctrl = `<textarea class="field" data-rf="${q.id}" rows="2">${esc(cur[q.id] || '')}</textarea>`;
    else if (q.kind === 'num10') ctrl = `<select class="field sm" data-rf="${q.id}" style="width:120px"><option value="">—</option>${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${String(cur[q.id]) === String(i + 1) ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>`;
    else ctrl = `<select class="field" data-rf="${q.id}"><option value="">—</option>${q.opts.map((o, i) => `<option value="${i}" ${String(cur[q.id]) === String(i) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    return `<div class="ref-q mq-item"><div class="mq-q"><b>${qi + 1}.</b> ${esc(q.text)}</div>
      ${q.hint ? `<details class="mq-hint"><summary>${rt('wf_motiv_q_hint')}</summary><p>${esc(q.hint)}</p></details>` : ''}${ctrl}</div>`;
  }).join('');
  openModal(`<div class="report-head"><h2 style="margin:0;font-size:21px">${rt('wf_ref_save')}</h2>
      ${contact ? `<span class="tag">${esc(((contact.name || '') + ' ' + (contact.surname || '')).trim())}${contact.phone ? ' · ' + esc(contact.phone) : ''}</span>` : ''}</div>
    <div class="ref-wrap">
      <div class="mq-guide" style="margin-bottom:12px"><b>${rt('ref_intro_h')}</b><p style="margin:6px 0 0">${rt('ref_intro')}</p></div>
      ${qHtml}
      <div class="row" style="gap:8px;margin-top:14px"><button class="btn" id="ref-save">${rt('wf_ref_save')}</button>
        <button class="btn ghost" id="ref-back">${rt('common_close')}</button></div></div>`, true);
  $('#ref-save').onclick = async () => {
    const answers = {}; $$('[data-rf]').forEach(el => { if (el.value !== '') answers[el.dataset.rf] = /^\d+$/.test(el.value) ? +el.value : el.value; });
    await api('/api/participants/' + pid + '/references', { method: 'POST', body: JSON.stringify({ answers, refIndex: refIndex != null ? refIndex : undefined }) });
    toast(rt('common_saved')); closeModal(); if (onSaved) onSaved();
  };
  $('#ref-back').onclick = () => { closeModal(); };
}
// ---------- Карточка собеседования ----------
async function openInterviewForm(pid, iv, onSaved) {
  openModal(`<div class="report-head"><h2 style="margin:0;font-size:21px">${rt('iv_title')}</h2></div>
    <div class="ref-wrap"><div class="form-grid">
      <div><label class="lbl">${rt('iv_date')}</label><input class="field" id="iv-date" type="datetime-local" value="${esc(iv.date || '')}"></div>
      <div><label class="lbl">${rt('iv_people')}</label><input class="field" id="iv-people" value="${esc(iv.participants || '')}" placeholder="${rt('iv_people_ph')}"></div>
      <div class="full"><label class="lbl">${rt('iv_impr')}</label><textarea class="field" id="iv-impr" rows="3">${esc(iv.impressions || '')}</textarea></div>
      <div class="full"><label class="lbl">${rt('iv_scores')}</label><textarea class="field" id="iv-scores" rows="2" placeholder="${rt('iv_scores_ph')}">${esc(iv.scores || '')}</textarea></div>
      <div class="full"><label class="lbl">${rt('iv_questions')}</label><textarea class="field" id="iv-questions" rows="2">${esc(iv.questions || '')}</textarea></div>
      <div class="full"><label class="lbl">${rt('iv_notes')}</label><textarea class="field" id="iv-notes" rows="2">${esc(iv.notes || '')}</textarea></div>
    </div>
    <div class="row" style="gap:8px;margin-top:14px"><button class="btn" id="iv-save">${t('save')}</button>
      <button class="btn ghost" id="iv-close">${rt('common_close')}</button></div></div>`, true);
  $('#iv-close').onclick = () => closeModal();
  $('#iv-save').onclick = async () => {
    await api('/api/participants/' + pid + '/interviews/' + iv.id, { method: 'PUT', body: JSON.stringify({
      date: $('#iv-date').value, participants: $('#iv-people').value, impressions: $('#iv-impr').value,
      scores: $('#iv-scores').value, questions: $('#iv-questions').value, notes: $('#iv-notes').value }) });
    toast(rt('common_saved')); closeModal(); if (onSaved) onSaved();
  };
}
// ---------- Общие блоки формы мотивации (карточка вопроса + отметка «о чём говорит ответ») ----------
// Отметка потока — сегмент из трёх кнопок вместо выпадашки: видно все варианты сразу, один клик
function mqMarkSeg(qid, val) {
  const titles = { out: rt('wf_mk_out_t'), mix: '', in: rt('wf_mk_in_t') };
  return `<div class="mq-seg" data-mmark="${qid}" data-val="${val || ''}">${['out', 'mix', 'in'].map(m =>
    `<button type="button" class="mq-seg-btn seg-${m} ${val === m ? 'on' : ''}" data-v="${m}" ${titles[m] ? `title="${titles[m]}"` : ''}>${rt('wf_mk_' + m)}</button>`).join('')}</div>`;
}
function mqBlock(q, qi, a) {
  return `<div class="mq-item">
    <div class="mq-q"><span class="mq-num">${qi + 1}</span><div class="mq-q-t">${esc(q.text)}</div></div>
    <div class="mq-body">
      ${q.hint ? `<details class="mq-hint"><summary>${rt('wf_motiv_q_hint')}</summary><p>${esc(q.hint)}</p></details>` : ''}
      <textarea class="field mq-ans" data-mq="${q.id}" rows="2" placeholder="${rt('wf_motiv_ans_ph')}">${esc(a.text || '')}</textarea>
      <div class="mq-mark"><span class="mq-mark-lbl">${rt('wf_motiv_mark')}</span>${mqMarkSeg(q.id, a.mark)}</div>
    </div></div>`;
}
// Клик по кнопке сегмента: выбрать; повторный клик — снять отметку
function wireMqMarks(onChange) {
  $$('.mq-seg').forEach(seg => $$('.mq-seg-btn', seg).forEach(b => b.onclick = () => {
    const v = seg.dataset.val === b.dataset.v ? '' : b.dataset.v;
    seg.dataset.val = v;
    $$('.mq-seg-btn', seg).forEach(x => x.classList.toggle('on', x.dataset.v === v));
    if (onChange) onChange();
  }));
}
// Живая подсказка уровня по отметкам ответов (out=убеждение, mix=выгода, in=деньги)
function mqUpdateSuggest(meta) {
  const box = $('#wf-motiv-suggest'); if (!box) return;
  const marks = $$('[data-mmark]').map(el => el.dataset.val).filter(Boolean);
  if (!marks.length) { box.textContent = ''; return; }
  const score = marks.reduce((s2, m) => s2 + (m === 'out' ? 3 : m === 'mix' ? 2 : 1), 0) / marks.length;
  const key = score >= 2.5 ? 'conviction' : score >= 1.75 ? 'benefit' : 'money';
  const lvl = meta.motivationLevels.find(l => l.key === key);
  box.innerHTML = lvl ? `${AI_IC} ${rt('wf_motiv_suggest')}: ${esc(lvl.label)} (${marks.length}/${(meta.motivationQuestions || []).length})` : '';
}
// ---------- Модалка проверки мотивации (вопросы + подсказки + уровень) ----------
async function openMotivationForm(pid, wf, onSaved) {
  const meta = await ensureRecMeta();
  const cur = (wf && wf.participant && wf.participant.workflow && wf.participant.workflow.motivation) || {};
  const curA = cur.answers || {};
  const scaleRows = meta.motivationLevels.map(l => `<li><b>${esc(l.label)}</b> — ${esc(l.desc)}</li>`).join('');
  const lvlOpts = meta.motivationLevels.map(l => `<option value="${l.key}" ${cur.level === l.key ? 'selected' : ''}>${esc(l.label)}</option>`).join('');
  const qBlocks = (meta.motivationQuestions || []).map((q, qi) => mqBlock(q, qi, curA[q.id] || {})).join('');
  openModal(`<div class="report-head"><h2 style="margin:0;font-size:21px">${rt('wf_motiv_level')}</h2></div>
    <div class="ref-wrap">
      <details class="mq-guide"><summary>${rt('wf_motiv_guide')}</summary><ul>${scaleRows}</ul><p>${rt('wf_motiv_scale_hint')}</p></details>
      <div class="mq-list">${qBlocks}</div>
      <div class="mq-final">
        <div id="wf-motiv-suggest" class="mq-suggest"></div>
        <div class="mq-final-row">
          <div><label class="lbl">${rt('wf_motiv_level')}</label>
            <select class="field sm" id="wf-motiv-level" style="width:100%"><option value="">—</option>${lvlOpts}</select></div>
          <div><label class="lbl">${rt('wf_motiv_notes')}</label>
            <textarea class="field" id="wf-motiv-notes" rows="2">${esc(cur.notes || '')}</textarea></div>
        </div>
        <div class="row" style="gap:8px"><button class="btn" id="mv-save">${rt('wf_motiv_save')}</button>
          <button class="btn ghost" id="mv-close">${rt('common_close')}</button></div>
      </div></div>`, true);
  const updateSuggest = () => mqUpdateSuggest(meta);
  wireMqMarks(updateSuggest);
  updateSuggest();
  $('#mv-close').onclick = () => closeModal();
  $('#mv-save').onclick = async () => {
    const answers = {};
    $$('[data-mq]').forEach(el => { answers[el.dataset.mq] = answers[el.dataset.mq] || {}; answers[el.dataset.mq].text = el.value; });
    $$('[data-mmark]').forEach(el => { answers[el.dataset.mmark] = answers[el.dataset.mmark] || {}; answers[el.dataset.mmark].mark = el.dataset.val || ''; });
    await api('/api/participants/' + pid + '/motivation', { method: 'POST', body: JSON.stringify({ level: $('#wf-motiv-level').value, answers, notes: $('#wf-motiv-notes').value }) });
    toast(rt('common_saved')); closeModal(); if (onSaved) onSaved();
  };
}
function renderStub() {
  const meta = {
    vacancies: { t: t('nav_vacancies'), ic: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M3 12h18" stroke-linecap="round"/>' },
    candidates: { t: t('nav_candidates'), ic: '<circle cx="9" cy="8" r="3.3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M17.5 19a5.2 5.2 0 0 0-3-4.7" stroke-linecap="round" stroke-linejoin="round"/>' },
    integrations: { t: t('nav_integrations'), ic: '<path d="M10 4.5V8m4-3.5V8M8 8h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V8ZM12 15v5" stroke-linecap="round" stroke-linejoin="round"/>' }
  }[state.view] || { t: '—', ic: '' };
  $('#main').innerHTML = `<h1 class="page-h reveal">${meta.t}</h1>
    <div class="card stub-card reveal d1">
      <div class="stub-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${meta.ic}</svg></div>
      <div class="stub-t">${t('stub_dev')}</div>
      <p class="muted" style="max-width:420px">${t('stub_soon')}</p>
    </div>`;
}

// animation helpers
function fillBars() { requestAnimationFrame(() => $$('.bar-fill[data-w]').forEach(b => b.style.width = b.dataset.w + '%')); }
function countUp(el, to, dur = 900) {
  const start = performance.now(), from = 0;
  const step = t => { const p = Math.min(1, (t - start) / dur); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

function fillSideUser() {
  const u = state.user; if (!u) return;
  const nm = (u.name || u.company || u.email || '').trim();
  const nEl = $('#side-name'); if (nEl) nEl.textContent = nm || 'Аккаунт';
  const sEl = $('#side-sub'); if (sEl) sEl.textContent = u.company && u.company !== nm ? u.company : 'Администратор';
  const aEl = $('#side-ava'); if (aEl) aEl.textContent = (nm[0] || 'H').toUpperCase();
  // Пункт «Админка» — только для администраторов портала
  if (u.role === 'admin' && !$('#nav-admin')) {
    const btn = document.createElement('button');
    btn.className = 'nav-item'; btn.id = 'nav-admin';
    btn.innerHTML = `${_svg('<path d="M12 3l8 4v5c0 4.6-3.2 8-8 9-4.8-1-8-4.4-8-9V7l8-4Z"/><path d="M9 12l2 2 4-4"/>')}<span>Админка</span>`;
    btn.onclick = () => { location.href = '/admin'; };
    const logout = $('#logout');
    if (logout && logout.parentElement) logout.parentElement.insertBefore(btn, logout);
  }
}
// Плашка имперсонации: админ просматривает кабинет клиента
function showImpersonationBar(byEmail) {
  if ($('#imp-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'imp-bar'; bar.id = 'imp-bar';
  bar.innerHTML = `<span>Вы просматриваете кабинет ${esc(state.user.email)} от имени администратора ${esc(byEmail)}. Все изменения записываются в журнал.</span>
    <button id="imp-stop">Вернуться в админку</button>`;
  document.body.prepend(bar);
  document.body.classList.add('imp-active');
  document.body.style.paddingTop = '38px';
  $('#imp-stop').onclick = async () => {
    await api('/api/admin/impersonate/stop', { method: 'POST' });
    location.href = '/admin';
  };
}
(async function init() {
  let meResp;
  try { meResp = await api('/api/me'); state.user = meResp.user; }
  catch (e) { return; }
  if (meResp.impersonatedBy) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/admin.css'; document.head.appendChild(l);
    showImpersonationBar(meResp.impersonatedBy);
  }
  fillSideUser();
  applyI18n();
  renderLangSwitch();
  try { state.langs = (await api('/api/meta')).langs; } catch (_) { state.langs = [{ code: 'ru', name: 'Русский' }, { code: 'uk', name: 'Украи́нский' }, { code: 'pl', name: 'Польский' }, { code: 'en', name: 'Английский' }]; }
  await loadSections();
  await loadVacancies();
  const params = new URLSearchParams(location.search);
  if (params.get('checkout')) return handleCheckoutReturn(params.get('checkout'));
  const m = location.pathname.match(/^\/result\/(.+)$/);
  if (m) { await loadParticipantsAll(); openReport(m[1]); }
  else setView('dashboard');
})();

async function handleCheckoutReturn(cid) {
  history.replaceState(null, '', '/app');
  if (cid === 'cancel') { toast('Оплата отменена'); setView('balance'); return; }
  try { const d = await api('/api/checkout/confirm', { method: 'POST', body: JSON.stringify({ sessionId: cid }) }); state.user = d.balance; toast('Баланс пополнен ✓'); }
  catch (e) { toast(e.message); }
  setView('balance');
}

async function loadSections() { state.sections = (await api('/api/sections')).sections; }
async function loadVacancies(force) {
  if (force || !state._vacsAt || Date.now() - state._vacsAt > DATA_TTL) {
    state.allVacancies = (await api('/api/vacancies?sectionId=all')).vacancies; state._vacsAt = Date.now();
  }
  state.vacancies = state.activeSection === 'all' ? state.allVacancies.slice()
    : state.allVacancies.filter(v => (v.sectionId || '') === state.activeSection);
}
async function loadParticipants(force) {
  if (force || !state._partsAt || Date.now() - state._partsAt > DATA_TTL) {
    state.allParticipants = (await api('/api/participants?vacancyId=all')).participants; state._partsAt = Date.now();
  }
  state.participants = state.activeVac === 'all' ? state.allParticipants.slice()
    : state.allParticipants.filter(p => p.vacancyId === state.activeVac);
}
async function loadParticipantsAll() { state.allParticipants = (await api('/api/participants?vacancyId=all')).participants; state._partsAt = Date.now(); state.participants = state.allParticipants.slice(); }
function invalidateParts() { state._partsAt = 0; }
function invalidateVacs() { state._vacsAt = 0; }

// ================= DASHBOARD =================
const FUNNEL_COLORS = ['#3d6cd1', '#1fa8c9', '#c98a1e', '#5847b5', '#1f9d6b'];
const TYPE_COLOR = { result: '#1f9d6b', tools: '#3d6cd1', logic: '#7a5cd6', sales: '#e8553b' };
function kpiCard(n, label, color, icon) { return `<div class="kpi"><div class="kpi-ic" style="background:${color}1f;color:${color}">${icon}</div><div><div class="kpi-n" style="color:${color}">${n}</div><div class="kpi-l">${label}</div></div></div>`; }
// Классическая воронка-трапеция (общая для дашборда и вакансии)
const FNL_TRAP_COLORS = ['#F2724B', '#F2A44B', '#E3B93E', '#8FC646', '#2BB56A', '#17A8A0', '#3F8FD4', '#4262C9', '#5A55B8'];
function funnelTrap(rows) {
  // rows: [{label, count, pct?}] — ширина сегментов фиксированно сужается сверху вниз
  const n = rows.length;
  const wOf = i => 100 - (n > 1 ? i * (58 / (n - 1)) : 0);
  return `<div class="fnl">${rows.map((r, i) => {
    const wt = wOf(i), wb = i < n - 1 ? wOf(i + 1) : Math.max(24, wOf(i) - 10);
    const clip = `polygon(${(100 - wt) / 2}% 0, ${(100 + wt) / 2}% 0, ${(100 + wb) / 2}% 100%, ${(100 - wb) / 2}% 100%)`;
    return `<div class="fnl-seg" style="clip-path:${clip};background:${FNL_TRAP_COLORS[i % FNL_TRAP_COLORS.length]}">
      <span>${esc(r.label)} · <b>${r.count}</b>${r.pct != null ? ` · ${r.pct}%` : ''}</span></div>`;
  }).join('')}</div>`;
}
function funnelChart(fn) {
  const top = Math.max(1, fn[0].value);
  return funnelTrap(fn.map((f, i) => ({ label: tr(f.label), count: f.value, pct: i ? Math.round(100 * f.value / top) : null })));
}
function typeBars(byType) {
  const types = ['result', 'tools', 'logic', 'sales']; const max = Math.max(1, ...types.map(t => byType[t] || 0));
  return `<div class="tbars">${types.map(t => { const v = byType[t] || 0; const h = Math.round(v / max * 100); const c = TYPE_COLOR[t]; return `<div class="tb-col"><div class="tb-wrap"><div class="tb-bar" style="height:${h}%;background:linear-gradient(180deg,${c},${c}b0);box-shadow:0 6px 16px ${c}44"><span>${v}</span></div></div><div class="tb-lab">${testTitle(t)}</div></div>`; }).join('')}</div>`;
}
function sparkArea(days) {
  const vals = days.map(d => d.count); const max = Math.max(1, ...vals); const n = vals.length;
  const xy = vals.map((v, i) => [+(i / (n - 1) * 300).toFixed(1), +(72 - v / max * 60).toFixed(1)]);
  const pts = xy.map(p => p.join(',')).join(' ');
  const last = xy[xy.length - 1];
  return `<svg viewBox="0 0 300 80" preserveAspectRatio="none" class="spark"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".3"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs><polygon points="0,80 ${pts} 300,80" fill="url(#sg)"/><polyline points="${pts}" fill="none" stroke="var(--brand)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2.5"/></svg>`;
}
function stageDonut(byStage) {
  const entries = STAGES.map(s => ({ label: s.id, value: byStage[s.id] || 0, color: s.color || '#9aa6bd' })).filter(e => e.value > 0);
  const total = entries.reduce((a, e) => a + e.value, 0) || 1; const R = 42, C = 2 * Math.PI * R; let acc = 0;
  const segs = entries.map(e => { const dash = e.value / total * C; const s = `<circle r="${R}" cx="60" cy="60" fill="none" stroke="${e.color}" stroke-width="15" stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 60 60)"/>`; acc += dash; return s; }).join('');
  const legend = entries.map(e => `<div class="dn-leg"><i style="background:${e.color}"></i>${esc(tr(e.label))} <b>${e.value}</b></div>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 120 120" class="donut">${segs}<text x="60" y="57" text-anchor="middle" class="donut-n">${total}</text><text x="60" y="74" text-anchor="middle" class="donut-l">${t('total_word')}</text></svg><div class="dn-legend">${legend || `<span class="muted">${t('no_data')}</span>`}</div></div>`;
}
async function renderDashboard() {
  const [d, vacsD] = await Promise.all([api('/api/dashboard'), api('/api/vacancies?sectionId=all')]);
  const tot = d.totals;
  const vacOptions = vacsD.vacancies.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('');
  const recent = d.recent.length ? d.recent.map(p => `<div class="dash-recent-row" data-pid="${p.id}"><span class="avatar" style="width:30px;height:30px;background:${avColor(p.name)}">${esc(initials(p.name, p.email))}</span><div class="rr-main"><b>${esc(p.name)}</b><span class="muted">${esc(p.vacancyName || p.email)}</span></div>${stagePill(p.stage)}</div>`).join('') : `<p class="muted">${t('no_candidates')}</p>`;
  const topVac = d.vacCounts.length ? d.vacCounts.map(v => { const max = Math.max(1, d.vacCounts[0].count); return `<div class="tv-row"><span class="tv-name">${esc(v.name)}</span><div class="tv-track"><div class="tv-bar" style="width:${Math.max(6, v.count / max * 100)}%"></div></div><b>${v.count}</b></div>`; }).join('') : `<p class="muted">${t('no_vacancies')}</p>`;
  const awaiting = (d.byStage['Собеседование'] || 0) + (d.byStage['Резерв'] || 0) || tot.testsDone || d.recent.length;
  const recentRows = d.recent.length ? d.recent.map(p => `<div class="rrow prow" data-pid="${p.id}">
      <div class="rc-main"><span class="avatar" style="width:36px;height:36px;background:${avColor(p.name)}">${esc(initials(p.name, p.email))}</span><div style="min-width:0"><div class="rc-name">${esc(p.name)}</div><div class="rc-sub">${esc(p.email || '')}</div></div></div>
      <div class="rc-vac">${esc(p.vacancyName || '—')}</div>
      <div class="rc-badge">${stagePill(p.stage)}</div>
    </div>`).join('') : `<div style="padding:20px 24px"><p class="muted">${t('no_candidates')}</p></div>`;
  $('#main').innerHTML = `
    <div class="ptopbar reveal">
      <div class="pt-head"><div class="eyebrow">${t('dash_overview')}</div><h1 class="ptitle">${t('dash_title')}</h1></div>
      <div class="pt-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round"/></svg><input id="dash-search" placeholder="${t('search_cand_ph')}"></div>
      <button class="tests-chip" onclick="setView('balance')" title="${t('balance')}"><svg viewBox="0 0 24 24" fill="none" stroke="#43e0a0" stroke-width="1.9"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18" stroke-linecap="round"/></svg><b class="num">${tot.balance}</b><span>${t('tests_word')}</span></button>
      <button class="btn pt-send" id="dash-open-send">＋ ${t('send_test')}</button>
    </div>
    <div class="dash-banner reveal"><canvas id="neuPortal"></canvas>
      <div class="aib-in">
        <div class="aib-kick"><span class="aib-dot"></span>${t('dash_ai_kick')}</div>
        <h2 class="aib-title">${awaiting} ${candWord(awaiting)} ${t('dash_ai_wait')}</h2>
        <p class="aib-lead">${t('dash_ai_lead')}</p>
      </div>
    </div>
    <div class="kpi-grid pk reveal d1">
      ${pkpi(t('kpi_candidates'), tot.candidates)}
      ${pkpi(t('kpi_done'), tot.testsDone)}
      ${pkpi(t('kpi_pending'), tot.testsPending)}
      ${pkpi(t('kpi_apps'), tot.applications)}
      ${pkpi(t('kpi_vacancies'), tot.vacancies)}
      ${pkpi(t('kpi_conversion'), tot.conversion + '%')}
    </div>
    <div class="dash-grid2 reveal d2">
      <div class="card"><div class="dash-h"><h3>${t('funnel_title')}</h3><span class="muted">${t('funnel_sub')}</span></div>${funnelBars(d.funnel)}</div>
      <div class="card"><div class="dash-h"><h3>${t('stages_title')}</h3></div>${stageList(d.byStage)}</div>
    </div>
    <div class="card flush recent-card reveal d3">
      <div class="dash-h" style="padding:20px 24px 14px;margin:0;border:0"><h3>${t('recent_title')}</h3><a href="#" onclick="setView('candidates');return false" style="font-size:13px">${t('all_link')}</a></div>
      <div class="rtable">${recentRows}</div>
    </div>`;
  portalNet('neuPortal');
  $('#dash-open-send').onclick = () => openSendModal(vacsD.vacancies, vacOptions);
  $$('.rrow[data-pid]').forEach(r => r.onclick = () => openParticipant(r.dataset.pid));
  maybeStartTour();   // онбординг-тур при первом входе
}
// плюрализация «кандидат» по числу
function candWord(n) { n = Math.abs(n) % 100; const n1 = n % 10; if (n > 10 && n < 20) return t('cand_word_5'); if (n1 > 1 && n1 < 5) return t('cand_word_2'); if (n1 === 1) return t('cand_word_1'); return t('cand_word_5'); }
// KPI-плитка в стиле дизайна: подпись сверху, крупное число, без иконки
function pkpi(label, value) { return `<div class="pkpi"><div class="pkpi-l">${label}</div><div class="pkpi-v">${value}</div></div>`; }
// Воронка полосами (фиолетовый градиент) — как в дизайне портала
function funnelBars(fn) {
  const top = Math.max(1, fn[0].value);
  return `<div class="fbars">${fn.map((f, i) => { const pct = Math.round(100 * f.value / top); const rel = i ? Math.round(100 * f.value / (fn[0].value || 1)) : null;
    return `<div class="fbar"><div class="fbar-h"><span>${esc(tr(f.label))}</span><span class="mono">${f.value}${rel != null ? ` · ${rel}%` : ''}</span></div><div class="fbar-track"><div class="fbar-fill" style="width:${Math.max(4, pct)}%"></div></div></div>`;
  }).join('')}</div>`;
}
// Распределение по этапам — список с цветными точками (как в дизайне)
function stageList(byStage) {
  const entries = STAGES.map(s => ({ label: s.id, value: byStage[s.id] || 0, color: s.color || '#8b93ad' })).filter(e => e.value > 0);
  return `<div class="stlist">${entries.map(e => `<div class="stli"><span class="std" style="background:${e.color};box-shadow:0 0 8px ${e.color}"></span><span class="stl">${esc(tr(e.label))}</span><span class="stv mono">${e.value}</span></div>`).join('') || `<span class="muted">${t('no_data')}</span>`}</div>`;
}
// Бейдж «Виннер/Дуер» (тип цели вакансии); пусто, если не задан
function targetBadge(target) {
  if (target === 'performer' || target === 'boss') return `<span class="tbadge win">${t('vac_target_performer') ? 'Виннер' : 'Виннер'}</span>`;
  if (target === 'executor') return `<span class="tbadge duer">Дуер</span>`;
  return '';
}
// Модалка отправки теста (кнопка «Отправить тест» в топбаре)
function openSendModal(vacs, vacOptions) {
  openModal(`<h2 style="margin:0 0 4px">${t('send_test')}</h2>
    <p class="muted" style="margin:0 0 18px">${t('quick_ph')}</p>
    <div class="send-modal">
      <input class="field" id="emails" placeholder="${t('quick_ph')}">
      <div class="send-row">
        <select class="field" id="vac-select"><option value="">${t('without_vacancy')}</option>${vacOptions}</select>
        ${sendLangSelect()}
      </div>
      <button type="button" class="field type-field" id="type-field" style="text-align:left;justify-content:space-between"><span id="type-field-txt">${sendTypesText()}</span>${_svg('<path d="M6 9l6 6 6-6" stroke-linecap="round"/>')}</button>
      <button class="btn" id="dash-send" style="width:100%">${t('send_btn')}</button>
    </div>`, true);
  $('#type-field').onclick = openTestPicker;
  $('#dash-send').onclick = () => dashSend(true);
  wireSendLang(vacs);
}
// Анимация «нейросети» в баннере: гексагональные узлы + спутники, магнитная реакция на курсор
function portalNet(id, opts) {
  const cv = document.getElementById(id); if (!cv) return;
  const interactive = !opts || opts.interactive !== false;
  const host = cv.closest('.dash-banner,.ai-banner') || cv.parentElement || cv; if (!host) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const rgb = [110, 120, 220], acc = [150, 140, 255];
  let gen = 0, M = { x: 0, y: 0, on: false };
  if (interactive) {
    host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); if (!r.width) return; M.x = (e.clientX - r.left) * (cv.__W / r.width); M.y = (e.clientY - r.top) * (cv.__H / r.height); M.on = true; });
    host.addEventListener('mouseleave', () => { M.on = false; });
  }
  function start() {
    if (!document.getElementById(id)) return;
    gen++; const g = gen; const ctx = cv.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.offsetWidth || 520, H = cv.offsetHeight || 190; cv.__W = W; cv.__H = H; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const C = a => 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')', A = a => 'rgba(' + acc[0] + ',' + acc[1] + ',' + acc[2] + ',' + a + ')', rnd = (a, b) => a + Math.random() * (b - a);
    const hubs = Math.max(4, Math.round(W / 105)), MR = 180; const G = [];
    for (let i = 0; i < hubs; i++) { const sc = 3 + Math.floor(Math.random() * 2), sats = []; for (let k = 0; k < sc; k++) sats.push({ ang: rnd(0, 6.28), rad: rnd(18, 30), spd: rnd(-.006, .006) });
      G.push({ x: rnd(34, W - 34), y: rnd(28, H - 28), vx: rnd(-.16, .16), vy: rnd(-.16, .16), rot: rnd(0, 6.28), sats }); }
    const hex = (cx, cy, r, rot) => { ctx.beginPath(); for (let s = 0; s < 6; s++) { const a = rot + s * Math.PI / 3, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
    (function loop() { if (g !== gen || !cv.isConnected) return;
      ctx.clearRect(0, 0, W, H);
      if (M.on) { const rg = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, 220); rg.addColorStop(0, A(.06)); rg.addColorStop(1, A(0)); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
      for (const h of G) { if (M.on) { const dx = M.x - h.x, dy = M.y - h.y, d = Math.hypot(dx, dy); if (d < 210 && d > 1) { h.vx += dx / d * .05; h.vy += dy / d * .05; } }
        h.vx *= .99; h.vy *= .99; h.x += h.vx; h.y += h.vy; if (h.x < 26 || h.x > W - 26) h.vx *= -1; if (h.y < 24 || h.y > H - 24) h.vy *= -1;
        h.x = Math.max(26, Math.min(W - 26, h.x)); h.y = Math.max(24, Math.min(H - 24, h.y)); h.rot += .0016; }
      for (let i = 0; i < G.length; i++) for (let j = i + 1; j < G.length; j++) { const a = G[i], b = G[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 250) { ctx.strokeStyle = C((1 - d / 250) * .16); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      for (const h of G) { const hover = M.on && Math.hypot(h.x - M.x, h.y - M.y) < MR, em = hover ? 1 : 0;
        ctx.strokeStyle = C(.1 + em * .22); ctx.lineWidth = 1.2; hex(h.x, h.y, 22, h.rot); ctx.stroke();
        for (const st of h.sats) { st.ang += st.spd; const sx = h.x + Math.cos(st.ang) * st.rad, sy = h.y + Math.sin(st.ang) * st.rad;
          ctx.strokeStyle = C(.3 + em * .4); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(sx, sy); ctx.stroke();
          ctx.fillStyle = C(.68 + em * .3); ctx.beginPath(); ctx.arc(sx, sy, 1.7, 0, 7); ctx.fill(); }
        if (M.on) { const d = Math.hypot(h.x - M.x, h.y - M.y); if (d < MR) { ctx.strokeStyle = A((1 - d / MR) * .7); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(M.x, M.y); ctx.stroke(); } }
        ctx.fillStyle = A(.9); ctx.beginPath(); ctx.arc(h.x, h.y, hover ? 3.4 : 2.7, 0, 7); ctx.fill();
        if (hover) { const rr = 14; const gg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, rr); gg.addColorStop(0, A(.5)); gg.addColorStop(1, A(0)); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(h.x, h.y, rr, 0, 7); ctx.fill(); } }
      if (M.on) { const rr = 22; const gg = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, rr); gg.addColorStop(0, A(.85)); gg.addColorStop(1, A(0)); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(M.x, M.y, rr, 0, 7); ctx.fill(); }
      requestAnimationFrame(loop);
    })();
  }
  start(); let rt; const onResize = () => { if (!cv.isConnected) { window.removeEventListener('resize', onResize); return; } clearTimeout(rt); rt = setTimeout(start, 220); }; window.addEventListener('resize', onResize);
}

// Выбор языка отправляемого теста; по умолчанию подставляется язык вакансии из заявки
function sendLangSelect(cur) {
  return `<select class="field" id="send-lang" aria-label="Язык теста" title="Язык теста" style="width:76px;flex:none">
    ${['ru', 'pl', 'en'].map(l => `<option value="${l}" ${(cur || 'ru') === l ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('')}</select>`;
}
function wireSendLang(vacs) {
  const vs = $('#vac-select'), ls = $('#send-lang');
  if (!vs || !ls) return;
  const apply = () => { const v = (vacs || []).find(x => x.id === vs.value); if (v) ls.value = ['ru', 'pl', 'en'].includes(v.lang) ? v.lang : 'ru'; };
  vs.addEventListener('change', apply);
  apply();
}
async function dashSend() {
  const emails = $('#emails').value.trim(); if (!emails) return toast('Укажите email кандидата');
  if (!sendTypes.length) return toast('Выберите тест');
  const vacId = $('#vac-select').value, vac = state.vacancies.find(v => v.id === vacId);
  const lang = ($('#send-lang') && $('#send-lang').value) || 'ru';
  const btn = $('#dash-send'); btn.disabled = true; btn.textContent = 'Отправка…';
  try { const d = await api('/api/tests/send', { method: 'POST', body: JSON.stringify({ emails, vacancyId: vacId, types: sendTypes.slice(), lang }) }); state.user = d.balance; showLinksModal(d.created, lang, vac ? vac.name : ''); invalidateParts(); renderDashboard(); }
  catch (e) { toast(e.message); btn.disabled = false; btn.textContent = 'Отправить'; }
}

// ================= COLUMN CONFIG =================
const COLS = [
  { key: 'id', th: 'ID' }, { key: 'vacancy', th: 'Вакансия' }, { key: 'stage', th: 'Этап' }, { key: 'sexage', th: 'Пол · возраст' },
  { key: 'tel', th: 'Телефон' }, { key: 'result', th: '★ Резалт' }, { key: 'logic', th: '★ Логис' },
  { key: 'date', th: 'Дата' }, { key: 'city', th: 'Город' }, { key: 'comment', th: 'Комментарий' },
];
const COL_KEY = { id: 'col_id', vacancy: 'pm_vacancy', stage: 'col_stage', sexage: 'col_sexage', tel: 'col_tel', result: 'col_result', logic: 'col_logic', date: 'col_date', city: 'col_city', comment: 'col_comment' };
function colTh(c) { return t(COL_KEY[c.key] || ''); }
function colVis() { try { return JSON.parse(localStorage.getItem('hp_cols')) || {}; } catch (_) { return {}; } }
const COL_DEFAULT_ON = ['vacancy', 'stage', 'sexage', 'result', 'city']; // дефолтный набор колонок для новых пользователей (дальше каждый донастраивает)
function colOn(key) { const v = colVis(); return key in v ? !!v[key] : COL_DEFAULT_ON.includes(key); }
function visibleCols() { return COLS.filter(c => colOn(c.key)); }
function cellFor(key, p, ctx) {
  switch (key) {
    case 'id': return `<td class="muted mono" style="font-size:12px">${shortId(p)}</td>`;
    case 'vacancy': return `<td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.vacancyName || '—')}</td>`;
    case 'stage': return `<td>${stagePill(p.stage)}</td>`;
    case 'sexage': return `<td class="muted">${ctx.pa}</td>`;
    case 'tel': return `<td>${esc(p.tel || '—')}</td>`;
    case 'result': return `<td>${ctx.resT ? ratingStars(ctx.resT.rate) : '<span class="muted">—</span>'}</td>`;
    case 'logic': return `<td>${ctx.logT ? ratingStars(ctx.logT.rate) : '<span class="muted">—</span>'}</td>`;
    case 'date': return `<td class="muted mono" style="font-size:13px">${ctx.dt}</td>`;
    case 'city': return `<td>${esc(p.city || '—')}</td>`;
    case 'comment': return `<td class="muted" style="font-size:13px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.comment || '—')}</td>`;
    default: return '<td></td>';
  }
}
function openColConfig() {
  openModal(`<h2 style="margin:0 0 4px">${t('col_cfg_title')}</h2>
    <p class="muted" style="margin:0 0 16px">${t('col_cfg_sub')}</p>
    <div class="col-grid">${COLS.map(c => `<label class="switchrow col-sw"><span>${colTh(c).replace('★ ', '')}</span><span class="switch ${colOn(c.key) ? 'on' : ''}" data-col="${c.key}"><i></i></span></label>`).join('')}</div>
    <div class="row" style="margin-top:18px"><button class="btn" id="col-save">${t('apply')}</button><button class="btn ghost" onclick="closeModal()">${t('cancel')}</button></div>`, true);
  $$('.switch[data-col]').forEach(sw => sw.onclick = () => sw.classList.toggle('on'));
  $('#col-save').onclick = () => { const v = {}; $$('.switch[data-col]').forEach(sw => v[sw.dataset.col] = sw.classList.contains('on')); localStorage.setItem('hp_cols', JSON.stringify(v)); closeModal(); renderHome(); };
}
window.openColConfig = openColConfig;

// ===== Настройка для всех вакансий (Настройка писем + Очередность тестов) =====
const MAIL_SEND_LABELS = { result: 'Тест Резалт', result_emp: 'Тест Резалт (Сотрудники)', tools: 'Тест Тулс', logic: 'Тест Логис', sales: 'Тест Сэйлс', video: 'Видеоинтервью', regard: 'Тест Регард' };
const MAIL_STATUS_LABELS = { rejected: 'Отказано', interview: 'Собеседование', reserve: 'Резерв', accepted: 'Принят' };
const MAIL_VARS = [['$vac$', 'название вакансии'], ['$link$', 'ссылка на тест'], ['$id_part$', 'номер анкеты'], ['$name$', 'имя кандидата'], ['$client$', 'имя пользователя'], ['$company$', 'название компании'], ['$phone$', 'телефон пользователя'], ['$date_interview$', 'дата собеседования'], ['$button_link$', 'ссылка на тест'], ['$button_link_min$', 'ссылка (мини)']];
function emptyMail() {
  const mk = keys => keys.reduce((o, k) => (o[k] = { ru: { subject: '', body: '' }, uk: { subject: '', body: '' }, pl: { subject: '', body: '' }, en: { subject: '', body: '' } }, o), {});
  return { send: mk(Object.keys(MAIL_SEND_LABELS)), status: mk(Object.keys(MAIL_STATUS_LABELS)) };
}
async function openTestsConfig() {
  let s;
  try { s = (await api('/api/settings')).user.settings; } catch (e) { s = (state.user && state.user.settings) || {}; }
  const langs = (state.langs && state.langs.length) ? state.langs : [{ code: 'ru', name: 'Русский' }];
  const mt = (s.mailTemplates && s.mailTemplates.send) ? JSON.parse(JSON.stringify(s.mailTemplates)) : emptyMail();
  let order = (Array.isArray(s.testOrder) && s.testOrder.length ? s.testOrder : ['result', 'tools', 'logic', 'sales']).filter(t => TEST_LABEL[t]);
  ['result', 'tools', 'logic', 'sales'].forEach(t => { if (!order.includes(t)) order.push(t); });
  let tab = 'mail', mcat = 'send', mitem = 'result', curLang = (s.uiLang && langs.find(l => l.code === s.uiLang)) ? s.uiLang : langs[0].code;

  openModal(`<h2 style="margin:0 0 2px">Настройка для всех вакансий</h2>
    <p class="muted" style="margin:0 0 16px">Отдельный шаблон письма под каждый тест и каждый статус — по языкам.</p>
    <div class="seg tcfg-seg"><button class="seg-btn active" data-tcfg="mail">Настройка писем</button><button class="seg-btn" data-tcfg="order">Очередность тестов</button></div>
    <div id="tcfg-body" style="margin-top:16px"></div>
    <div class="row" style="margin-top:18px"><button class="btn" id="tcfg-save">Сохранить</button><button class="btn ghost" onclick="closeModal()">Отмена</button></div>`, true);

  function saveMailInputs() {
    const sub = $('#tc-subject'), bod = $('#tc-body');
    if (sub && bod && mt[mcat] && mt[mcat][mitem]) mt[mcat][mitem][curLang] = { subject: sub.value, body: bod.value };
  }
  function drawMail() {
    const labels = mcat === 'send' ? MAIL_SEND_LABELS : MAIL_STATUS_LABELS;
    if (!labels[mitem]) mitem = Object.keys(labels)[0];
    const t = (mt[mcat][mitem] && mt[mcat][mitem][curLang]) || { subject: '', body: '' };
    $('#tcfg-body').innerHTML = `
      <div class="tc-seg2"><button class="seg2 ${mcat === 'send' ? 'on' : ''}" data-mcat="send">При отправке тестов</button><button class="seg2 ${mcat === 'status' ? 'on' : ''}" data-mcat="status">При изменении статуса</button></div>
      <div class="tc-items">${Object.keys(labels).map(k => `<button class="chip sm ${k === mitem ? 'active' : ''}" data-mitem="${k}">${esc(labels[k])}</button>`).join('')}</div>
      <div class="tc-langs" style="margin-top:10px">${langs.map(l => `<button class="chip sm ${l.code === curLang ? 'active' : ''}" data-tl="${l.code}">${l.code.toUpperCase()}</button>`).join('')}</div>
      <label class="lbl" style="margin-top:12px">Тема письма</label>
      <input class="field" id="tc-subject" value="${esc(t.subject || '')}" placeholder="Тема письма">
      <label class="lbl" style="margin-top:12px">Текст письма</label>
      <textarea class="field" id="tc-body" rows="8" style="resize:vertical;line-height:1.55">${esc(t.body || '')}</textarea>
      <div class="tc-vars">Переменные: ${MAIL_VARS.map(v => `<code title="${esc(v[1])}">${esc(v[0])}</code>`).join(' ')}</div>`;
    $$('[data-mcat]').forEach(b => b.onclick = () => { saveMailInputs(); mcat = b.dataset.mcat; mitem = Object.keys(mcat === 'send' ? MAIL_SEND_LABELS : MAIL_STATUS_LABELS)[0]; drawMail(); });
    $$('[data-mitem]').forEach(b => b.onclick = () => { saveMailInputs(); mitem = b.dataset.mitem; drawMail(); });
    $$('[data-tl]').forEach(b => b.onclick = () => { saveMailInputs(); curLang = b.dataset.tl; drawMail(); });
  }
  function drawOrder() {
    $('#tcfg-body').innerHTML = `<p class="muted" style="margin:0 0 12px">${t(`order_sub`)}</p>
      <div class="tc-order">${order.map((t, i) => `<div class="tc-orow" data-i="${i}">
        <span class="tc-num">${i + 1}</span>
        <span class="tc-oic" style="color:${TYPE_COLOR[t] || 'var(--brand)'}">${_svg(TEST_SVG[t] || '')}</span>
        <span class="tc-oname">${testTitle(t)}</span>
        <span class="tc-omove"><button data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Выше">${_svg('<path d="M18 15l-6-6-6 6" stroke-linecap="round" stroke-linejoin="round"/>')}</button><button data-dn="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Ниже">${_svg('<path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>')}</button></span>
      </div>`).join('')}</div>`;
    $$('[data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; [order[i - 1], order[i]] = [order[i], order[i - 1]]; drawOrder(); });
    $$('[data-dn]').forEach(b => b.onclick = () => { const i = +b.dataset.dn; [order[i + 1], order[i]] = [order[i], order[i + 1]]; drawOrder(); });
  }
  function draw() { tab === 'mail' ? drawMail() : drawOrder(); }
  $$('[data-tcfg]').forEach(b => b.onclick = () => { if (tab === 'mail') saveMailInputs(); tab = b.dataset.tcfg; $$('[data-tcfg]').forEach(x => x.classList.toggle('active', x === b)); draw(); });
  $('#tcfg-save').onclick = async () => {
    if (tab === 'mail') saveMailInputs();
    try {
      await api('/api/settings', { method: 'PUT', body: JSON.stringify({ mailTemplates: mt, testOrder: order }) });
      if (state.user) state.user.settings = Object.assign(state.user.settings || {}, { mailTemplates: mt, testOrder: order });
      toast('Настройки сохранены ✓'); closeModal();
    } catch (e) { toast(e.message || 'Ошибка сохранения'); }
  };
  draw();
}
window.openTestsConfig = openTestsConfig;

// ================= HOME =================
async function renderHome() {
  await loadParticipants();
  const avail = state.user.balanceTotal - state.user.balancePending;
  const doneCount = state.participants.reduce((n, p) => n + p.tests.filter(t => t.status === 'done').length, 0);
  const pendCount = state.participants.reduce((n, p) => n + p.tests.filter(t => t.status !== 'done').length, 0);
  // Разделы и вакансии здесь — только фильтры; создание/изменение — в «Рекрутации» (заявка → вакансия)
  const secTabs = [`<button class="chip sec ${state.activeSection === 'all' ? 'active' : ''}" data-sec="all">${t('all_sections')}</button>`]
    .concat(state.sections.map(s => `<button class="chip sec ${state.activeSection === s.id ? 'active' : ''}" data-sec="${s.id}">${esc(s.name)}</button>`)).join('');
  const vacTabs = [`<button class="chip ${state.activeVac === 'all' ? 'active' : ''}" data-vac="all">${t('all_vacancies')}</button>`]
    .concat(state.vacancies.map(v => `<button class="chip ${state.activeVac === v.id ? 'active' : ''}" data-vac="${v.id}">${esc(v.name)}${v.lang && v.lang !== 'ru' ? ` <span class="langtag">${(v.lang || '').toUpperCase()}</span>` : ''}</button>`)).join('');
  const vacOptions = state.vacancies.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('');
  $('#main').innerHTML = `
    <div class="tabs sectabs reveal">${secTabs}</div>
    <div class="tabs reveal">${vacTabs}</div>
    <div class="topbar reveal d1">
      <div><h1 class="page-h">${t('home_title')}</h1></div>
      <button class="tests-chip" id="add-bal" onclick="setView('balance')" title="${t('topup')}"><svg viewBox="0 0 24 24" fill="none" stroke="#43e0a0" stroke-width="1.9"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18" stroke-linecap="round"/></svg><b class="num" id="bal-num">${avail}</b><span>${t('tests_word')}</span></button>
    </div>
    <div class="send-card reveal d2">
      <input class="field" id="emails" autocomplete="off" aria-label="Email" placeholder="${t('send_ph')}">
      <select class="field" id="vac-select" aria-label="Вакансия"><option value="">${t('without_vacancy')}</option>${vacOptions}</select>
      <button type="button" class="field type-field" id="type-field" aria-label="Выбрать тесты"><span id="type-field-txt">${sendTypesText()}</span>${_svg('<path d="M6 9l6 6 6-6" stroke-linecap="round"/>')}</button>
      ${sendLangSelect()}
      <button class="btn" id="send-btn">${t('send_btn')}</button>
    </div>
    <div class="list-div reveal d3"></div>
    <div class="filterbar reveal d3">
      <select class="field sm" id="f-test" aria-label="Тип теста"><option value="">${t('f_all_tests')}</option><option value="result">${testTitle(`result`)}</option><option value="tools">${testTitle(`tools`)}</option><option value="logic">${testTitle(`logic`)}</option><option value="sales">${testTitle(`sales`)}</option></select>
      <select class="field sm" id="f-stage" aria-label="Этап"><option value="">${t('f_all_stages')}</option>${STAGES.map(s => `<option value="${s.id}">${tr(s.id)}</option>`).join('')}</select>
      <select class="field sm" id="f-status" aria-label="Статус"><option value="">${t('f_any_status')}</option><option value="done">${t('f_done')}</option><option value="pending">${t('f_pending')}</option></select>
      <select class="field sm" id="f-sort" aria-label="Сортировка"><option value="date">${t('sort_new')}</option><option value="name">${t('sort_name')}</option></select>
      <div class="search-wrap grow"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="search-box" aria-label="Поиск кандидатов" placeholder="${t('search')}"></div>
      <button class="btn ghost sm ic-btn" id="export-csv">${_svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>')}${t('export_csv')}</button>
    </div>
    <div class="table-wrap reveal d3"><table class="cand-table">
      <thead><tr><th>${t('col_candidate')}</th>${visibleCols().map(c => `<th>${colTh(c)}</th>`).join('')}<th class="res-col">${t('col_results')}</th><th class="col-cfg-th"><button id="col-cfg" title="Настройка столбцов" aria-label="Настройка столбцов">${_svg('<path d="M4 8h10M18 8h2M4 16h2M10 16h10" stroke-linecap="round"/><circle cx="16" cy="8" r="2.4"/><circle cx="8" cy="16" r="2.4"/>')}</button></th></tr></thead>
      <tbody id="rows"></tbody>
    </table></div>`;
  $$('.chip[data-sec]').forEach(b => b.onclick = async () => { state.activeSection = b.dataset.sec; state.activeVac = 'all'; await loadVacancies(); renderHome(); });
  $$('.chip[data-vac]').forEach(b => b.onclick = () => { state.activeVac = b.dataset.vac; renderHome(); });
  $('#add-bal').onclick = () => setView('balance');
  $('#send-btn').onclick = sendTest;
  $('#type-field').onclick = openTestPicker;
  wireSendLang(state.vacancies);
  $('#search-box').oninput = renderRows;
  ['f-test', 'f-stage', 'f-status', 'f-sort'].forEach(id => $('#' + id).onchange = renderRows);
  $('#export-csv').onclick = exportCsv;
  $('#col-cfg').onclick = openColConfig;
  renderRows();
}
// ---- test-type picker (cards modal) ----
let sendTypes = ['result'];
const TEST_META = {
  tools: { title: 'Тулс', desc: 'Тест на оценку характера и личностных качеств по 10 показателям', q: 200, min: 35 },
  result: { title: 'Резалт', desc: 'Сценарный тест для оценки продуктивности соискателя на предыдущей работе', q: 18, min: 15 },
  logic: { title: 'Логис', desc: 'Тест на проверку уровня интеллекта (IQ) — способности мыслить и принимать решения', q: 79, min: 30 },
  sales: { title: 'Сэйлс', desc: 'Тест на оценку способностей человека как специалиста в области продаж по 12 показателям', q: 120, min: 25 },
};
function sendTypesText() { return sendTypes.length ? sendTypes.map(x => testTitle(x)).join(', ') : t('pick_tests'); }
function openTestPicker() {
  const card = ty => { const m = TEST_META[ty], on = sendTypes.includes(ty); return `<div class="tcard ${on ? 'on' : ''}" data-tc="${ty}">
    <div class="tc-h"><span class="tc-ic res-${ty}">${TEST_ICON[ty]}</span><b>${testTitle(ty)}</b></div>
    <p>${testDesc(ty)}</p>
    <div class="tc-meta"><span>${_svg('<circle cx="12" cy="12" r="9"/><path d="M9.2 9.5a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.2-2.6 3.7M12 17h.01" stroke-linecap="round"/>')} ${m.q} ${t('q_word')}</span><span>${_svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6" stroke-linecap="round"/>')} ${m.min} ${t('min_word')}</span></div>
    <div class="tc-btn">${on ? t('test_selected') : t('select_test')}</div></div>`; };
  openModal(`<h2 style="margin:0 0 4px">${t('pick_title')}</h2>
    <p class="muted" style="margin:0 0 16px">${t('pick_sub')}</p>
    <div class="tcards">${['result', 'tools', 'logic', 'sales'].map(card).join('')}</div>
    <button class="btn" style="width:100%;margin-top:18px" id="tp-done">${t('done')}</button>`, true);
  const refresh = () => { $$('.tcard').forEach(c => { const on = sendTypes.includes(c.dataset.tc); c.classList.toggle('on', on); c.querySelector('.tc-btn').textContent = on ? t('test_selected') : t('select_test'); }); };
  $$('.tcard').forEach(c => c.onclick = () => { const ty = c.dataset.tc; if (sendTypes.includes(ty)) sendTypes = sendTypes.filter(x => x !== ty); else sendTypes.push(ty); refresh(); });
  $('#tp-done').onclick = () => { if (!sendTypes.length) return toast(t('pick_one')); closeModal(); const el = $('#type-field-txt'); if (el) el.textContent = sendTypesText(); };
}
function ratingStars(n) { n = n || 0; let s = ''; for (let i = 1; i <= 5; i++) s += `<span class="${i <= n ? '' : 'off'}">★</span>`; return `<span class="stars">${s}</span>`; }
function filteredParticipants() {
  const q = ($('#search-box') && $('#search-box').value || '').toLowerCase().trim();
  const ft = ($('#f-test') && $('#f-test').value) || '', fs = ($('#f-stage') && $('#f-stage').value) || '';
  const fst = ($('#f-status') && $('#f-status').value) || '', sort = ($('#f-sort') && $('#f-sort').value) || 'date';
  let list = state.participants.filter(p => {
    if (q && !(p.name + ' ' + p.surname + ' ' + p.email + ' ' + (p.tel || '') + ' ' + (p.city || '')).toLowerCase().includes(q)) return false;
    if (ft && !p.tests.some(t => t.type === ft)) return false;
    if (fs && (p.stage || 'Без этапа') !== fs) return false;
    if (fst === 'done' && !p.tests.some(t => t.status === 'done')) return false;
    if (fst === 'pending' && !p.tests.some(t => t.status !== 'done')) return false;
    return true;
  });
  const nmeOf = p => ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email || '';
  if (sort === 'name') list.sort((a, b) => nmeOf(a).localeCompare(nmeOf(b), 'ru'));
  else list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  // избранные — вверх (стабильно внутри группы)
  list = list.filter(p => p.starred).concat(list.filter(p => !p.starred));
  return list;
}
const shortId = p => '#' + String(p.id).replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();
async function toggleStar(pid, ev) {
  if (ev) ev.stopPropagation();
  const p = state.participants.find(x => x.id === pid); if (!p) return;
  p.starred = !p.starred;
  try { await api('/api/participants/' + pid, { method: 'PUT', body: JSON.stringify({ starred: p.starred }) }); } catch (e) { p.starred = !p.starred; return toast(e.message); }
  renderRows();
}
window.toggleStar = toggleStar;
function renderRows() {
  const list = filteredParticipants();
  const cc = $('#cand-count'); if (cc) cc.textContent = list.length;
  const rows = list.map(p => {
    const nm = (p.name || p.surname) ? (p.name + ' ' + p.surname).trim() : p.email;
    const resT = p.tests.find(t => t.type === 'result'), logT = p.tests.find(t => t.type === 'logic');
    const icons = p.tests.filter(t => t.status === 'done').map(t => `<span class="res-icon res-${t.type}" title="${testTitle(t.type)}" data-test="${t.id}">${TEST_ICON[t.type] || ICON_KNOWLEDGE}</span>`).join('');
    const dt = p.tests[0] ? fmtDate(p.tests[0].sentAt) : '';
    const pa = p.age ? `${esc(tr(p.sex || ''))} · ${p.age}` : esc(tr(p.sex) || '—');
    const sc = stageColor(p.stage);
    const ctx = { resT, logT, dt, pa };
    return `<tr data-pid="${p.id}"${sc ? ` style="box-shadow:inset 3px 0 0 ${sc}"` : ''}>
      <td><div class="cand"><button class="star-btn ${p.starred ? 'on' : ''}" data-star="${p.id}" title="Избранное" aria-label="Избранное">★</button><span class="avatar" style="background:${avColor(nm)}">${esc(initials(nm, p.email))}</span><b>${esc(nm)}</b></div></td>
      ${visibleCols().map(c => cellFor(c.key, p, ctx)).join('')}
      <td class="res-col">${icons || '<span class="muted">—</span>'}</td><td></td></tr>`;
  }).join('');
  $('#rows').innerHTML = rows || `<tr><td colspan="${visibleCols().length + 3}" class="muted" style="text-align:center;padding:44px">${state.participants.length ? 'Ничего не найдено по фильтрам.' : 'Пока нет кандидатов. Отправьте первый тест выше ↑'}</td></tr>`;
  $$('#rows tr[data-pid]').forEach(tr => tr.onclick = e => { const st = e.target.closest('.star-btn'); if (st) return toggleStar(st.dataset.star, e); const ic = e.target.closest('.res-icon'); if (ic) openReport(ic.dataset.test); else openParticipant(tr.dataset.pid); });
}
function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
function exportCsv(listArg) {
  const list = Array.isArray(listArg) ? listArg : filteredParticipants();
  if (!list.length) return toast(t('csv_no_data'));
  const head = [t('pm_name'), t('pm_surname'), 'Email', t('col_tel'), t('pm_sex'), t('pm_age'), t('pm_city'), t('pm_vacancy'), t('pm_stage'), t('csv_tests')];
  const lines = [head.map(csvCell).join(',')];
  list.forEach(p => lines.push([p.name, p.surname, p.email, p.tel, tr(p.sex), p.age, p.city, p.vacancyName,
    tr(p.stage || 'Без этапа'), p.tests.map(x => testTitle(x.type) + ':' + (x.status === 'done' ? t('csv_done') : t('csv_pending'))).join('; ')].map(csvCell).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kandidaty.csv';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Экспортировано: ' + list.length);
}
function langOptions(cur) { const list = state.langs.length ? state.langs : Object.keys(LANG_NAME).map(c => ({ code: c, name: LANG_NAME[c] })); return list.map(l => `<option value="${l.code}" ${cur === l.code ? 'selected' : ''}>${esc(langName(l.code))}</option>`).join(''); }
function sectionOptions(cur) { return `<option value="">${t(`no_section`)}</option>` + state.sections.map(s => `<option value="${s.id}" ${cur === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join(''); }
function vacancyModal(id) {
  const v = id ? state.vacancies.find(x => x.id === id) : null;
  const preSec = v ? (v.sectionId || '') : (state.activeSection !== 'all' ? state.activeSection : '');
  openModal(`<h2 style="margin:0 0 4px">${v ? t('vm_vacancy') : t('vm_add')}</h2>
    <p class="muted" style="margin:0 0 16px">${t('vm_hint')}</p>
    <label class="lbl">${t('vm_name')}</label><input class="field" id="vm-name" value="${v ? esc(v.name) : ''}" placeholder="${t('vm_name_ph')}">
    ${state.sections.length ? `<label class="lbl" style="margin-top:12px">${t('vm_section')}</label><select class="field" id="vm-sec">${sectionOptions(preSec)}</select>` : ''}
    <label class="lbl" style="margin-top:12px">${t('vm_lang')}</label><select class="field" id="vm-lang">${langOptions(v ? (v.lang || 'ru') : 'ru')}</select>
    <div class="row" style="margin-top:18px"><button class="btn" id="vm-save">${v ? t('save') : t('vm_add_btn')}</button>${v ? `<button class="btn ghost danger" id="vm-del">${t('pm_delete')}</button>` : ''}</div>`);
  $('#vm-name').focus();
  $('#vm-save').onclick = async () => {
    const name = $('#vm-name').value.trim(); if (!name) return toast(t('vm_need_name'));
    const body = { name, lang: $('#vm-lang').value, sectionId: $('#vm-sec') ? $('#vm-sec').value : (state.activeSection !== 'all' ? state.activeSection : null) };
    if (v) await api('/api/vacancies/' + id, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/api/vacancies', { method: 'POST', body: JSON.stringify(body) });
    await loadVacancies(true); closeModal(); renderHome();
  };
  const del = $('#vm-del'); if (del) del.onclick = async () => { if (!confirm(t('vm_del_confirm') + v.name + t('vm_del_tail'))) return; await api('/api/vacancies/' + id, { method: 'DELETE' }); state.activeVac = 'all'; await loadVacancies(true); closeModal(); renderHome(); };
}
function manageVacancy(id) { vacancyModal(id); }
async function addSection() { const name = prompt(t('sec_prompt')); if (!name) return; await api('/api/sections', { method: 'POST', body: JSON.stringify({ name: name.trim() }) }); await loadSections(); renderHome(); }
function manageSection(id) {
  const s = state.sections.find(x => x.id === id); if (!s) return;
  openModal(`<h2 style="margin:0 0 6px">${t('sec_modal_title')}</h2><p class="muted" style="margin:0 0 16px">${t('sec_modal_hint')}</p>
    <label class="lbl">${t('sec_lbl_name')}</label><input class="field" id="sec-name" value="${esc(s.name)}">
    <div class="row" style="margin-top:18px"><button class="btn" id="sec-save">${t('save')}</button><button class="btn ghost danger" id="sec-del">${t('sec_del_btn')}</button></div>`);
  $('#sec-name').focus();
  $('#sec-save').onclick = async () => { const name = $('#sec-name').value.trim(); if (!name) return toast(t('vm_need_name')); await api('/api/sections/' + id, { method: 'PUT', body: JSON.stringify({ name }) }); await loadSections(); closeModal(); renderHome(); };
  $('#sec-del').onclick = async () => { if (!confirm(t('sec_del_confirm') + s.name + t('sec_del_tail'))) return; await api('/api/sections/' + id, { method: 'DELETE' }); state.activeSection = 'all'; await loadSections(); await loadVacancies(true); closeModal(); renderHome(); };
}
async function showVacStats() {
  const d = await api('/api/stats/vacancies');
  const rows = d.vacancies.map(v => `<tr><td><b>${esc(v.name)}</b> <span class="langtag">${(v.lang || 'ru').toUpperCase()}</span></td><td class="mono">${v.candidates}</td><td class="mono">${v.testsDone}</td><td class="mono">${v.testsPending}</td></tr>`).join('')
    + (d.noVacancy.candidates ? `<tr><td class="muted">${t('stat_no_vac')}</td><td class="mono">${d.noVacancy.candidates}</td><td class="mono">${d.noVacancy.testsDone}</td><td class="mono">${d.noVacancy.testsPending}</td></tr>` : '');
  openModal(`<h2 style="margin:0 0 14px">${t('stat_title')}</h2>
    <div class="table-wrap" style="box-shadow:none;border:1px solid var(--line)"><table><thead><tr><th>${t('stat_vac_col')}</th><th>${t('stat_cands')}</th><th>${t('stat_done')}</th><th>${t('stat_pending')}</th></tr></thead><tbody>${rows || `<tr><td colspan="4" class="muted" style="text-align:center;padding:24px">${t('no_data')}</td></tr>`}</tbody></table></div>
    <button class="btn" style="width:100%;margin-top:16px" onclick="closeModal()">${t('close')}</button>`, true);
}
async function addVacancy() { vacancyModal(null); }
function fmtDate(iso) { if (!iso) return ''; const d = new Date(iso), p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function fmtDur(sec) { if (sec == null) return '—'; const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60, p = n => String(n).padStart(2, '0'); return `${p(h)}:${p(m)}:${p(s)}`; }

async function sendTest() {
  const emails = $('#emails').value.trim(), vacancyId = $('#vac-select').value;
  const types = sendTypes.slice();
  if (!emails) return toast('Укажите email кандидата');
  if (!types.length) return toast('Выберите хотя бы один тип теста');
  const vac = state.vacancies.find(v => v.id === vacancyId);
  const lang = ($('#send-lang') && $('#send-lang').value) || 'ru';
  const btn = $('#send-btn'); btn.disabled = true; btn.textContent = 'Отправка…';
  try { const d = await api('/api/tests/send', { method: 'POST', body: JSON.stringify({ emails, vacancyId, types, lang }) }); state.user = d.balance; showLinksModal(d.created, lang, vac ? vac.name : ''); $('#emails').value = ''; invalidateParts(); await renderHome(); }
  catch (e) { toast(e.message); btn.disabled = false; btn.textContent = 'Отправить'; }
}
// Подстановка переменных: поддержка нового синтаксиса $var$ и старого {var}
function fillTemplate(tpl, vars) {
  return String(tpl || '')
    .replace(/\$(\w+)\$/g, (m, k) => (vars[k] != null ? vars[k] : m))
    .replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
}
// Шаблон письма для конкретного теста и языка из mailTemplates.send
function mailFor(cat, item, lang) {
  const mt = state.user.settings && state.user.settings.mailTemplates;
  const t = mt && mt[cat] && mt[cat][item] && (mt[cat][item][lang] || mt[cat][item].ru);
  return t || { subject: '', body: '' };
}
function showLinksModal(created, lang, vacName) {
  lang = lang || 'ru';
  const byEmail = {};
  created.forEach(c => { (byEmail[c.email] = byEmail[c.email] || []).push(c); });
  const smsTpl = (state.user.settings && state.user.settings.smsTemplates && state.user.settings.smsTemplates[lang]) || '';
  const groups = Object.keys(byEmail).map(email => {
    const first = byEmail[email][0]; const isSms = first.channel === 'sms';
    const tpl = mailFor('send', first.type, lang);
    const vars = {
      name: (isSms ? 'кандидат' : email.split('@')[0]), candidate: (isSms ? 'кандидат' : email.split('@')[0]),
      client: state.user.name || '', company: state.user.company || 'наша компания',
      vac: vacName || '—', vacancy: vacName || '—', test: first.title,
      link: first.link, button_link: first.link, button_link_min: first.link,
      phone: isSms ? (first.email || '') : '', id_part: '', date_interview: ''
    };
    const links = byEmail[email].map(c => `<div class="pt-row"><span class="muted">${esc(testTitle(c.type))}</span>${c.queued ? `<span class="langtag" style="opacity:.75">${t('queued_badge')}</span>` : `<a href="${c.link}" target="_blank" style="max-width:62%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.link)}</a>`}</div>`).join('');
    const preview = isSms
      ? `<div class="email-preview sms"><div class="ep-subj">${_svg('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 18h6" stroke-linecap="round"/>')} SMS</div><div class="ep-body">${esc(fillTemplate(smsTpl, vars))}</div></div>`
      : `<div class="email-preview"><div class="ep-subj">${esc(fillTemplate(tpl.subject, vars))}</div><div class="ep-body">${htmlBody(fillTemplate(tpl.body, vars))}</div></div>`;
    return `<div class="link-group"><div class="lg-email">${esc(email)} <span class="langtag">${isSms ? 'SMS' : (lang || 'ru').toUpperCase()}</span></div>${links}${preview}</div>`;
  }).join('');
  openModal(`<div class="done-mark" style="color:var(--good);margin:0 auto 4px">${_svg('<circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9"/>')}</div><h2 style="text-align:center;margin-top:2px">${t('links_sent')}</h2>
    <p class="muted" style="text-align:center;margin:6px 0 18px">${created.some(c => c.queued) ? t('links_seq') : t('links_sub')}</p>
    <div class="test-panel">${groups}</div>
    <button class="btn" style="width:100%;margin-top:16px" onclick="closeModal()">${t('done')}</button>`);
}
function openModal(html, wide) {
  $('#modal-root').innerHTML = `<div class="overlay" id="ov"><div class="modal" style="${wide ? '' : 'max-width:640px'}"><button class="close" onclick="closeModal()">×</button>${html}</div></div>`;
  $('#ov').onclick = e => { if (e.target.id === 'ov') closeModal(); };
}
function closeModal() { $('#modal-root').innerHTML = ''; if (window.__onModalClose) { const f = window.__onModalClose; window.__onModalClose = null; f(); } }
window.closeModal = closeModal;

// ================= PARTICIPANT MODAL =================
let modalPart = null, modalWf = null, candReturn = null;
async function openParticipant(pid, returnFn) {
  const prevView = state.view;
  $('#main').classList.remove('vac-lock');
  candReturn = returnFn || (() => setView(prevView === 'vacancies' ? 'candidates' : prevView));
  modalPart = (await api('/api/participants/' + pid)).participant;
  modalWf = await api('/api/participants/' + pid + '/workflow?lang=' + LANG).catch(() => null);
  renderCandidatePage();
}
window.openParticipant = openParticipant;
// Ручное добавление кандидата: создаём пустую карточку и сразу открываем её —
// рекрутёр вписывает данные, выбирает вакансию и запускает цикл найма или отдельный тест
async function createCandidate(vacancyId, returnFn) {
  const d = await api('/api/participants', { method: 'POST', body: JSON.stringify({ vacancyId: vacancyId || null }) });
  openParticipant(d.participant.id, returnFn);
}
const colBadgeCls = c => c === 'hired' ? 'cs-hired' : c === 'rejected' ? 'cs-rej' : c === 'new' ? 'cs-new' : 'cs-stage';
// Пайплайн этапов кандидата (канбан-стиль) — видно, на каком этапе он сейчас
function candidatePipeline(wf) {
  const atDecision = wf.column === 'hired' || wf.column === 'rejected';
  const curKey = wf.column === 'new' ? (wf.stages[0] && wf.stages[0].key) : wf.column;
  const nodes = wf.stages.map((s, i) => {
    const st = s.passed === true ? 'ok' : s.passed === false ? 'no' : (!atDecision && s.key === curKey) ? 'cur' : 'wait';
    const ic = s.passed === true ? '✓' : s.passed === false ? '✕' : (i + 1);
    return `<div class="pipe-node ${st}"><div class="pipe-ic">${ic}</div><div class="pipe-lbl">${esc(s.title)}</div>${st === 'cur' ? `<div class="pipe-now">${rt('pipe_now')}</div>` : ''}</div>`;
  });
  const dec = wf.decision;
  const decSt = dec === 'hired' ? 'ok' : dec === 'rejected' ? 'no' : atDecision ? 'cur' : 'wait';
  const decLbl = dec === 'hired' ? rt('wf_hired') : dec === 'rejected' ? rt('wf_rejected') : rt('wf_decision');
  nodes.push(`<div class="pipe-node dec ${decSt}"><div class="pipe-ic">◆</div><div class="pipe-lbl">${esc(decLbl)}</div>${decSt === 'cur' ? `<div class="pipe-now">${rt('pipe_now')}</div>` : ''}</div>`);
  return `<div class="cand-pipe">${nodes.join('<span class="pipe-arrow">›</span>')}</div>`;
}
function renderCandidatePage() {
  const p = modalPart, wf = modalWf;
  const vacOptions = state.vacancies.map(v => `<option value="${v.id}" ${v.id === p.vacancyId ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
  const nm = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email;
  const stageBadge = wf ? `<span class="cand-stage ${colBadgeCls(wf.column)}">${esc(wf.columnTitle || '')}</span>` : '';
  const cvBtn = p.cv
    ? `<a class="btn ghost sm ic-btn cv-btn" href="${esc(p.cv.url)}" target="_blank" download="${esc(p.cv.name)}">${_svg('<path d="M14 3v5h5M8 13h8M8 17h5M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-5-5H9z"/>')}<span>${t('pm_cv')}</span></a>`
    : `<span class="cv-none">${t('pm_cv')}: —</span>`;
  $('#main').innerHTML = `
    <button class="btn ghost sm reveal" id="cand-back" style="margin-bottom:12px">← ${rt('cand_title')}</button>
    <div class="card cand-head reveal d1">
      <span class="avatar" style="width:52px;height:52px;border-radius:15px;font-size:19px;background:${avColor(nm)}">${esc(initials(nm, p.email))}</span>
      <div style="flex:1;min-width:0"><h1 style="margin:0;font-size:25px">${esc(nm)}</h1>
        <div class="muted" style="font-size:13.5px">${esc(p.email || p.tel || '')}${p.vacancyName ? ' · ' + (p.vacancyId ? `<a href="#" class="rep-vac-link" onclick="openVacancyPage('${esc(p.vacancyId)}');return false"><b>${esc(p.vacancyName)}</b></a>` : esc(p.vacancyName)) : ''}</div></div>
      ${stageBadge}<button class="btn ghost sm ic-btn no-print" id="cand-aicalls" title="${rt('aicalls_btn')}">${ICON_PHONE}<span>${rt('aicalls_btn')}</span></button>${cvBtn}</div>
    ${wf ? `<div class="card cand-pipe-card reveal d1" style="margin-top:14px">${candidatePipeline(wf)}</div>` : ''}
    <div class="cand-grid reveal d2" style="margin-top:14px">
      <div class="card"><div class="cfg-h">${rt('cand_info')}</div>
        <div class="form-grid">
          <div><label class="lbl">${t('pm_name')}</label><input class="field" id="f-name" value="${esc(p.name || '')}"></div>
          <div><label class="lbl">${t('pm_surname')}</label><input class="field" id="f-surname" value="${esc(p.surname || '')}"></div>
          <div><label class="lbl">${t('pm_email')}</label><input class="field" id="f-email" value="${esc(p.email || '')}"></div>
          <div><label class="lbl">${t('col_tel')}</label><input class="field" id="f-tel" value="${esc(p.tel || '')}"></div>
          <div><label class="lbl">${t('pm_city')}</label><input class="field" id="f-city" value="${esc(p.city || '')}"></div>
          <div><label class="lbl">${t('pm_vacancy')}</label><select class="field" id="f-vac"><option value="">${t('without_vacancy')}</option>${vacOptions}</select></div>
          <div><label class="lbl">${t('pm_sex')}</label><select class="field" id="f-sex"><option value="">—</option><option value="Мужской" ${p.sex === 'Мужской' ? 'selected' : ''}>${t('pm_male')}</option><option value="Женский" ${p.sex === 'Женский' ? 'selected' : ''}>${t('pm_female')}</option></select></div>
          <div><label class="lbl">${t('pm_age')}</label><input class="field" id="f-age" type="number" value="${esc(p.age || '')}"></div>
          <div class="full"><label class="lbl">${t('pm_comment')}</label><textarea class="field" id="f-comment" rows="2">${esc(p.comment || '')}</textarea></div>
          ${p.cv ? `<div class="full"><label class="lbl">${t('pm_cv')}</label><a class="cv-chip" href="${esc(p.cv.url)}" target="_blank" download="${esc(p.cv.name)}">${_svg('<path d="M14 3v5h5M8 13h8M8 17h5M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-5-5H9z"/>')}<span>${esc(p.cv.name)}</span></a></div>` : ''}
        </div>
        <div class="row" style="margin-top:16px;gap:8px"><button class="btn" id="save-part">${t('save')}</button><button class="btn ghost danger" id="del-part">${t('pm_delete')}</button></div>
      </div>
      <div class="card"><div class="cfg-h">${rt('wf_title')}</div>
        <div id="cand-steps">${candidateStepsPanel(wf)}</div>${sendMoreBlock()}</div>
    </div>`;
  $('#cand-back').onclick = () => candReturn();
  const acb = $('#cand-aicalls'); if (acb) acb.onclick = () => openAiCallsModal(p.id);
  $('#save-part').onclick = saveParticipant; $('#del-part').onclick = deleteParticipant;
  wirePhoneAgeMasks('#f-tel', '#f-age');
  wireCandidateSteps(); wireSendMore();
}
// ---------- Модалка «Звонки ИИ»: журнал звонков кандидата (транскрипты, записи, результаты) ----------
const AIC_STAT = { calling: ['sent', 'aic_st_calling'], analyzing: ['sent', 'aic_st_analyzing'], continuing: ['sent', 'aic_st_continuing'], done: ['done', 'aic_st_done'], failed: ['no', 'aic_st_failed'] };
function aicIsActive(c) { return c.status !== 'done' && c.status !== 'failed'; }
async function openAiCallsModal(pid) {
  window.__aicPid = pid; window.__aicTab = 'active'; window.__aicData = null; window.__aicOpen = {};
  mkDecodeModal(`<div class="aic-wrap">
    <div class="aic-head"><h2>${ICON_PHONE} ${rt('aicalls_title')}</h2>
      <button class="btn soft xs" id="aic-refresh">${rt('aicalls_refresh')}</button></div>
    <div class="aic-tabs"><button class="aic-tab on" data-aictab="active">${rt('aicalls_tab_active')}</button><button class="aic-tab" data-aictab="history">${rt('aicalls_tab_history')}</button></div>
    <div id="aic-body"><div class="aic-load"><span class="db-spin"></span></div></div></div>`, true);
  $('#aic-refresh').onclick = () => refreshAiCalls(pid);
  loadAiCalls(pid);
}
async function loadAiCalls(pid) {
  try { window.__aicData = await api('/api/participants/' + pid + '/ai-calls'); renderAiCalls(); }
  catch (e) { const b = $('#aic-body'); if (b) b.innerHTML = `<p class="muted" style="padding:16px">${esc(e.message)}</p>`; }
}
async function refreshAiCalls(pid) {
  const r = $('#aic-refresh'); if (r) { r.disabled = true; r.innerHTML = '<span class="db-spin"></span>'; }
  try { window.__aicData = await api('/api/participants/' + pid + '/ai-calls/refresh', { method: 'POST' }); renderAiCalls(); refreshCandidateCard(); }
  catch (e) { toast(e.message); }
  if (r) { r.disabled = false; r.textContent = rt('aicalls_refresh'); }
}
function renderAiCalls() {
  const body = $('#aic-body'); if (!body) return;
  const d = window.__aicData || { calls: [] };
  $$('.aic-tab').forEach(b => { b.classList.toggle('on', b.dataset.aictab === window.__aicTab); b.onclick = () => { window.__aicTab = b.dataset.aictab; renderAiCalls(); }; });
  const list = (d.calls || []).filter(c => window.__aicTab === 'active' ? aicIsActive(c) : !aicIsActive(c));
  if (!list.length) { body.innerHTML = `<p class="muted" style="padding:22px;text-align:center">${rt(window.__aicTab === 'active' ? 'aicalls_no_active' : 'aicalls_no_history')}</p>`; return; }
  body.innerHTML = list.map(aicCard).join('');
  // Раскрытие транскриптов
  $$('[data-aictr]').forEach(b => b.onclick = () => { const el = $('#' + b.dataset.aictr); if (el) { el.classList.toggle('open'); b.classList.toggle('on'); } });
}
function aicCard(c) {
  const st = AIC_STAT[c.status] || ['', c.status];
  const when = c.createdAt ? fmtDate(c.createdAt) : '';
  const analysis = c.analysis && !c.analysis.complete && c.analysis.reason
    ? `<div class="aic-cut">⚠ ${esc(c.analysis.reason)}${(c.analysis.remaining || []).length ? ' · ' + rt('aicalls_remaining') + ': ' + esc(c.analysis.remaining.join(', ')) : ''}</div>` : '';
  const attempts = (c.attempts || []).map(a => {
    const trId = 'aictr-' + c.id + '-' + a.n;
    const meta = [a.durationSec != null ? fmtDur(a.durationSec) : '', a.endedReason ? esc(a.endedReason) : ''].filter(Boolean).join(' · ');
    const audio = a.recordingUrl ? `<audio class="aic-audio" controls preload="none" src="${esc(a.recordingUrl)}"></audio>` : `<span class="muted" style="font-size:12px">${rt('aicalls_no_rec')}</span>`;
    const tr = a.transcript ? `<button class="btn ghost xs" data-aictr="${trId}">${rt('aicalls_transcript')}</button><div class="aic-tr" id="${trId}"><pre>${esc(a.transcript)}</pre></div>` : `<span class="muted" style="font-size:12px">${rt('aicalls_no_tr')}</span>`;
    return `<div class="aic-att"><div class="aic-att-h"><b>${rt('aicalls_attempt')} ${a.n}${a.continuation ? ' · ' + rt('aicalls_cont') : ''}</b>${meta ? `<span class="muted">${meta}</span>` : ''}</div>
      <div class="aic-att-b">${audio}${tr}</div></div>`;
  }).join('');
  const answers = (c.answers || []).length
    ? `<div class="aic-ans"><div class="aic-ans-h">${rt('aicalls_answers')}</div>${c.answers.map(a => `<div class="aic-qa"><span>${esc(a.label)}</span><b>${esc(a.value)}</b></div>`).join('')}</div>` : '';
  const summary = c.summary ? `<div class="aic-sum">${esc(c.summary)}</div>` : '';
  return `<div class="aic-card">
    <div class="aic-card-h"><b>${esc(c.title)}</b><span class="cstep-st ${st[0]}">${rt(st[1])}</span></div>
    <div class="aic-when">${esc(when)}${c.to ? ' · ' + esc(c.to) : ''}${(c.attempts || []).length > 1 ? ' · ' + (c.attempts.length) + ' ' + rt('aicalls_calls') : ''}</div>
    ${analysis}${summary}${answers}
    <div class="aic-atts">${attempts}</div></div>`;
}
function candidateStepsPanel(wf) {
  if (!wf) return `<p class="muted">${t('tp_none')}</p>`;
  const stBadge = s => {
    if (s.skipped) return `<span class="cstep-st">${rt('wf_skipped')}</span>`;
    if (s.passed === true) return `<span class="cstep-st ok">${rt('wf_pass')}</span>`;
    if (s.passed === false) return `<span class="cstep-st no">${rt('wf_fail')}</span>`;
    if (s.status === 'done' || s.done) return `<span class="cstep-st done">${rt('wf_pass')}</span>`;
    if (s.status === 'sent' || s.status === 'in_progress') return `<span class="cstep-st sent">${t('tst_prog')}</span>`;
    return `<span class="cstep-st">${rt('wf_pending')}</span>`;
  };
  const mkRow = (s) => {
    const isTest = s.kind === 'test' || s.kind === 'knowledge' || !s.kind; // optional-оценки приходят без kind
    // Иконка шага: тесты — свои, референсы — трубка, мотивация — огонёк
    const logo = s.kind === 'references' ? `<span class="cstep-ic" style="background:#e4f6ec;color:#1f9d6b">${ICON_PHONE}</span>`
      : s.kind === 'motivation' ? `<span class="cstep-ic" style="background:#fff0e6;color:#d3641e">${ICON_FLAME}</span>`
      : isTest ? `<span class="cstep-ic res-${s.key}">${TEST_ICON[s.key] || ICON_KNOWLEDGE}</span>` : '';
    let act = '';
    if (s.skipped) {
      // Пропущенный этап: только кнопка «вернуть в процесс»
      return `<div class="cstep skip"><div class="cstep-row">${logo}
        <div class="cstep-main"><b>${esc(s.title)}</b></div>${stBadge(s)}
        <div class="cstep-act"><button class="btn ghost xs" data-cunskip="${s.skipKey || s.key}" title="${rt('wf_unskip')}">↩</button></div></div></div>`;
    }
    if (isTest) {
      // Кнопки по состоянию: не отправлен → «Отправить»; отправлен, но не начат → «Отправить повторно»;
      // начат → без кнопок (тест проходит только кандидат); пройден → «Смотреть результат»
      if (s.status === 'done') act = `<button class="btn ghost xs" data-cres="${s.testId}">${rt('wf_see_res')}</button>`;
      else if (s.status === 'none') act = s.key === 'knowledge' ? `<button class="btn soft xs" data-csendkn="${s.ktId || ''}">${t('send_btn')}</button>` : `<button class="btn soft xs" data-csend="${s.key}">${t('send_btn')}</button>`;
      else if (s.status === 'sent') act = `<button class="btn soft xs" data-cresend="${s.testId}">${rt('wf_resend')}</button>`;
    } else if (s.kind === 'motivation' || s.kind === 'references') {
      // Не завершено — «Провести» (открывает модалку с вопросами); завершено — ✎ (та же модалка с ответами)
      const refAttr = s.refIndex != null ? ` data-refidx="${s.refIndex}"` : '';
      act = s.done ? `<button class="btn ghost xs" data-cform="${s.kind}"${refAttr} title="✎">✎</button>`
        : `<button class="btn soft xs" data-cform="${s.kind}"${refAttr}>${rt('wf_conduct')}</button>`;
      // ИИ-референс: кнопка звонка ИИ по контакту руководителя (телефон есть, тумблер включён, Vapi настроен)
      if (s.kind === 'references' && s.aiCall && s.phone) {
        const aiRef = s.aiStatus === 'calling'
          ? `<span class="cstep-st sent" id="refai-${s.refIndex}"><span class="db-spin"></span> ${rt('refai_calling')}</span>`
          : `<button class="btn soft xs" data-refaicall="${s.refIndex}" title="${rt('refai_hint')}">${AI_IC} ${rt('refai_btn')}</button>`;
        act = aiRef + act;
      }
    }
    // Кнопка ИИ-анализа: открывает модалку с полным разбором
    let aiBtn = '';
    if (s.analysis && (s.analysis.verdict || (s.analysis.notes || []).length)) {
      window.__cstepAI = window.__cstepAI || [];
      const idx = window.__cstepAI.push({ title: s.title, analysis: s.analysis }) - 1;
      aiBtn = `<button class="btn ghost xs" data-cai="${idx}" title="ИИ-анализ">${AI_IC}</button>`;
    }
    // Тест отправлен и не пройден — снизу плашки ссылка на тест и кнопка «Скопировать»
    const linkRow = isTest && s.testCode && s.status !== 'done' && s.status !== 'none'
      ? `<div class="cstep-link"><span class="muted">${t('tp_link')}:</span><a href="${location.origin}/t/${s.testCode}" target="_blank">${location.origin}/t/${s.testCode}</a><button class="btn ghost xs ic-btn" onclick="copyLink('${location.origin}/t/${s.testCode}')">${ICON_COPY}${t('ak_copy')}</button></div>` : '';
    // Кнопка «Смотреть результат (звонок ИИ)» — если по этапу ИИ собрал ответы
    let seeAi = '';
    if (s.aiResult && (s.aiResult.answers || []).length) {
      window.__aicRes = window.__aicRes || [];
      const idx = window.__aicRes.push({ title: s.title, res: s.aiResult }) - 1;
      seeAi = `<button class="btn ghost xs" data-caires="${idx}" title="${rt('wf_see_ai')}">${AI_IC}</button>`;
    }
    // Кнопка «пропустить шаг» — для обязательных этапов, которые ещё не пройдены
    const skipBtn = s.skipKey && s.passed == null && s.status !== 'done' && !s.done
      ? `<button class="btn ghost xs cstep-skip" data-cskip="${s.skipKey}" title="${rt('wf_skip')}">✕</button>` : '';
    return `<div class="cstep ${s.passed === true ? 'ok' : s.passed === false ? 'no' : ''}">
      <div class="cstep-row">${logo}
      <div class="cstep-main"><b>${esc(s.title)}</b>${s.analysis && s.analysis.verdict ? `<span class="cstep-ai">${esc(s.analysis.verdict)}</span>` : ''}</div>
      ${stBadge(s)}<div class="cstep-act" style="display:flex;gap:5px">${act}${seeAi}${aiBtn}${skipBtn}</div></div>${linkRow}</div>`;
  };
  window.__cstepAI = []; window.__aicRes = [];
  const rows = [];
  wf.stages.forEach(s => {
    // Несколько тестов знаний — отдельная плашка на каждый
    if (s.skipped) {
      rows.push(mkRow(s));
    } else if (s.key === 'knowledge' && s.items && s.items.length) {
      s.items.forEach(it => rows.push(mkRow({ kind: 'knowledge', key: 'knowledge', ktId: it.ktId, skipKey: 'knowledge',
        title: s.title + ' · ' + it.name, status: it.status, testId: it.testId, testCode: it.testCode,
        passed: it.status === 'done' ? it.pass === true : null,
        analysis: it.percent != null ? { verdict: it.percent + '%' } : null })));
    } else if (s.kind === 'references' && s.refs && s.refs.length) {
      // Референс на каждого руководителя, указанного кандидатом в «Резалте»
      s.refs.forEach(r => {
        const nm2 = ((r.contact.name || '') + ' ' + (r.contact.surname || '')).trim() || (r.contact.phone || '');
        rows.push(mkRow({ kind: 'references', key: 'references', refIndex: r.i, skipKey: 'references',
          title: s.title + ' · ' + nm2 + (r.contact.position ? ' (' + r.contact.position + ')' : '') + (r.contact.phone ? ' · ' + r.contact.phone : ''),
          done: r.done, passed: r.done ? r.tone !== 'low' : null,
          analysis: r.verdict ? { verdict: r.verdict } : null, aiResult: r.aiResult,
          aiCall: s.aiCall, phone: r.phone, aiStatus: r.aiStatus }));
      });
    } else rows.push(mkRow(Object.assign({ skipKey: s.key }, s)));
    if (s.key === 'tools' && wf.optional) wf.optional.forEach(o => rows.push(mkRow(Object.assign({ skipKey: 'opt:' + o.key }, o))));
  });
  // Карточки собеседований — над итоговым решением; повторное приглашение добавляет новую
  (wf.interviews || []).forEach((iv, i) => {
    const filled = iv.impressions || iv.notes || iv.date;
    rows.push(`<div class="cstep ${filled ? 'ok' : ''}">
      <div class="cstep-row"><span class="cstep-ic" style="background:#fff4e0;color:#b5791a">${_svg('<path d="M8 2v3M16 2v3M3.5 9h17"/><rect x="3.5" y="4" width="17" height="17" rx="2.5"/>')}</span>
      <div class="cstep-main"><b>${rt('iv_title')} ${i + 1}${iv.date ? ' · ' + esc(iv.date.replace('T', ' ')) : ''}</b>
      ${iv.impressions ? `<span class="cstep-ai">${esc(iv.impressions)}</span>` : ''}</div>
      <span class="cstep-st ${filled ? 'done' : 'sent'}">${filled ? rt('iv_done') : rt('iv_planned')}</span>
      <div class="cstep-act"><button class="btn ${filled ? 'ghost' : 'soft'} xs" data-civ="${iv.id}">${filled ? '✎' : rt('iv_fill')}</button></div></div></div>`);
  });
  const dec = wf.decision, auto = wf.autoDecision || {}, rec = !dec ? auto.decision : null;
  const decTxt = dec === 'hired' ? rt('wf_hired') : dec === 'rejected' ? rt('wf_rejected') : rec ? (auto.verdict || '') : rt('wf_inprogress');
  const decCls = dec === 'hired' ? 'd-hired' : dec === 'rejected' ? 'd-rej' : rec === 'hired' ? 'd-rec-hire' : rec === 'rejected' ? 'd-rec-rej' : '';
  const decBox = `<div class="cstep-dec ${decCls}"><span class="muted">${rt('wf_decision')}:</span> <b>${esc(decTxt)}</b>
    <span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">
    ${dec ? `<button class="btn ghost xs" data-cdec="reset">${rt('dec_change')}</button>`
      : `<button class="btn xs" data-cdec="hired">${rt('dec_hire')}</button>
         <button class="btn soft xs" data-cdec="interview">${rt('dec_interview')}</button>
         <button class="btn ghost danger xs" data-cdec="rejected">${rt('wf_rejected')}</button>`}
    </span></div>`;
  // Финальный ИИ-анализ: общее заключение по всем этапам + заявка + объявление
  const fa = wf.finalAnalysis;
  window.__finalA = fa || null;
  const faTone = fa ? (fa.verdict === 'hire' ? 'good' : fa.verdict === 'reject' ? 'low' : 'mid') : '';
  const faTxt = fa ? (fa.verdict === 'hire' ? rt('wf_final_hire') : fa.verdict === 'reject' ? rt('wf_final_reject') : rt('wf_final_consider')) : '';
  const canRun = wf.finalReady || !!fa;
  const finalBox = `<div class="cfinal ${fa ? 'has tone-' + faTone : ''}">
    <div class="cfinal-top">
      <div class="cfinal-l">${AI_IC} ${fa ? `<span class="cfinal-badge ${faTone}">${faTxt} · ${fa.fit_score}%</span><b>${esc(fa.headline)}</b>` : `<b>${rt('wf_final_h')}</b><span class="muted">${rt(canRun ? 'wf_final_hint' : 'wf_final_locked')}</span>`}</div>
      <div class="cfinal-act">
        ${fa ? `<button class="btn ghost xs" id="cfinal-view">${rt('wf_final_view')}</button>` : ''}
        <button class="btn ${fa ? 'ghost' : 'soft'} xs" id="cfinal-run"${canRun ? '' : ' disabled'}>${AI_IC} ${fa ? rt('wf_final_rerun') : rt('wf_final_run')}</button>
      </div></div></div>`;
  return `<div class="csteps">${rows.join('')}</div>${finalBox}${decBox}`;
}
function wireCandidateSteps() {
  $$('[data-cres]').forEach(b => b.onclick = () => openReport(b.dataset.cres));
  // Пропустить / вернуть этап процесса найма
  $$('[data-cskip]').forEach(b => b.onclick = async () => {
    await api('/api/participants/' + modalPart.id + '/gate', { method: 'POST', body: JSON.stringify({ stage: b.dataset.cskip, skip: true }) });
    refreshCandidateCard();
  });
  $$('[data-cunskip]').forEach(b => b.onclick = async () => {
    await api('/api/participants/' + modalPart.id + '/gate', { method: 'POST', body: JSON.stringify({ stage: b.dataset.cunskip, skip: false }) });
    refreshCandidateCard();
  });
  $$('[data-cresend]').forEach(b => b.onclick = async () => {
    try { await api('/api/tests/' + b.dataset.cresend + '/resend', { method: 'POST' }); toast(rt('wf_resent')); refreshCandidateCard(); }
    catch (e) { toast(e.message); }
  });
  // ИИ-анализ этапа — в отдельной модалке
  $$('[data-cai]').forEach(b => b.onclick = () => {
    const a = (window.__cstepAI || [])[+b.dataset.cai]; if (!a) return;
    openModal(`<div class="report-head"><h2 style="margin:0;font-size:20px">${AI_IC} ${esc(a.title)}</h2></div>
      <div class="ai-note tone-${a.analysis.tone || 'good'}"><div class="ai-h">${esc(a.analysis.verdict || '')}</div>
      ${(a.analysis.notes || []).length ? `<ul>${a.analysis.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</div>`, true);
  });
  // «Смотреть результат (звонок ИИ)» — собранные ИИ ответы по этапу
  $$('[data-caires]').forEach(b => b.onclick = () => {
    const r = (window.__aicRes || [])[+b.dataset.caires]; if (!r) return;
    const rows2 = (r.res.answers || []).map(a => `<div class="aic-qa"><span>${esc(a.label)}</span><b>${esc(a.value)}</b></div>`).join('');
    openModal(`<div class="report-head"><h2 style="margin:0;font-size:20px">${AI_IC} ${rt('aic_result_title')}</h2><span class="tag">${esc(r.title)}</span></div>
      ${r.res.summary ? `<div class="aic-sum" style="margin:0 0 12px">${esc(r.res.summary)}</div>` : ''}
      <div class="aic-ans">${rows2}</div>`, true);
  });
  // Референсы и мотивация — модалки с вопросами (и прежними ответами)
  $$('[data-cform]').forEach(b => b.onclick = () => {
    if (b.dataset.cform === 'references') openReferencesForm(modalPart.id, modalWf, refreshCandidateCard, b.dataset.refidx !== undefined && b.dataset.refidx !== '' ? +b.dataset.refidx : null);
    else openMotivationForm(modalPart.id, modalWf, refreshCandidateCard);
  });
  // ИИ-референс: ИИ сам звонит руководителю и собирает справку
  $$('[data-refaicall]').forEach(b => b.onclick = async () => {
    const refIndex = +b.dataset.refaicall, pid = modalPart.id;
    b.disabled = true;
    try {
      await api('/api/participants/' + pid + '/references/ai-call', { method: 'POST', body: JSON.stringify({ refIndex }) });
      toast(rt('refai_started'));
      await refreshCandidateCard();
      pollRefAiCall(pid, refIndex);
    } catch (e) { b.disabled = false; toast((e && e.message) || rt('refai_err')); }
  });
  // Финальный ИИ-анализ кандидата (по всем этапам + заявка + объявление)
  const fRun = $('#cfinal-run'); if (fRun) fRun.onclick = async () => {
    fRun.disabled = true; const old = fRun.innerHTML; fRun.innerHTML = `<span class="db-spin"></span> ${rt('wf_final_running')}`;
    try {
      const d = await api('/api/participants/' + modalPart.id + '/final-analysis', { method: 'POST' });
      window.__finalA = d.finalAnalysis;
      openFinalModal(d.finalAnalysis);
      await refreshCandidateCard();
    } catch (e) { toast((e && e.message) || 'Ошибка'); fRun.disabled = false; fRun.innerHTML = old; }
  };
  const fView = $('#cfinal-view'); if (fView) fView.onclick = () => { if (window.__finalA) openFinalModal(window.__finalA); };
  // Итоговое решение; «Пригласить на собеседование» создаёт карточку собеседования
  $$('[data-cdec]').forEach(b => b.onclick = async () => {
    const v = b.dataset.cdec;
    if (v === 'interview') {
      const d = await api('/api/participants/' + modalPart.id + '/interviews', { method: 'POST' });
      toast(rt('iv_created'));
      await refreshCandidateCard();
      openInterviewForm(modalPart.id, d.interview, refreshCandidateCard);
      return;
    }
    await api('/api/participants/' + modalPart.id + '/gate', { method: 'POST', body: JSON.stringify({ decision: v === 'reset' ? null : v }) });
    refreshCandidateCard();
  });
  // Редактирование карточки собеседования
  $$('[data-civ]').forEach(b => b.onclick = () => {
    const iv = ((modalWf && modalWf.interviews) || []).find(x => x.id === b.dataset.civ);
    if (iv) openInterviewForm(modalPart.id, iv, refreshCandidateCard);
  });
  $$('[data-csend]').forEach(b => b.onclick = () => sendCandidateTest(b.dataset.csend));
  $$('[data-csendkn]').forEach(kn => kn.onclick = async () => {
    try { await api('/api/participants/' + modalPart.id + '/send-knowledge', { method: 'POST', body: JSON.stringify({ ktId: kn.dataset.csendkn || undefined }) }); toast(rt('common_saved')); refreshCandidateCard(); }
    catch (e) { toast(e.message); }
  });
}
// Модалка финального ИИ-анализа — в стиле ИИ-плашек портала (.ai-note tone-*)
function openFinalModal(fa) {
  if (!fa) return;
  const tone = fa.verdict === 'hire' ? 'win' : fa.verdict === 'reject' ? 'low' : 'mid';
  const vTxt = fa.verdict === 'hire' ? rt('wf_final_hire') : fa.verdict === 'reject' ? rt('wf_final_reject') : rt('wf_final_consider');
  const list = (arr, cls) => (arr && arr.length) ? `<ul class="fin-list ${cls}">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  openModal(`<div class="report-head"><h2 style="margin:0;font-size:20px">${AI_IC} ${rt('wf_final_title')}</h2>
      <span class="fin-badge ${tone}">${vTxt} · ${fa.fit_score}%</span></div>
    <div class="ai-note tone-${tone}">
      <div class="ai-h">${esc(fa.headline || '')}</div>
      <div class="fin-fit"><div class="fin-fit-bar"><i style="width:${fa.fit_score}%"></i></div><span>${rt('wf_final_fit')}: <b>${fa.fit_score}%</b></span></div>
      ${fa.summary ? `<p class="fin-sum">${esc(fa.summary)}</p>` : ''}
      ${fa.strengths && fa.strengths.length ? `<div class="fin-h good">${rt('wf_final_strengths')}</div>${list(fa.strengths, 'good')}` : ''}
      ${fa.concerns && fa.concerns.length ? `<div class="fin-h risk">${rt('wf_final_concerns')}</div>${list(fa.concerns, 'risk')}` : ''}
      ${fa.recommendation ? `<div class="fin-h">${rt('wf_final_reco')}</div><p class="fin-sum">${esc(fa.recommendation)}</p>` : ''}
    </div>
    ${fa.at ? `<div class="muted" style="font-size:11.5px;margin-top:8px">${rt('wf_final_at')}: ${fmtDate(fa.at)}</div>` : ''}`, true);
}
async function sendCandidateTest(type) {
  try { const d = await api('/api/participants/' + modalPart.id + '/send-test', { method: 'POST', body: JSON.stringify({ type }) }); if (d.balance) state.user = d.balance; toast(t('pm_sent')); refreshCandidateCard(); }
  catch (e) { toast(e.message); }
}
async function refreshCandidateCard() {
  modalPart = (await api('/api/participants/' + modalPart.id)).participant;
  modalWf = await api('/api/participants/' + modalPart.id + '/workflow?lang=' + LANG).catch(() => null);
  // держим клиентский кэш в актуальном виде после правок в карточке
  const i = state.allParticipants.findIndex(p => p.id === modalPart.id);
  if (i >= 0) state.allParticipants[i] = modalPart; else invalidateParts();
  renderCandidatePage();
}
function sendMoreBlock() {
  return `<div class="send-more"><div class="lbl" style="margin-bottom:7px">${t('pm_send_more')}</div>
    <div class="row" style="gap:8px"><select class="field sm" id="more-type" style="flex:1" aria-label="Тип теста">
      <option value="result">${t('pm_opt_result')}</option><option value="tools">${t('pm_opt_tools')}</option>
      <option value="logic">${t('pm_opt_logic')}</option><option value="sales">${t('pm_opt_sales')}</option></select>
      <button class="btn soft sm" id="more-send">${t('send_btn')}</button></div></div>`;
}
function wireSendMore() {
  const b = $('#more-send'); if (!b) return;
  b.onclick = async () => {
    b.disabled = true; b.textContent = t('sending') || 'Отправка…';
    try {
      const d = await api('/api/participants/' + modalPart.id + '/send-test', { method: 'POST', body: JSON.stringify({ type: $('#more-type').value }) });
      state.user = d.balance; toast(t(`pm_sent`));
      await refreshCandidateCard();
    } catch (e) { toast(e.message); b.disabled = false; b.textContent = t('send_btn'); }
  };
}
async function deleteTest(testId) {
  if (!confirm('Удалить этот тест? Если он ещё не пройден, бронь теста вернётся на баланс.')) return;
  const d = await api('/api/tests/' + testId, { method: 'DELETE' });
  state.user = d.balance; toast('Тест удалён');
  await refreshCandidateCard();
}
window.copyLink = (text) => { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Ссылка скопирована')).catch(() => { const i = document.createElement('input'); i.value = text; document.body.appendChild(i); i.select(); try { document.execCommand('copy'); toast('Ссылка скопирована'); } catch (_) { toast('Не удалось скопировать'); } i.remove(); }); };
function renderTestPanel() {
  const tests = modalPart.tests;
  if (!tests.length) { $('#test-panel').innerHTML = `<p class="muted" style="margin:0 0 14px">${t('tp_none')}</p>` + sendMoreBlock(); wireSendMore(); return; }
  if (carouselIdx >= tests.length) carouselIdx = 0;
  const t2 = tests[carouselIdx];
  const nav = tests.length > 1;
  const st = t2.status === 'done' ? `<span class="status-dot done">${t('tst_done')}</span>` : t2.status === 'in_progress' ? `<span class="status-dot prog">${t('tst_prog')}</span>` : `<span class="status-dot">${t('tst_wait')}</span>`;
  $('#test-panel').innerHTML = `
    <div class="carousel-head">${nav ? `<button id="c-prev" aria-label="${t('prev_test')}">‹</button>` : ''}<span>${TEST_ICON[t2.type]} ${testTitle(t2.type)}${nav ? ` <span class="muted" style="font-size:12px">${carouselIdx + 1}/${tests.length}</span>` : ''}</span>${nav ? `<button id="c-next" aria-label="${t('next_test')}">›</button>` : ''}</div>
    <div class="pt-row"><span class="muted">${t('tp_started')}</span><b>${t2.startedAt ? fmtDate(t2.startedAt) : '—'}</b></div>
    <div class="pt-row"><span class="muted">${t('tp_finished')}</span><b>${t2.finishedAt ? fmtDate(t2.finishedAt) : '—'}</b></div>
    <div class="pt-row"><span class="muted">${t('tp_time')}</span><b class="mono">${fmtDur(t2.durationSec)}</b></div>
    <div class="pt-row"><span class="muted">${t('tp_status')}</span>${st}</div>
    <div class="pt-row" style="flex-direction:column;align-items:flex-start;gap:6px"><span class="muted">${t('tp_link')}</span>
      <div class="row" style="gap:6px;width:100%"><a href="${t2.link}" target="_blank" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t2.link)}</a>
      <button class="btn ghost xs ic-btn" id="copy-link" title="${t('tp_copy')}" aria-label="${t('tp_copy')}">${ICON_COPY}</button></div></div>
    <div class="row" style="gap:8px;margin-top:14px">
      ${t2.status === 'done' ? `<button class="btn" style="flex:1" id="see-res">${t('tp_see')}</button>` : `<button class="btn ghost" style="flex:1" onclick="window.open('${t2.link}','_blank')">${t('tp_open')}</button>`}
      <button class="btn ghost danger sm ic-btn" id="del-test" title="${t('tp_del')}" aria-label="${t('tp_del')}">${ICON_TRASH}</button></div>
    ${sendMoreBlock()}`;
  if (nav) { $('#c-prev').onclick = () => { carouselIdx = (carouselIdx - 1 + tests.length) % tests.length; renderTestPanel(); }; $('#c-next').onclick = () => { carouselIdx = (carouselIdx + 1) % tests.length; renderTestPanel(); }; }
  const see = $('#see-res'); if (see) see.onclick = () => openReport(t2.id);
  $('#copy-link').onclick = () => copyLink(t2.link);
  $('#del-test').onclick = () => deleteTest(t2.id);
  wireSendMore();
}
async function saveParticipant() {
  const p = modalPart;
  const tel = $('#f-tel').value.trim(), age = $('#f-age').value.trim();
  // телефон 9–15 цифр; возраст — две цифры, 16–79
  if (tel && (tel.replace(/\D/g, '').length < 9 || tel.replace(/\D/g, '').length > 15)) return toast(rt('v_bad_phone'));
  if (age && (!/^\d{2}$/.test(age) || +age < 16 || +age > 79)) return toast(rt('v_bad_age'));
  const body = { name: $('#f-name').value, surname: $('#f-surname').value, email: $('#f-email').value, tel, city: $('#f-city').value, vacancyId: $('#f-vac').value, sex: $('#f-sex').value, age: age ? parseInt(age, 10) : null, comment: $('#f-comment').value };
  await api('/api/participants/' + p.id, { method: 'PUT', body: JSON.stringify(body) }); toast(t(`saved`)); await refreshCandidateCard();
}
// Маски: телефон — только +, цифры, пробелы, скобки, дефис; возраст — две цифры
function wirePhoneAgeMasks(telSel, ageSel) {
  const tel = $(telSel); if (tel) tel.addEventListener('input', () => { tel.value = tel.value.replace(/[^\d+\s()-]/g, '').replace(/(?!^)\+/g, ''); });
  const age = $(ageSel); if (age) age.addEventListener('input', () => { age.value = age.value.replace(/\D/g, '').slice(0, 2); });
}
async function deleteParticipant() { if (!confirm(t(`pm_del_confirm`))) return; const d = await api('/api/participants/' + modalPart.id, { method: 'DELETE' }); if (d.balance) state.user = d.balance; toast(t(`pm_deleted`)); invalidateParts(); if (candReturn) candReturn(); else setView('candidates'); }

// ================= REPORTS =================
async function openReport(testId) {
  $('#main').classList.remove('vac-lock');
  history.replaceState(null, '', '/result/' + testId);
  const d = await api('/api/tests/' + testId + '/result?lang=' + LANG); closeModal();
  ({ tools: renderToolsReport, result: renderResultReport, sales: renderSalesReport, logic: renderLogicReport, knowledge: renderKnowledgeReport }[d.test.type] || renderLogicReport)(d);
  requestAnimationFrame(initAiNeu);
}
// Отчёт по проверке знаний (свой рендер — не IQ)
function renderKnowledgeReport(d) {
  const r = d.result || {};
  const qs = (r.details || []).map((q, i) => {
    const givenArr = Array.isArray(q.given) ? q.given.map(Number) : [Number(q.given)];
    return `<div class="card q-card" style="margin-bottom:10px">
      <div class="row" style="gap:8px;align-items:flex-start"><b style="flex:1">${i + 1}. ${esc(q.text)}</b><span class="cstep-st ${q.ok ? 'ok' : 'no'}">${q.ok ? t('mark_correct') : t('mark_wrong')}</span></div>
      ${q.image ? `<div style="margin:8px 0"><img src="${esc(q.image)}" style="max-height:200px;max-width:100%;border-radius:10px"></div>` : ''}
      <ul style="margin:8px 0 0;padding-left:18px">${(q.options || []).map((o, oi) => {
        const chosen = givenArr.includes(oi), right = (q.correctIdx || []).includes(oi);
        return `<li style="${right ? 'color:var(--good);font-weight:600' : chosen ? 'color:var(--bad)' : ''}">${esc(o)}${right ? ' ✔' : ''}${chosen && !right ? ' ✕' : ''}</li>`;
      }).join('')}</ul></div>`;
  }).join('');
  const pct = Math.max(0, Math.min(100, +r.percent || 0));
  const pass = d.test.passScore != null && d.test.passScore !== '' ? Math.max(0, Math.min(100, +d.test.passScore)) : null;
  $('#main').innerHTML = reportHeader(d, d.test.knName ? `<span class="tag">${esc(d.test.knName)}</span>` : '')
    + aiBanner(d.hint, d.hint && d.hint.pass ? 'good' : 'low')
    + `<div class="rep-compact"><div class="card reveal d1 kn-score" style="margin-bottom:14px">
        <div class="kn-score-l"><b class="kn-pct">${pct}%</b>
          <span class="muted">${t('lr_correct')} <b>${r.correct}/${r.total}</b>${pass != null ? ` · ${rt('kn_pass_lbl')} ${pass}%` : ''}</span></div>
        <div class="kn-gauge"><div class="iq-scale"><div class="iq-track sm">
            <div class="iq-cursor" id="kn-cursor" style="left:0"></div>
            ${pass != null ? `<i class="kn-pass" style="left:${pass}%" title="${rt('kn_pass_lbl')}: ${pass}%"></i>` : ''}</div>
          <div class="iq-labels"><span>0%</span><span>50%</span><span>100%</span></div></div></div>
      </div>
      <div class="reveal d2">${qs}</div></div>`;
  requestAnimationFrame(() => { const c = $('#kn-cursor'); if (c) c.style.left = pct + '%'; });
}
window.backHome = () => { history.replaceState(null, '', '/app'); setView('home'); };
function reportHeader(d, extra) {
  const p = d.participant, nm = p ? ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email : '';
  const vn = p && p.vacancyName;
  return `<div class="report-head reveal"><span class="avatar" style="width:44px;height:44px;border-radius:13px;background:${avColor(nm)}">${esc(initials(nm, p && p.email))}</span>
    <div><div class="muted" style="font-size:13px">«${testTitle(d.test.type)}»${vn ? ` · ${t('rep_vacancy')}: ` + (p.vacancyId ? `<a href="#" class="rep-vac-link" onclick="openVacancyPage('${esc(p.vacancyId)}');return false"><b>${esc(vn)}</b></a>` : `<b style="color:var(--text)">${esc(vn)}</b>`) : ''}</div><h1>${esc(nm)}</h1></div>
    ${p && p.age ? `<span class="tag"><b>${esc(p.age)}</b> ${t('pm_years')}</span>` : ''}${extra || ''}
    ${p && p.id ? `<select class="stage-select no-print" aria-label="${t('pm_stage')}" title="${t('pm_stage')}" onchange="setStageFromReport('${p.id}', this.value)">${stageOptions(p.stage)}</select>` : ''}
    <div class="grow"></div><button class="btn ghost sm ic-btn no-print" onclick="window.print()">${ICON_PRINT}${t('rep_print')}</button><button class="btn ghost sm ic-btn no-print" onclick="backHome()" aria-label="${t('rep_close')}">${_svg('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>')}${t('rep_close')}</button></div>`;
}
let aiBannerSeq = 0;
function aiBanner(hint, tone) { if (!hint) return ''; const tn = tone || hint.tone || 'good'; const cid = 'aineu' + (++aiBannerSeq);
  return `<div class="ai-banner ${tn} reveal d1"><canvas class="ai-neu" id="${cid}"></canvas><div class="aib-in"><small><span class="ai-spark">${ICON_SPARK}</span>${t('ai_hint')}</small><h3>${esc(hint.verdict)}</h3><ul>${(hint.notes || []).map(n => `<li>${esc(n)}</li>`).join('')}</ul></div></div>`; }
// Запуск фоновой гексо-сети во всех подсказках ИИ (без реакции на курсор — в отличие от баннера дашборда)
function initAiNeu() { document.querySelectorAll('canvas.ai-neu:not([data-neu-on])').forEach(cv => { cv.setAttribute('data-neu-on', '1'); portalNet(cv.id, { interactive: false }); }); }
function zoneHead() { return `<div class="chart-zonehead"><span>${t('z_vlow')}</span><span>${t('z_low')}</span><span>${t('z_mid')}</span><span>${t('z_high')}</span><span>${t('z_vhigh')}</span></div>`; }
function zoneCols() { return [t('z_vlow'), t('z_low'), t('z_mid'), t('z_high'), t('z_vhigh')]; }
// ---- HR-scanner-style zone-column bar chart ----
// bar anchored left, width = position on scale; 5 labeled zone columns; color-coded.
// Тулс: A–C внутреннее наполнение · D уверенность (отдельный цвет — ключевая точка надёжности) · E–G эффективность · H–J отношения
const OCA_GRP = { A: 'g1', B: 'g1', C: 'g1', D: 'g2', E: 'g3', F: 'g3', G: 'g3', H: 'g4', I: 'g4', J: 'g4' };
// Сэйлс: A–D внутренние качества (фиолетовый) · E–H эффективность (жёлтый) · I–L отношения (зелёный)
const SALES_GRP = { A: 'sg1', B: 'sg1', C: 'sg1', D: 'sg1', E: 'sg2', F: 'sg2', G: 'sg2', H: 'sg2', I: 'sg3', J: 'sg3', K: 'sg3', L: 'sg3' };
const ZONE_COLS = ['Очень низкий', 'Низкий', 'Средний', 'Высокий', 'Очень высокий'];
// zbounds — границы 5 зон в % ширины; для Тулс это ±68/±32 (16/34/66/84), для Сэйлс — равные 20/40/60/80
function zoneOf(w, cfg) { const b = cfg.zbounds; return w < b[0] ? 0 : w < b[1] ? 1 : w < b[2] ? 2 : w < b[3] ? 3 : 4; }
function zn(w, cfg) { return 'zn' + zoneOf(w, cfg); }
// Тулс — знаковая шкала −100..+100 (0 в центре не подписан, как в оригинале), границы зон на ±32/±68
const CFG_TOOLS = { width: v => (v + 100) / 2, signed: true, kind: 'tools', grp: OCA_GRP, zbounds: [16, 34, 66, 84], glines: [16, 34, 66, 84], axis: [['−100', 0], ['−68', 16], ['−32', 34], ['+32', 66], ['+68', 84], ['+100', 100]] };
// Сэйлс — шкала 0..100, равные зоны по 20
const CFG_SALES = { width: v => v, signed: false, kind: 'sales', grp: SALES_GRP, zbounds: [20, 40, 60, 80], glines: [20, 40, 60, 80], axis: [['0', 0], ['20', 20], ['40', 40], ['60', 60], ['80', 80], ['100', 100]] };
function zoneHeadRow(cfg) { const b = cfg.zbounds, c = [b[0] / 2, (b[0] + b[1]) / 2, (b[1] + b[2]) / 2, (b[2] + b[3]) / 2, (b[3] + 100) / 2]; return `<div class="oca-row zc"><span></span><span></span><div class="zc-head">${zoneCols().map((z, i) => `<span style="left:${c[i]}%">${z}</span>`).join('')}</div><span></span></div>`; }
function axisRow(cfg) { return `<div class="oca-row axis"><span></span><span></span><div class="oca-axis">${cfg.axis.map(a => `<i style="left:${a[1]}%">${a[0]}</i>`).join('')}</div><span></span></div>`; }
function barRow(pt, cfg, comp) {
  const w = Math.max(0, Math.min(100, cfg.width(pt.value)));
  const barCls = (cfg.grp[pt.key] || 'g1') + (comp ? ' comp' : '');
  const num = cfg.signed ? (pt.value > 0 ? '+' + pt.value : '' + pt.value) : '' + pt.value;
  const z = zn(w, cfg);
  const bolt = pt.manic ? `<span class="bolt" title="Плавающая точка (знак молнии) — переменчивость показателя под влиянием внешних факторов">${ICON_BOLT}</span>` : '';
  const poles = pt.low ? `<i>${esc(pt.low)} — ${esc(pt.high)}</i>` : (pt.desc ? `<i>${esc(pt.desc)}</i>` : '');
  return `<div class="oca-row${comp ? ' is-comp' : ''}">
    <div class="oca-name"><b>${pt.key}.</b> <span>${esc(pt.name)}</span>${bolt}${poles}</div>
    <div class="oca-val ${z}${comp ? ' comp' : ''}">${num}</div>
    <div class="oca-track" data-tip="${esc(pt.interpretation || pt.label || '')}"><div class="oca-bar ${barCls}" style="width:${w}%"></div>${cfg.glines.map(x => `<i class="gl" style="left:${x}%"></i>`).join('')}</div>
    <div class="oca-zlab ${z}">${esc(pt.label)}${comp ? ' · компульс.' : ''}</div></div>`;
}
function chartTipEl() { let el = document.getElementById('chart-tip'); if (!el) { el = document.createElement('div'); el.id = 'chart-tip'; el.className = 'chart-tip'; document.body.appendChild(el); } return el; }
function wireChartTips() {
  const tip = chartTipEl();
  $$('.oca-track[data-tip]').forEach(tr => {
    if (!tr.dataset.tip) return;
    tr.style.cursor = 'help';
    tr.addEventListener('mouseenter', () => { tip.textContent = tr.dataset.tip; tip.classList.add('show'); });
    tr.addEventListener('mousemove', e => { tip.style.left = e.clientX + 'px'; tip.style.top = (e.clientY - 14) + 'px'; });
    tr.addEventListener('mouseleave', () => tip.classList.remove('show'));
  });
}
function barChart(order, points, cfg, isComp) {
  return `<div class="ocachart">${zoneHeadRow(cfg)}${order.map(k => barRow(points[k], cfg, isComp ? isComp(k) : false)).join('')}${axisRow(cfg)}</div>`;
}
function chartLegend(cfg, hasComp) {
  const groups = cfg.kind === 'tools'
    ? `<span><i style="background:#3d6cd1"></i>A–C · внутреннее наполнение</span><span><i style="background:#1fa8c9"></i>D · уверенность</span><span><i style="background:#e8932a"></i>E–G · эффективность</span><span><i style="background:#1f9d6b"></i>H–J · отношения</span>`
    : `<span><i style="background:#7b52c9"></i>A–D · внутренние качества</span><span><i style="background:#e0982a"></i>E–H · эффективность</span><span><i style="background:#1f9d6b"></i>I–L · отношения с клиентами</span>`;
  return `<div class="oca-legend">${groups}${hasComp ? '<span><i class="ring"></i>компульсивная точка</span>' : ''}</div>`;
}
// coloured zone pill for interpretation cards
function zpill(label, value, cfg) { return `<span class="zpill ${zn(Math.max(0, Math.min(100, cfg.width(value))), cfg)}">${esc(label)}</span>`; }
function interpGrid(order, points, cfg) {
  return `<div class="interp-grid">` + order.map(k => { const pt = points[k]; return `<div class="interp-card"><div class="ic-h"><b>${pt.key}. ${esc(pt.name)}</b>${zpill(pt.label, pt.value, cfg)}</div><p>${esc(pt.interpretation)}</p></div>`; }).join('') + `</div>`;
}
function fillSpec() { requestAnimationFrame(() => $$('.oca-bar[data-w]').forEach(b => { b.style.width = b.dataset.w + '%'; })); wireChartTips(); }

function renderToolsReport(d) {
  const r = d.result;
  const dVal = r.points.D ? r.points.D.value : -100;
  const isComp = k => k !== 'D' && dVal >= 32 && r.points[k].value > dVal;
  const hasComp = r.order.some(isComp);
  const chart = barChart(r.order, r.points, CFG_TOOLS, isComp) + chartLegend(CFG_TOOLS, hasComp);
  const synd = r.syndromes.length ? `<h2 style="margin-top:28px">${t('synd_h')}</h2>` + r.syndromes.map(s => `<div class="synd"><b>${esc(s.title)}</b>${esc(s.text)}</div>`).join('') : '';
  const manics = r.manics.map(m => `<div class="callout warn"><div class="co-t">Нестабильность (маник ${m.key})</div>${esc(m.text)}</div>`).join('');
  const interp = `<h2 style="margin-top:28px">${t(`interp_h`)}</h2>` + interpGrid(r.order, r.points, CFG_TOOLS);
  const meta = `<div class="row" style="gap:14px;margin-top:22px"><div class="tag">${t(`ans_maybe`)} <b>${r.mAnswers}/200</b></div><div class="tag">${t(`tp_time`)} <b>${fmtDur(d.test.durationSec)}</b></div></div>`;
  $('#main').innerHTML = reportHeader(d, r.cheating ? '<span class="tag warn">Признаки читинга</span>' : '') +
    decodeBarHtml(d.test.id, 'tools') +
    `<div class="card reveal d2">${aiBanner({ verdict: d.hint.verdict, notes: d.hint.notes }, r.cheating ? 'low' : 'good')}<h3 class="subh" style="margin:0 0 8px;font-family:Manrope;color:var(--indigo)">${t(`spectrum`)}</h3>${chart}${meta}${manics}${synd}${interp}${shareBlock(d.test)}</div>`;
  wireShare(d.test); fillSpec(); initDecodeBar(d.test.id, 'tools');
}

// ============ AI-РАСШИФРОВКИ ТЕСТОВ (Claude) ============
// Монохромные иконки (наследуют цвет кнопки) — без цветных эмодзи.
const DBICO = {
  full: '<svg class="db-ico" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  manual: '<svg class="db-ico" viewBox="0 0 24 24"><path d="M8 6h11M8 12h11M8 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  presentation: '<svg class="db-ico" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21l3-4 3 4"/></svg>',
  productivity: '<svg class="db-ico" viewBox="0 0 24 24"><path d="M3 20h18"/><path d="M6 20v-6M11 20V8M16 20v-9"/></svg>',
  chat: '<svg class="db-ico" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
  gear: '<svg class="db-ico" viewBox="0 0 24 24" style="opacity:1"><path d="M4 21v-6M4 11V3M12 21v-8M12 9V3M20 21v-4M20 13V3M1 15h6M9 9h6M17 17h6"/></svg>',
  check: '<svg class="db-ico" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  retry: '<svg class="db-ico" viewBox="0 0 24 24"><path d="M23 4v6h-6M20.5 15A9 9 0 1 1 18.4 5.6L23 10"/></svg>',
};
const DECODE_KINDS_TOOLS = [
  { kind: 'full', label: 'Полная расшифровка' },
  { kind: 'manual', label: 'Инструкция по эксплуатации' },
  { kind: 'presentation', label: 'Сценарий предоставления оценки' },
];
let decodeState = {}, decodePoll = null, decodeCtxCb = null, chatBusy = false;

function decodeBarHtml(testId, type) {
  return `<div class="decode-bar no-print reveal" id="decode-bar" data-test="${testId}" data-type="${type}">
    <div class="db-inner"><span class="db-title">✦ AI-расшифровка</span>
    <div class="db-btns" id="db-btns"><span class="db-load">загрузка…</span></div></div></div>`;
}
async function initDecodeBar(testId, type) {
  try { const d = await api('/api/decode/' + testId + '?lang=' + LANG); decodeState = d; renderDecodeBtns(testId, d); if (hasPendingDecode(d)) startDecodePoll(testId); }
  catch (e) { const el = $('#db-btns'); if (el) el.innerHTML = '<span class="db-load">—</span>'; }
}
function hasPendingDecode(d) { return Object.values(d.states || {}).some(s => s.status === 'pending'); }
function renderDecodeBtns(testId, d) {
  const el = $('#db-btns'); if (!el) return;
  const list = d.type === 'tools' ? DECODE_KINDS_TOOLS : [{ kind: 'productivity', label: 'Анализ продуктивности' }];
  let html = list.map(m => { const st = (d.states && d.states[m.kind]) || { status: 'none' }; return decodeBtn(testId, m, st.status); }).join('');
  if (d.type === 'tools') html += `<button class="db-btn chat" onclick="openDecodeChat('${testId}')">${DBICO.chat} Уточнить${d.chatCount ? ` <span class="db-badge">${Math.ceil(d.chatCount / 2)}</span>` : ''}</button>`;
  html += `<button class="db-ctx" title="Контекст вакансии (тип должности, обязанности)" onclick="openDecodeContext('${testId}')">${DBICO.gear}</button>`;
  el.innerHTML = html;
  if (!d.apiConfigured) el.insertAdjacentHTML('beforeend', '<span class="db-warn" title="Задайте ANTHROPIC_API_KEY на сервере">AI не настроен</span>');
}
function decodeBtn(testId, m, status) {
  const L = esc(m.label), ic = DBICO[m.kind] || '';
  if (status === 'pending') return `<button class="db-btn pending" disabled>${ic} ${L} <span class="db-spin"></span><i>генерируется…</i></button>`;
  if (status === 'done') return `<button class="db-btn done" onclick="openDecodePage('${testId}','${m.kind}')" title="Открыть готовую расшифровку">${DBICO.check} ${L}</button>`;
  if (status === 'error') return `<button class="db-btn error" onclick="startDecode('${testId}','${m.kind}',true)" title="Повторить генерацию">${DBICO.retry} ${L} — ошибка</button>`;
  return `<button class="db-btn" onclick="onDecodeClick('${testId}','${m.kind}')">${ic} ${L}</button>`;
}
function openDecodePage(testId, kind) { window.open('/decode/' + testId + '/' + kind + '?lang=' + LANG, '_blank'); }
function decodeContextComplete(ctx) {
  ctx = ctx || {};
  return !!ctx.roleType && !!(ctx.vacancy || '').trim() && !!(ctx.duties || '').trim();
}
function onDecodeClick(testId, kind) {
  // Контекст вакансии обязателен: без него не шлём пустой запрос в ИИ.
  if (!decodeContextComplete(decodeState.context)) {
    toast('Заполните контекст вакансии — эти данные уходят в ИИ вместе с результатом теста.');
    openDecodeContext(testId, () => startDecode(testId, kind));
    return;
  }
  startDecode(testId, kind);
}
async function startDecode(testId, kind, regenerate) {
  try {
    const r = await api('/api/decode/' + testId + '/' + kind, { method: 'POST', body: JSON.stringify({ regenerate: !!regenerate, lang: LANG }) });
    if (r.status === 'done' && !regenerate) { openDecodePage(testId, kind); await initDecodeBar(testId, decodeState.type); return; }
    toast('Генерация запущена — займёт 1–3 минуты. Когда будет готово, придёт письмо, а кнопка станет зелёной.');
    await initDecodeBar(testId, decodeState.type); startDecodePoll(testId);
  } catch (e) { toast((e && e.message) || 'Ошибка запуска'); }
}
function startDecodePoll(testId) {
  if (decodePoll) clearInterval(decodePoll);
  decodePoll = setInterval(async () => {
    if (!$('#decode-bar')) { clearInterval(decodePoll); decodePoll = null; return; }
    try { const d = await api('/api/decode/' + testId + '?lang=' + LANG); decodeState = d; renderDecodeBtns(testId, d); if (!hasPendingDecode(d)) { clearInterval(decodePoll); decodePoll = null; } } catch (e) {}
  }, 5000);
}
// ── Контекст вакансии ──
function openDecodeContext(testId, onSaved) {
  const ctx = decodeState.context || {};
  const autofilled = !!((ctx.vacancy || '').trim() || (ctx.duties || '').trim());
  mkDecodeModal(`<h3 class="db-h">Контекст вакансии</h3>
    <p class="db-note">${autofilled ? 'Заполнено автоматически из заявки на найм — проверьте и при необходимости поправьте.' : 'Заявки/вакансии у кандидата нет — заполните вручную.'} Методика по-разному оценивает <b>руководящую</b> и <b>рядовую</b> должность; эти данные уходят в ИИ вместе с результатом теста.</p>
    <label class="db-lb">Вакансия</label><input class="field" id="dc-vac" value="${esc(ctx.vacancy || '')}" placeholder="Например: Менеджер по продажам">
    <label class="db-lb">Тип должности</label>
    <select class="field" id="dc-role"><option value="">— не выбрано —</option>
      <option value="lead" ${ctx.roleType === 'lead' ? 'selected' : ''}>Руководящая</option>
      <option value="rank" ${ctx.roleType === 'rank' ? 'selected' : ''}>Рядовая</option></select>
    <label class="db-lb">Основные обязанности</label>
    <textarea class="field" id="dc-duties" style="min-height:96px" placeholder="Ключевые задачи и зона ответственности">${esc(ctx.duties || '')}</textarea>
    <div class="db-err" id="dc-err"></div>
    <div class="db-modal-foot"><button class="btn ghost" onclick="closeDecodeModal()">Отмена</button><button class="btn" onclick="saveDecodeContext('${testId}')">Сохранить</button></div>`);
  decodeCtxCb = onSaved || null;
}
async function saveDecodeContext(testId) {
  const vacName = ($('#dc-vac').value || '').trim(), roleType = $('#dc-role').value, duties = ($('#dc-duties').value || '').trim();
  const err = $('#dc-err');
  if (!vacName || !roleType || !duties) {
    if (err) err.textContent = 'Заполните все поля: вакансия, тип должности и обязанности — иначе в ИИ уйдёт пустой контекст.';
    return;
  }
  try {
    await api('/api/decode/' + testId + '/context', { method: 'POST', body: JSON.stringify({ vacName, roleType, duties }) });
    decodeState.context = Object.assign(decodeState.context || {}, { vacancy: vacName, roleType, duties });
    closeDecodeModal(); toast('Контекст сохранён');
    const cb = decodeCtxCb; decodeCtxCb = null; if (cb) cb();
  } catch (e) { const e2 = $('#dc-err'); if (e2) e2.textContent = (e && e.message) || 'Ошибка сохранения'; }
}
// ── Чат «Уточнить» ──
async function openDecodeChat(testId) {
  mkDecodeModal(`<div class="db-chat"><h3 class="db-h">${DBICO.chat} Уточнить у ИИ по кандидату</h3>
    <div class="dc-msgs" id="dc-msgs"><div class="db-load">Загрузка…</div></div>
    <div class="dc-input"><textarea id="dc-q" class="field" placeholder="Ваш вопрос по этому кандидату… (Ctrl+Enter — отправить)" style="min-height:52px"></textarea>
    <button class="btn" id="dc-send" onclick="sendDecodeChat('${testId}')">Спросить</button></div></div>`, true);
  try { const d = await api('/api/decode/' + testId + '/chat'); renderChat(d.history || []); if (!d.apiConfigured) $('#dc-msgs').innerHTML = '<div class="db-warn">AI не настроен (ANTHROPIC_API_KEY)</div>'; }
  catch (e) { const el = $('#dc-msgs'); if (el) el.innerHTML = '<div class="db-warn">Ошибка загрузки</div>'; }
  const q = $('#dc-q'); if (q) { q.focus(); q.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendDecodeChat(testId); }); }
}
function renderChat(history) {
  const el = $('#dc-msgs'); if (!el) return;
  el.innerHTML = history.length ? history.map(m => `<div class="dc-msg ${m.role}"><div class="dc-bubble">${mdLite(m.content)}</div></div>`).join('')
    : '<div class="muted" style="text-align:center;padding:26px 10px">Задайте любой вопрос по этому кандидату — ИИ уже знает результаты его теста и вакансию.</div>';
  el.scrollTop = el.scrollHeight;
}
function mdLite(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n/g, '<br>'); }
async function sendDecodeChat(testId) {
  if (chatBusy) return; const q = $('#dc-q'); const msg = ((q && q.value) || '').trim(); if (!msg) return;
  chatBusy = true; const send = $('#dc-send'); if (send) { send.disabled = true; send.textContent = '…'; }
  const el = $('#dc-msgs');
  el.insertAdjacentHTML('beforeend', `<div class="dc-msg user"><div class="dc-bubble">${mdLite(msg)}</div></div><div class="dc-msg assistant" id="dc-wait"><div class="dc-bubble"><span class="db-spin"></span> думает…</div></div>`);
  el.scrollTop = el.scrollHeight; q.value = '';
  try {
    const r = await api('/api/decode/' + testId + '/chat', { method: 'POST', body: JSON.stringify({ message: msg, lang: LANG }) });
    const w = $('#dc-wait'); if (w) w.outerHTML = `<div class="dc-msg assistant"><div class="dc-bubble">${mdLite(r.answer || '')}</div></div>`;
  } catch (e) { const w = $('#dc-wait'); if (w) w.outerHTML = `<div class="dc-msg assistant"><div class="dc-bubble db-warn">${esc((e && e.message) || 'Ошибка')}</div></div>`; }
  const el2 = $('#dc-msgs'); if (el2) el2.scrollTop = el2.scrollHeight;
  chatBusy = false; if (send) { send.disabled = false; send.textContent = 'Спросить'; }
}
// ── Модалка ──
function mkDecodeModal(inner, wide) {
  closeDecodeModal();
  const ov = document.createElement('div'); ov.className = 'db-modal-ov'; ov.id = 'db-modal-ov';
  ov.innerHTML = `<div class="db-modal${wide ? ' wide' : ''}"><button class="db-close" onclick="closeDecodeModal()" aria-label="Закрыть">✕</button>${inner}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeDecodeModal(); });
  document.body.appendChild(ov); return ov;
}
function closeDecodeModal() { const ov = $('#db-modal-ov'); if (ov) ov.remove(); }

function renderSalesReport(d) {
  const r = d.result;
  const chart = barChart(r.order, r.points, CFG_SALES, null) + chartLegend(CFG_SALES, false);
  const interp = `<h2 style="margin-top:28px">${t(`interp_h`)}</h2>` + interpGrid(r.order, r.points, CFG_SALES);
  $('#main').innerHTML = reportHeader(d) + `<div class="card reveal d2">${aiBanner(d.hint, d.hint && d.hint.tone)}<h3 class="subh" style="margin:0 0 8px;font-family:Manrope;color:var(--indigo)">${t(`sales_profile`)}</h3>${chart}
    <div class="row" style="gap:14px;margin-top:22px"><div class="tag">${t(`ans_sometimes`)} <b>${r.midCount}/120</b></div><div class="tag">${t(`tp_time`)} <b>${fmtDur(d.test.durationSec)}</b></div></div>${interp}${shareBlock(d.test)}</div>`;
  wireShare(d.test); fillSpec();
}

function renderResultReport(d) {
  const cards = d.result.items.map(it => `<div class="q-card"><div class="q-top"><b>${t(`lr_question`)} ${it.id}</b><span>${fmtDur(it.timeSec)}</span></div><div>${esc(it.text)}</div><div class="q-ans"><b>${t(`lr_answer`)}</b> ${esc(it.answer) || '<span class="muted">—</span>'}</div><div class="rate-stars" data-qid="${it.id}" style="margin-top:10px">${[1, 2, 3, 4, 5].map(n => `<span data-n="${n}" class="${n <= it.stars ? 'on' : ''}">★</span>`).join('')}</div></div>`).join('');
  $('#main').innerHTML = reportHeader(d) + decodeBarHtml(d.test.id, 'result') + `<div class="card reveal d2">${aiBanner(d.hint, d.hint.tone)}<div class="q-grid">${cards}</div>
    <div class="row" style="gap:14px;margin-top:20px"><div class="tag">${t(`tp_time`)} <b>${fmtDur(d.test.durationSec)}</b></div></div>${candidateActions(d.participant && d.participant.id)}${shareBlock(d.test)}</div>`;
  $$('.rate-stars').forEach(rs => rs.querySelectorAll('span').forEach(sp => sp.onclick = async () => { const qid = rs.dataset.qid, n = +sp.dataset.n; rs.querySelectorAll('span').forEach(s => s.classList.toggle('on', +s.dataset.n <= n)); await api('/api/tests/' + d.test.id + '/rate', { method: 'POST', body: JSON.stringify({ questionId: qid, stars: n }) }); }));
  wireShare(d.test); initDecodeBar(d.test.id, 'result');
}
function renderLogicReport(d) {
  const r = d.result, iq = r.iq != null ? r.iq : r.percent, scaleMin = 60, scaleMax = 160;
  const pos = Math.max(0, Math.min(100, (iq - scaleMin) / (scaleMax - scaleMin) * 100));
  const active = iq < 80 ? 0 : iq < 100 ? 1 : iq < 120 ? 2 : iq < 140 ? 3 : 4;
  const cards = (r.bands || []).map((b, i) => `<div class="q-card" style="${i === active ? 'border:2px solid var(--brand)' : ''}"><b>${esc(b.range)}</b><div class="muted" style="margin-top:6px">${esc(b.text)}</div></div>`).join('');
  const rows = r.details.map(q => { const isImg = q.optionImages && q.optionImages.length; const givenTxt = q.given != null ? (isImg ? t(`variant`)+` `+(q.given + 1) : q.options[q.given]) : '—'; const mark = q.unscored ? t(`mark_visual`) : q.correct ? t(`mark_correct`) : q.given == null ? t(`mark_skipped`) : t(`mark_wrong`); const qImg = q.image ? `<div style="text-align:center;margin:8px 0"><img src="${esc(q.image)}" style="max-height:150px;max-width:100%"></div>` : ''; const optImgs = isImg ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${q.optionImages.map((im, i) => { const isRight = i === q.answer, isGivenWrong = q.given === i && !q.correct; const bc = isRight ? 'var(--good)' : isGivenWrong ? 'var(--bad)' : 'var(--line)'; const tag = isRight ? `<div style="font-size:10px;font-weight:700;color:var(--good)">${t(`opt_right`)}</div>` : isGivenWrong ? `<div style="font-size:10px;font-weight:700;color:var(--bad)">${t(`opt_chosen`)}</div>` : `<div class="muted" style="font-size:11px">${i + 1}</div>`; return `<div style="text-align:center"><img src="${esc(im)}" style="height:56px;border:2px solid ${bc};border-radius:8px;padding:2px">${tag}</div>`; }).join('')}</div>` : '';
    return `<div class="q-card"><div class="q-top"><b>${t(`lr_question`)} ${q.id}</b><span>${mark}</span></div><div>${esc(q.text)}</div>${qImg}${optImgs}${q.unscored ? `<div class="q-ans muted">${t(`lr_matrix`)}</div>` : `<div class="q-ans">${t(`lr_answer`)} <b style="color:${q.correct ? 'var(--good)' : 'var(--bad)'}">${esc(givenTxt)}</b>${!q.correct && q.answer != null ? ` · ${t(`lr_right`)} <b>${esc(q.options[q.answer])}</b>` : ''}</div>`}</div>`; }).join('');
  $('#main').innerHTML = reportHeader(d, `<span class="tag">${t(`lr_correct`)} <b>${r.correct}/${r.total}</b></span>`) +
    aiBanner(d.hint, d.hint && d.hint.tone) +
    `<div class="rep-compact"><div class="card reveal d2">
      <div class="iq-score" id="iq-score">0</div>
      <div class="iq-scale"><div class="iq-track"><div class="iq-cursor" id="iq-cursor" style="left:0"></div></div>
        <div class="iq-labels"><span>Min</span><span>${t('z_vlow')}</span><span>${t('z_low')}</span><span>${t('z_mid')}</span><span>${t('z_high')}</span><span>${t('z_vhigh')}</span><span>Max</span></div></div>
      <div class="q-grid" style="margin-top:16px">${cards}</div>
      <div class="synd" style="margin-top:14px;margin-bottom:0"><b>${t(`iq_note_h`)}</b>${t(`iq_note`)}</div></div>
      <div class="card reveal d3" style="margin-top:14px"><h2 style="margin:0 0 12px">${t(`answers_q`)}</h2><div class="q-grid">${rows}</div>${shareBlock(d.test)}</div></div>`;
  wireShare(d.test);
  const sc = $('#iq-score'); if (sc) { sc.textContent = iq; countUp(sc, iq); }
  requestAnimationFrame(() => { const c = $('#iq-cursor'); if (c) c.style.left = pos + '%'; });
}
function candidateActions(pid) { if (!pid) return ''; return `<div class="row" style="gap:10px;margin-top:20px"><span class="muted" style="align-self:center;font-size:13px">${t(`decision`)}</span><button class="btn soft sm" onclick="setStageFromReport('${pid}','Собеседование')">${t(`act_interview`)}</button><button class="btn ghost sm" onclick="setStageFromReport('${pid}','Резерв')">${t(`act_reserve`)}</button><button class="btn ghost danger sm" onclick="setStageFromReport('${pid}','Отказ')">${t(`act_reject`)}</button></div>`; }
function shareBlock(test) { return `<div class="test-panel" style="margin-top:24px"><b>${t(`share_title`)}</b><p class="muted" style="margin:6px 0 12px">${t(`share_sub`)}</p><div class="row"><span id="share-state" class="muted">${test.publicShare ? t(`share_active`) : t(`share_inactive`)}</span><button class="btn sm ${test.publicShare ? 'ghost' : 'soft'}" id="share-toggle">${test.publicShare ? t(`share_off`) : t(`share_on`)}</button><span id="share-url"></span></div></div>`; }
function wireShare(test) { const tgl = $('#share-toggle'); if (!tgl) return; tgl.onclick = async () => { const d = await api('/api/tests/' + test.id + '/share', { method: 'POST', body: JSON.stringify({ enabled: !test.publicShare }) }); test.publicShare = d.publicShare; $(`#share-state`).textContent = d.publicShare ? t(`share_active`) : t(`share_inactive`); tgl.textContent = d.publicShare ? t(`share_off`) : t(`share_on`); tgl.className = 'btn sm ' + (d.publicShare ? 'ghost' : 'soft'); $('#share-url').innerHTML = d.publicShare ? `<a href="${d.url}" target="_blank">${d.url}</a>` : ''; }; }

// ================= SECONDARY VIEWS =================
// ================= ИНТЕГРАЦИИ: джоб-порталы (публикация объявлений и отклики) =================
async function renderJobPortals() {
  const { portals, feedUrl } = await api('/api/job-portals');
  const badge = m => m === 'api' ? `<span class="jp-m jp-api">API</span>` : m === 'feed' ? `<span class="jp-m jp-feed">${rt('jp_by_feed')}</span>` : `<span class="jp-m jp-login">${rt('jp_by_login')}</span>`;
  const cards = portals.map(p => {
    const canTest = p.method === 'api' || p.method === 'feed';
    const actions = p.method === 'feed' && (!p.auth || !p.auth.length)
      ? `<button class="btn soft sm ic-btn" onclick="copyLink('${esc(p.feedUrl || feedUrl)}')">${ICON_COPY}${rt('jp_copy_feed')}</button>`
      : `<button class="btn ${p.connected ? 'soft' : ''} sm" data-jp-connect="${p.id}">${p.connected ? '✎ ' + rt('jp_edit') : rt('jp_connect')}</button>${p.connected ? `<button class="btn ghost danger sm" data-jp-off="${p.id}">${rt('jp_disconnect')}</button>` : ''}`;
    return `<div class="card intg-card">
      <div class="row" style="justify-content:space-between;align-items:center;gap:8px">
        <b style="font-size:15.5px">${esc(p.name)}</b>
        <span class="cstep-st ${p.connected ? 'ok' : ''}">${p.connected ? rt('jp_on') : rt('jp_off')}</span></div>
      <div style="margin:6px 0 4px">${badge(p.method)}</div>
      <p class="muted" style="font-size:12.5px;margin:4px 0 8px;min-height:60px">${esc(p.desc)}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">${actions}
        ${canTest ? `<button class="btn ghost sm" data-jp-test="${p.id}">${rt('jp_test')}</button><span style="font-size:12px" id="jp-res-${p.id}"></span>` : ''}</div>
    </div>`;
  }).join('');
  $('#main').innerHTML = `<div class="eyebrow reveal">${t('nav_integrations')}</div>
    <h1 class="page-h reveal d1" style="margin-top:10px">${rt('jp_title')}</h1>
    <p class="muted reveal d1" style="max-width:720px;line-height:1.55">${rt('jp_intro')}</p>
    <div class="card reveal d1" style="margin-top:12px"><label class="lbl">${rt('jp_feed_h')}</label>
      <div class="muted" style="font-size:12.5px;margin-bottom:8px">${rt('jp_feed_hint')}</div>
      <div class="row" style="gap:6px"><input class="field sm" style="flex:1" readonly value="${esc(feedUrl)}"><button class="btn ghost sm ic-btn" onclick="copyLink('${esc(feedUrl)}')">${ICON_COPY}${t('ak_copy')}</button>
      <button class="btn ghost sm" onclick="window.open('${esc(feedUrl)}','_blank')">${rt('jp_open_feed')}</button></div></div>
    <div class="intg-grid reveal d2" style="margin-top:14px">${cards}</div>`;
  $$('[data-jp-connect]').forEach(b => b.onclick = () => {
    const p = portals.find(x => x.id === b.dataset.jpConnect);
    openModal(`<div class="report-head"><h2 style="margin:0;font-size:20px">${rt('jp_connect')}: ${esc(p.name)}</h2></div>
      <p class="muted" style="margin:0 0 12px;font-size:13px">${esc(p.note || '')}</p>
      ${p.auth.includes('login') ? `<div style="margin-bottom:10px"><label class="lbl">${rt('jp_login')}</label><input class="field" id="jp-login" value="${esc(p.login || '')}" autocomplete="off"></div>
      <div style="margin-bottom:10px"><label class="lbl">${rt('jp_pass')}</label><input class="field" id="jp-pass" type="password" placeholder="${p.hasPassword ? '••••••' : ''}" autocomplete="new-password"></div>` : ''}
      ${p.auth.includes('api') ? `<div style="margin-bottom:10px"><label class="lbl">API Key</label><input class="field" id="jp-api" value="${esc(p.apiKey || '')}" autocomplete="off"></div>` : ''}
      <div class="row" style="gap:8px;margin-top:14px"><button class="btn" id="jp-save">${rt('jp_connect')}</button>
        <button class="btn ghost" onclick="closeModal()">${rt('common_close')}</button></div>`, true);
    $('#jp-save').onclick = async () => {
      const body = {};
      const lg = $('#jp-login'); if (lg) body.login = lg.value;
      const pw = $('#jp-pass'); if (pw && pw.value) body.password = pw.value;
      const ak = $('#jp-api'); if (ak) body.apiKey = ak.value;
      try { await api('/api/job-portals/' + p.id + '/connect', { method: 'POST', body: JSON.stringify(body) }); toast(rt('jp_connected')); closeModal(); renderJobPortals(); }
      catch (e) { toast(e.message); }
    };
  });
  $$('[data-jp-off]').forEach(b => b.onclick = async () => {
    if (!confirm(rt('jp_disconnect') + '?')) return;
    await api('/api/job-portals/' + b.dataset.jpOff, { method: 'DELETE' }); renderJobPortals();
  });
  $$('[data-jp-test]').forEach(b => b.onclick = async () => {
    const id = b.dataset.jpTest, out = $('#jp-res-' + id);
    b.disabled = true; out.style.color = 'var(--muted)'; out.textContent = '…';
    try {
      const d = await api('/api/job-portals/' + id + '/test', { method: 'POST' });
      out.style.color = 'var(--good)';
      out.textContent = '✓ ' + (d.result && d.result.totalCount != null ? d.result.totalCount + ' ' + rt('jp_jobs_found') : d.result && d.result.feed ? rt('jp_feed_ready') : rt('intg_ok'));
    } catch (e) { out.style.color = 'var(--bad)'; out.textContent = '✕ ' + e.message; }
    b.disabled = false;
  });
}
// ================= ANKETAS (конструктор анкет) =================
window.editAnketa = id => renderAnketaEdit(id === 'new' ? null : id);
window.deleteAnketa = async id => { if (!confirm('Удалить анкету?')) return; await api('/api/anketas/' + id, { method: 'DELETE' }); toast('Анкета удалена'); renderAnketas(); };
async function renderAnketas() {
  const [ak, meD] = await Promise.all([api('/api/anketas'), api('/api/settings')]);
  state.user = meD.user;
  const prefix = ak.prefix || '';
  const anketas = ak.anketas;
  const list = anketas.length ? `<div class="ak-list reveal d1">${anketas.map(a => `<div class="ak-card">
    <div class="ak-main"><b>${esc(a.title)}</b><div class="muted" style="font-size:13px;margin:2px 0 6px">${a.vacancyName ? 'Вакансия: ' + esc(a.vacancyName) + ' · ' : ''}${(a.tests || []).length} тест(ов) · откликов: <b>${a.applied}</b></div>
      <a class="ak-url" href="${a.url}" target="_blank">${esc(a.url)}</a></div>
    <div class="ak-acts"><button class="btn ghost sm" onclick="copyLink('${a.url}')">${t('ak_copy')}</button>
      <button class="btn soft sm" onclick="editAnketa('${a.id}')">${t('ak_edit')}</button>
      <button class="btn ghost danger sm" onclick="deleteAnketa('${a.id}')">${t('ak_delete')}</button></div></div>`).join('')}</div>`
    : `<div class="ak-empty reveal d1">${t('ak_empty')} <a href="#" onclick="editAnketa('new');return false">${t('ak_empty_link')}</a></div>`;
  $('#main').innerHTML = `<div class="topbar reveal"><div><div class="eyebrow">${t('ak_eyebrow')}</div><h1 class="page-h" style="margin-top:10px">${t('ak_my')}</h1></div>
      <button class="btn ic-btn" id="ak-new">${_svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>')}${t('ak_create')}</button></div>
    <div class="card reveal d1"><label class="lbl">${t('ak_prefix')}</label>
      <div class="muted mono" style="margin-bottom:6px;font-size:13px">${location.origin}/a/<b style="color:var(--brand)">${esc(prefix || 'prefix')}</b>-form</div>
      <div class="muted" style="font-size:12.5px">${t('ak_prefix_auto')}</div></div>
    ${list}
    <div class="card reveal d2" style="margin-top:20px">
      <p style="margin:0">${t('ak_intro')}</p>
      <p style="font-weight:700;margin:12px 0 6px">${t('ak_after')}</p>
      <ul class="ak-ul"><li>${t('ak_after1')}</li><li>${t('ak_after2')}</li><li>${t('ak_after3')}</li></ul></div>`;
  $('#ak-new').onclick = () => editAnketa('new');
}
async function renderAnketaEdit(id, opts) {
  opts = opts || {};
  $('#main').classList.remove('vac-lock');
  const goBack = opts.onBack || renderAnketas;
  const vacs = (await api('/api/vacancies?sectionId=all')).vacancies;
  const a = id ? (await api('/api/anketas/' + id)).anketa : { title: '', vacancyId: opts.vacancyId || '', slug: '', tests: ['result', 'tools'], btnText: 'Откликнуться', pageTitle: '', msgApply: 'Спасибо! Ваш отклик получен.', msgDone: 'Отлично! Вы ответили на все вопросы. HR-менеджер свяжется с вами после рассмотрения результатов. Эту страницу можно закрыть.', noCaptcha: false, sendEmail: true, description: '' };
  if (!id && opts.vacancyId) { const v = vacs.find(x => x.id === opts.vacancyId); if (v && !a.title) a.title = v.name; }
  const vacOpts = `<option value="">${t('ae_pick_vac')}</option>` + vacs.map(v => `<option value="${v.id}" ${v.id === a.vacancyId ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
  const testChk = ['result', 'tools', 'logic', 'sales'].map(ty => `<label class="ak-chk"><input type="checkbox" data-test="${ty}" ${(a.tests || []).includes(ty) ? 'checked' : ''}><span class="ak-chk-box"></span>${testTitle(ty)}</label>`).join('');
  $('#main').innerHTML = `<div class="topbar reveal"><h1 class="page-h">${id ? t('ae_edit_title') : t('ae_create_title')}</h1>
      <button class="btn ghost ic-btn" id="ak-back">${_svg('<path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>')}${t('ak_my')}</button></div>
    <div class="card reveal d1"><div class="form-grid">
      <div><label class="lbl">${t('ae_name')}</label><input class="field" id="ae-title" value="${esc(a.title)}" placeholder="${t('ae_name_ph')}"></div>
      <div><label class="lbl">${t('pm_vacancy')}</label><select class="field" id="ae-vac">${vacOpts}</select></div>
      <div class="full"><label class="lbl">${t('ae_slug')}</label><div class="row"><span class="muted mono" style="font-size:13px">${location.origin}/a/</span><input class="field" id="ae-slug" value="${esc(a.slug || '')}" placeholder="${t('ae_slug_ph')}" style="flex:1"></div></div>
      <div><label class="lbl">${t('ae_btntext')}</label><input class="field" id="ae-btn" value="${esc(a.btnText || 'Откликнуться')}"></div>
      <div><label class="lbl">${t('ae_ptitle')}</label><input class="field" id="ae-ptitle" value="${esc(a.pageTitle || '')}" placeholder="${t('ae_ptitle_ph')}"></div>
      <div class="full"><div class="row" style="gap:26px">${switchRow('noCaptcha', t('ae_nocaptcha'), a.noCaptcha)}${switchRow('sendEmail', t('ae_sendemail'), a.sendEmail)}</div></div>
      <div><label class="lbl">${t('ae_msgapply')}</label><textarea class="field" id="ae-msgapply">${esc(a.msgApply || '')}</textarea></div>
      <div><label class="lbl">${t('ae_msgdone')}</label><textarea class="field" id="ae-msgdone">${esc(a.msgDone || '')}</textarea></div>
      <div class="full"><label class="lbl">${t('ae_tests')}</label><div class="ak-tests">${testChk}</div></div>
      <div class="full"><label class="lbl">${t('ae_desc')}</label><textarea class="field" id="ae-desc" style="min-height:120px">${esc(a.description || '')}</textarea></div>
    </div>
    <div class="row" style="margin-top:18px"><button class="btn" id="ae-save">${id ? t('save') : t('ae_save_create')}</button>${id ? `<button class="btn ghost ic-btn" onclick="window.open('${a.url}','_blank')">${t('ae_preview')}</button>` : ''}</div></div>`;
  $('#ak-back').onclick = () => goBack();
  $$('.switch[data-switch]').forEach(sw => sw.onclick = () => sw.classList.toggle('on'));
  $('#ae-save').onclick = async () => {
    const body = { title: $('#ae-title').value.trim() || 'Новая анкета', vacancyId: $('#ae-vac').value, slug: $('#ae-slug').value.trim(),
      btnText: $('#ae-btn').value, pageTitle: $('#ae-ptitle').value, msgApply: $('#ae-msgapply').value, msgDone: $('#ae-msgdone').value,
      description: $('#ae-desc').value, tests: $$('.ak-tests input:checked').map(i => i.dataset.test),
      noCaptcha: $('.switch[data-switch="noCaptcha"]').classList.contains('on'), sendEmail: $('.switch[data-switch="sendEmail"]').classList.contains('on') };
    try { if (id) await api('/api/anketas/' + id, { method: 'PUT', body: JSON.stringify(body) }); else await api('/api/anketas', { method: 'POST', body: JSON.stringify(body) }); toast(t(`saved`)); goBack(); }
    catch (e) { toast(e.message); }
  };
}
function mdToHtml(md) {
  const e = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const inl = s => e(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const lines = md.replace(/\r/g, '').split('\n'); let h = '', ul = false, tb = false;
  const cu = () => { if (ul) { h += '</ul>'; ul = false; } };
  for (let i = 0; i < lines.length; i++) { let ln = lines[i];
    if (/^\s*\|(.+)\|\s*$/.test(ln)) { const cells = ln.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()); if (/^[-:\s|]+$/.test(ln.replace(/\|/g, ''))) continue; if (!tb) { h += '<table class="edu-table">'; tb = true; } h += '<tr>' + cells.map(c => `<td>${inl(c)}</td>`).join('') + '</tr>'; continue; } else if (tb) { h += '</table>'; tb = false; }
    if (/^\s*[-*]\s+/.test(ln)) { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${inl(ln.replace(/^\s*[-*]\s+/, ''))}</li>`; continue; } cu();
    const hd = ln.match(/^(#{1,4})\s+(.*)$/); if (hd) { h += `<h${hd[1].length} class="edu-h${hd[1].length}">${inl(hd[2])}</h${hd[1].length}>`; continue; }
    if (/^\s*>/.test(ln)) { h += `<blockquote>${inl(ln.replace(/^\s*>\s?/, ''))}</blockquote>`; continue; }
    if (/^\s*---\s*$/.test(ln)) { h += '<hr>'; continue; } if (ln.trim() === '') continue; h += `<p>${inl(ln)}</p>`; }
  cu(); if (tb) h += '</table>'; return h;
}
// тесты с документами: правила (+видео) и спецификация (только Тулс, +видео)
const EDU_DOCS = {
  personality: { type: 'tools', spec: true },   // Тулс
  productivity: { type: 'result', spec: false },  // Резалт
};
function docFrame(url) { return `<iframe class="doc-frame" src="${url}" scrolling="no" onload="eduFrameFit(this)"></iframe>`; }
// авто-высота iframe документа: карточка растёт под контент, страница скроллится (пересчёт после дозагрузки)
function eduFrameFit(f) {
  const set = () => { try { const h = f.contentWindow.document.body.scrollHeight; if (h > 60) f.style.height = (h + 40) + 'px'; } catch (e) { f.style.height = '3000px'; } };
  set(); [200, 600, 1200, 2200].forEach(ms => setTimeout(set, ms));
}
window.eduFrameFit = eduFrameFit;
// видео-уроки: same-origin прокси /media/<name> → Supabase Storage (edge чинит Range/кэш)
const MEDIA_BASE = '/media';
function docVideo(type, kind, heading) {
  return `<div class="doc-video">${heading ? `<div class="dv-head">${_svg('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>')}<span>${esc(heading)}</span></div>` : ''}
    <video class="doc-vid" controls preload="metadata" src="${MEDIA_BASE}/${type}_${kind}_${vidLang()}.mp4"></video></div>`;
}
function eduModeToggle() {
  const m = state.eduMode || 'free';
  return `<div class="edu-modes reveal d1"><button class="edu-mode ${m === 'free' ? 'on' : ''}" data-emode="free">${t('edu_free')}</button><button class="edu-mode ${m === 'paid' ? 'on' : ''}" data-emode="paid">${t('edu_paid')}</button></div>`;
}
function wireEduModes() { $$('[data-emode]').forEach(b => b.onclick = () => { const m = b.dataset.emode; if (m === (state.eduMode || 'free')) return; state.eduMode = m; m === 'paid' ? renderLearning() : renderEducation(); }); }
async function renderEducation(slug) {
  state.eduMode = 'free';
  const topics = (await api('/api/education?lang=' + LANG)).topics;
  const head = `<div class="eyebrow reveal">${t('edu_kb')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('edu')}</h1>${eduModeToggle()}`;
  if (!topics.length) { $('#main').innerHTML = `${head}<div class="card reveal d2"><p class="muted">${t('edu_soon')}</p></div>`; wireEduModes(); return; }
  const prev = state.eduSlug;
  const active = slug || (state.eduSlug && topics.find(t2 => t2.slug === state.eduSlug) ? state.eduSlug : topics[0].slug);
  if (active !== prev) eduTab = 'info';
  state.eduSlug = active;
  const menu = topics.map(tp => `<button class="edu-item ${tp.slug === active ? 'active' : ''}" data-slug="${tp.slug}"><span class="edu-ic">${EDU_SVG[tp.slug] || ''}</span><span>${esc(tp.title)}</span></button>`).join('');
  $('#main').innerHTML = `${head}<div class="edu-layout reveal d2"><div class="edu-nav">${menu}</div><div class="edu-main"><div class="edu-tabbar" id="edu-tabbar"></div><div class="card edu-content" id="edu-content"><p class="muted">${t('loading')}</p></div></div></div>`;
  wireEduModes();
  $$('.edu-item').forEach(b => b.onclick = () => renderEducation(b.dataset.slug));
  const cfg = EDU_DOCS[active];
  const doc = await api('/api/education/' + active + '?lang=' + LANG).catch(() => ({ markdown: '' }));
  const infoHtml = mdToHtml(doc.markdown || '');
  const box = $('#edu-content'), bar = $('#edu-tabbar');
  if (!cfg) { box.innerHTML = infoHtml; box.classList.remove('has-doc'); box.scrollTop = 0; fitEduHeight(); return; }
  // страница теста: вкладки НАД карточкой + отдельная вкладка «Видео»
  const tabs = [['info', t('tab_info')], ['rules', t('tab_rules')]];
  if (cfg.spec) tabs.push(['spec', t('tab_spec')]);
  tabs.push(['video', t('tab_video')]);
  if (!tabs.some(x => x[0] === eduTab)) eduTab = 'info';
  const dl = docLang();
  let inner = '';
  if (eduTab === 'info') inner = `<div class="edu-doc-body">${infoHtml}</div>`;
  else if (eduTab === 'rules') inner = docFrame('/docs/' + cfg.type + '_rules_' + dl + '.html');
  else if (eduTab === 'spec') inner = docFrame('/docs/' + cfg.type + '_spec_' + dl + '.html');
  else if (eduTab === 'video') inner = `<div class="doc-videos">${docVideo(cfg.type, 'rules', t('tab_rules'))}${cfg.spec ? docVideo(cfg.type, 'spec', t('tab_spec')) : ''}</div>`;
  bar.innerHTML = tabs.map(([k, l]) => `<button class="edu-tab ${k === eduTab ? 'on' : ''}" data-etab="${k}">${esc(l)}</button>`).join('');
  box.classList.toggle('has-doc', eduTab === 'rules' || eduTab === 'spec');
  box.innerHTML = `<div class="edu-tabc">${inner}</div>`;
  box.scrollTop = 0;
  fitEduHeight();
  $$('[data-etab]').forEach(b => b.onclick = () => { eduTab = b.dataset.etab; renderEducation(active); });
}
// точная высота карточки обучения = до низа вьюпорта, чтобы скроллился ТОЛЬКО документ, а не страница
function fitEduHeight() {
  const apply = () => { const box = document.getElementById('edu-content'); if (!box) return; const top = box.getBoundingClientRect().top; box.style.maxHeight = Math.max(300, window.innerHeight - top - 66) + 'px'; };
  apply();               // синхронно — работает даже когда вкладка не в фокусе (rAF там заморожен)
  setTimeout(apply, 60); // повтор после раскладки контента
}
window.addEventListener('resize', () => { if (document.getElementById('edu-content')) fitEduHeight(); });

// ============ ПЛАТНЫЕ ПРОГРАММЫ ОБУЧЕНИЯ ============
const LP_LOCK = _svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round"/>');
const LP_CHECK = _svg('<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>');
const LP_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const LP_BM = _svg('<path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.3L5 21V4.5a1 1 0 0 1 1-1z"/>');
function lpProgressBar(pct) { return `<div class="lp-track"><div class="lp-fill" style="width:${Math.max(2, pct)}%"></div></div>`; }
async function renderLearning() {
  state.eduMode = 'paid';
  const head = `<div class="eyebrow reveal">${t('edu_kb')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('edu')}</h1>${eduModeToggle()}`;
  $('#main').innerHTML = `${head}<div class="card reveal d2"><p class="muted">${t('loading')}</p></div>`;
  wireEduModes();
  let data; try { data = await api('/api/learning?lang=' + LANG); } catch (e) { return; }
  if (state.eduMode !== 'paid') return; // пользователь переключился, пока грузилось
  const progs = data.programs || [];
  if (!progs.length) { $('#main').innerHTML = `${head}<div class="card reveal d2"><p class="muted">${t('lp_none')}</p></div>`; wireEduModes(); return; }
  const cards = progs.map((p, i) => {
    const locked = !p.unlocked && !p.purchased;
    let badge = '', action = '';
    if (p.completed) badge = `<span class="lp-badge done">${LP_CHECK}${t('lp_completed')}</span>`;
    else if (p.purchased) badge = `<span class="lp-badge">${t('lp_purchased')}</span>`;
    else if (locked) badge = `<span class="lp-badge lock">${LP_LOCK}${t('lp_locked')}</span>`;
    if (p.purchased) action = `<button class="btn soft sm" data-lp-open="${p.id}">${p.completed ? t('lp_open') : t('lp_continue')}</button>`;
    else if (locked) action = `<button class="btn ghost sm" disabled title="${t('lp_locked_hint')}">${t('lp_buy')}</button>`;
    else action = `<button class="btn sm" data-lp-buy="${p.id}">${t('lp_buy')} · ${p.price} <span class="lp-unit">${t('lp_tests_unit')}</span></button>`;
    const trailerBtn = p.trailerUnlocked
      ? `<button class="btn ghost sm lp-trailer-btn" data-lp-trailer="${p.id}">${LP_PLAY}${t('lp_trailer')}</button>`
      : `<button class="btn ghost sm lp-trailer-btn" disabled title="${t('lp_trailer_locked')}">${LP_PLAY}${t('lp_trailer')}</button>`;
    const bar = p.purchased ? `<div class="lp-prog"><div class="lp-prog-h"><span>${t('lp_progress')}</span><span class="mono">${p.done}/${p.total} · ${p.pct}%</span></div>${lpProgressBar(p.pct)}</div>` : '';
    return `<div class="lp-card ${locked ? 'locked' : ''} reveal" style="animation-delay:${i * 60}ms">
      <div class="lp-card-top"><span class="lp-num">${p.order}</span><div class="lp-card-h"><b>${esc(p.title)}</b>${badge}</div></div>
      <p class="lp-desc">${esc(p.desc)}</p>
      <div class="lp-meta"><span>${p.sectionsCount} ${t('lp_sections')}</span><span class="lp-dot">·</span><span>${t('lp_price')}: <b>${p.price} ${t('lp_tests_unit')}</b></span></div>
      ${bar}
      <div class="lp-actions">${trailerBtn}${action}</div>
    </div>`;
  }).join('');
  const balChip = `<button class="tests-chip" onclick="setView('balance')" title="${t('balance')}"><svg viewBox="0 0 24 24" fill="none" stroke="#43e0a0" stroke-width="1.9"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18" stroke-linecap="round"/></svg><b class="num">${data.balance}</b><span>${t('tests_word')}</span></button>`;
  $('#main').innerHTML = `${head}<div class="lp-topbar reveal d2"><span class="muted">${t('lp_programs')}</span>${balChip}</div><div class="lp-grid reveal d2">${cards}</div>`;
  wireEduModes();
  $$('[data-lp-open]').forEach(b => b.onclick = () => openLearningProgram(b.dataset.lpOpen));
  $$('[data-lp-buy]').forEach(b => b.onclick = () => buyLearning(progs.find(x => x.id === b.dataset.lpBuy), data.balance));
  $$('[data-lp-trailer]').forEach(b => b.onclick = () => openTrailer(progs.find(x => x.id === b.dataset.lpTrailer)));
}
// Модалка подтверждения покупки (в дизайне портала, вместо системного confirm)
function buyLearning(p, balance) {
  const after = balance - p.price;
  const enough = after >= 0;
  openModal(`
    <div class="lp-buy">
      <div class="lp-buy-ic">${LP_LOCK}</div>
      <h2 class="lp-buy-title">${t('lp_buy_title')}</h2>
      <p class="lp-buy-name">«${esc(p.title)}»</p>
      <div class="lp-buy-rows">
        <div class="lp-buy-row"><span>${t('lp_price')}</span><b>${p.price} ${t('lp_tests_unit')}</b></div>
        <div class="lp-buy-row"><span>${t('lp_your_balance')}</span><b>${balance} ${t('lp_tests_unit')}</b></div>
        <div class="lp-buy-row ${enough ? '' : 'bad'}"><span>${t('lp_buy_after')}</span><b>${after} ${t('lp_tests_unit')}</b></div>
      </div>
      <div class="lp-buy-actions">
        <button class="btn ghost" onclick="closeModal()">${t('lp_cancel')}</button>
        ${enough
      ? `<button class="btn" id="lp-buy-confirm">${tv('lp_buy_btn', { n: p.price })}</button>`
      : `<button class="btn" onclick="closeModal();setView('balance')">${t('lp_topup')}</button>`}
      </div>
    </div>`);
  const c = $('#lp-buy-confirm');
  if (c) c.onclick = async () => {
    c.disabled = true;
    try {
      const d = await api('/api/learning/' + p.id + '/buy', { method: 'POST', body: '{}' });
      if (d.balance != null && state.user) state.user.balanceAvailable = d.balance;
      closeModal(); toast(t('lp_bought')); openLearningProgram(p.id);
    } catch (e) { toast(e.message); c.disabled = false; }
  };
}
// Модалка бесплатного трейлера (видео по языку портала)
function openTrailer(p) {
  const url = p && p.trailer;
  const body = url
    ? `<video class="lp-trailer-video" src="${esc(url)}" controls autoplay playsinline controlslist="nodownload" oncontextmenu="return false"></video>`
    : `<div class="lp-trailer-empty">${LP_PLAY}<span>${t('lp_trailer_soon')}</span></div>`;
  openModal(`<div class="lp-trailer-modal"><h2 class="lp-trailer-h">${t('lp_trailer')} · «${esc(p.title)}»</h2>${body}</div>`, true);
}
async function openLearningProgram(id) {
  state.eduMode = 'paid';
  const head = `<div class="eyebrow reveal">${t('edu_kb')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('edu')}</h1>${eduModeToggle()}`;
  $('#main').innerHTML = `${head}<div class="card reveal d2"><p class="muted">${t('loading')}</p></div>`;
  wireEduModes();
  let d; try { d = await api('/api/learning/' + id + '?lang=' + LANG); } catch (e) { renderLearning(); return; }
  const p = d.program;
  const sections = p.sections.map((s, i) => {
    const locked = s.unlocked === false;
    const num = s.done ? LP_CHECK : (locked ? LP_LOCK : (i + 1));
    const act = s.done
      ? `<span class="lp-done-tag">${LP_CHECK}${t('lp_done')}</span><button class="btn ghost sm" data-lp-open-sec="${s.id}">${t('lp_open')}</button>`
      : locked
        ? `<button class="btn ghost sm" disabled title="${t('lp_sec_locked')}">${t('lp_open')}</button>`
        : `<button class="btn soft sm" data-lp-open-sec="${s.id}">${t('lp_open')}</button>`;
    return `<div class="lp-sec ${s.done ? 'done' : ''} ${locked ? 'locked' : ''}" id="lp-sec-${s.id}">
      <span class="lp-sec-n">${num}</span>
      <div class="lp-sec-info"><b>${esc(s.title)}</b>${s.desc ? `<p class="lp-sec-desc">${esc(s.desc)}</p>` : ''}</div>
      <div class="lp-sec-act">${act}</div>
    </div>`;
  }).join('');
  const quizLocked = !p.allSectionsDone;
  let quizHtml;
  if (p.completed) {
    quizHtml = `<div class="lp-quiz done"><div class="lp-quiz-h">${LP_CHECK}<b>${t('lp_quiz_passed')}</b></div></div>`;
  } else if (quizLocked) {
    quizHtml = `<div class="lp-quiz locked"><div class="lp-quiz-h">${LP_LOCK}<b>${t('lp_quiz')}</b></div><p class="muted">${t('lp_quiz_locked')}</p></div>`;
  } else {
    quizHtml = `<div class="lp-quiz"><div class="lp-quiz-h"><b>${t('lp_quiz')}</b><span class="muted" style="font-size:13px">${t('lp_quiz_pass')}: ${p.quiz.passScore}%</span></div>
      <p class="muted" style="margin:8px 0 14px">${t('lp_quiz_intro')}</p><button class="btn" id="lp-quiz-open">${t('lp_quiz_start')}</button></div>`;
  }
  $('#main').innerHTML = `${head}
    <button class="lp-backlink reveal d2" id="lp-back">${t('lp_back')}</button>
    <div class="lp-detail reveal d2">
      <div class="lp-detail-head"><div><span class="lp-num big">${p.order}</span></div><div style="flex:1"><h2 class="lp-title">${esc(p.title)}</h2><p class="lp-desc">${esc(p.desc)}</p>
        <div class="lp-prog"><div class="lp-prog-h"><span>${t('lp_progress')}</span><span class="mono">${p.done}/${p.total} · ${p.pct}%</span></div>${lpProgressBar(p.pct)}</div></div></div>
      <h3 class="lp-sub">${t('lp_content')}</h3>
      <div class="lp-secs">${sections}</div>
      ${quizHtml}
    </div>`;
  wireEduModes();
  $('#lp-back').onclick = () => renderLearning();
  $$('[data-lp-open-sec]').forEach(b => b.onclick = () => {
    const s = p.sections.find(x => x.id === b.dataset.lpOpenSec);
    if (s) openSecureReader(id, s, { title: p.title, order: p.order });
  });
  const qopen = $('#lp-quiz-open');
  if (qopen) qopen.onclick = () => openQuizModal(id, p);
}

// Итоговый тест в отдельном полноэкранном окне (как блоки)
let _quizModal = null;
function openQuizModal(programId, p) {
  closeQuizModal();
  const qs = p.quiz.questions.map((q, qi) => `<div class="lm-q"><div class="lm-q-t"><b>${qi + 1}.</b> ${esc(q.q)}</div>
    <div class="lm-opts">${q.opts.map((o, oi) => `<label class="lm-opt"><input type="radio" name="mq${qi}" value="${oi}"><span>${esc(o)}</span></label>`).join('')}</div></div>`).join('');
  const ov = document.createElement('div');
  ov.className = 'lm-body';
  ov.innerHTML = `
    <div class="lm-ambient" aria-hidden="true"><div class="lm-glow lm-glow1"></div><div class="lm-glow lm-glow2"></div><div class="lm-scan"></div></div>
    <header class="lm-head">
      <span class="lm-head-ic">${LP_CHECK}</span>
      <div class="lm-head-t"><div class="lm-eyebrow">${t('lp_quiz')}</div><h1 class="lm-head-title">${esc(p.title)}</h1></div>
      <div class="lm-head-r">
        <span class="lm-pct">${t('lp_quiz_pass')}: ${p.quiz.passScore}%</span>
        <button class="lm-close" id="mq-close">${_svg('<path d="M6 6l12 12M18 6L6 18"/>')}${t('lp_close')}</button>
      </div>
    </header>
    <div class="lm-scroll">
      <article class="lm-article">
        <div class="lm-tag"><span class="lm-tag-dot"></span>${t('lp_quiz')}</div>
        <h2 class="lm-title">${t('lp_quiz')}</h2>
        <div class="lm-meta"><span>${t('lp_quiz_pass')}: ${p.quiz.passScore}% · ${p.quiz.count} ${t('lp_questions')}</span></div>
        <div class="lm-quizbody">${qs}</div>
        <div id="mq-msg" class="lp-quiz-msg"></div>
        <button class="lm-mark ready" id="mq-go">${t('lp_quiz_submit')}</button>
      </article>
    </div>`;
  document.body.appendChild(ov);
  document.body.classList.add('sec-lock');
  _quizModal = ov;
  ov.querySelector('#mq-close').onclick = () => closeQuizModal();
  ov.querySelector('#mq-go').onclick = async () => {
    const answers = {}; let missing = false;
    p.quiz.questions.forEach((q, qi) => { const sel = ov.querySelector(`input[name="mq${qi}"]:checked`); if (!sel) missing = true; else answers[qi] = +sel.value; });
    const msg = ov.querySelector('#mq-msg');
    if (missing) { msg.textContent = t('lp_pick_answer'); msg.className = 'lp-quiz-msg warn'; return; }
    const go = ov.querySelector('#mq-go'); go.disabled = true;
    try {
      const r = await api('/api/learning/' + programId + '/quiz', { method: 'POST', body: JSON.stringify({ answers }) });
      if (r.passed) { toast(t('lp_quiz_passed')); closeQuizModal(); openLearningProgram(programId); }
      else { msg.textContent = tv('lp_quiz_failed', { c: r.correct, t: r.total, p: r.pct }); msg.className = 'lp-quiz-msg bad'; go.disabled = false; }
    } catch (e) { toast(e.message); go.disabled = false; }
  };
}
function closeQuizModal() { if (_quizModal) { _quizModal.remove(); document.body.classList.remove('sec-lock'); _quizModal = null; } }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && _quizModal) closeQuizModal(); });

// ---- Защищённый полноэкранный ридер материала (анти-копирование/скрин, водяной знак) ----
let _secReader = null;
function openSecureReader(programId, section, ctx) {
  closeSecureReader();
  ctx = ctx || {};
  const email = (state.user && state.user.email) || '';
  const acctId = (state.user && state.user.id) || '';
  const stamp = new Date().toLocaleString();
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  // Свой водяной знак — реальные данные аккаунта; тайловый SVG-фон на всю страницу ридера
  const wmPlain = ('HR PRO AI · ' + (email || '') + (acctId ? ' · ID ' + acctId : '') + ' · ' + stamp)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wmSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='470' height='150'><text x='6' y='78' transform='rotate(-22 235 75)' fill='rgba(255,255,255,0.06)' font-family='monospace' font-size='12' font-weight='600'>${wmPlain}</text></svg>`);
  const plain = (section.html || '').replace(/<[^>]+>/g, ' ');
  const readTime = Math.max(1, Math.round(plain.length / 900)) + ' ' + t('lp_min_read');
  const moduleTag = (ctx.order ? t('lp_module') + ' ' + ctx.order : '') + (ctx.title ? (ctx.order ? ' · ' : '') + ctx.title : '');
  const done = !!section.done;
  const ov = document.createElement('div');
  ov.className = 'lm-body';
  ov.setAttribute('oncontextmenu', 'return false');
  ov.innerHTML = `
    <div class="lm-ambient" aria-hidden="true"><div class="lm-glow lm-glow1"></div><div class="lm-glow lm-glow2"></div><div class="lm-scan"></div></div>
    <div class="lm-wm" id="sec-wm" aria-hidden="true"></div>
    <div class="lm-progress"><div class="lm-progress-fill" id="sec-read-fill" style="width:${done ? 100 : 0}%"></div></div>
    <header class="lm-head">
      <span class="lm-head-ic">${LP_LOCK}</span>
      <div class="lm-head-t"><div class="lm-eyebrow">${t('lp_material')}</div><h1 class="lm-head-title">${esc(section.title)}</h1></div>
      <div class="lm-head-r">
        <span class="lm-pct" id="sec-read-pct">${done ? '100%' : '0%'}</span>
        <button class="lm-bm ${section.bookmark != null ? 'on' : ''}" id="sec-bm" title="${t('lp_bookmark')}">${LP_BM}<span class="lm-bm-l">${t('lp_bookmark')}</span></button>
        <button class="lm-passed ${done ? 'on' : ''}" id="sec-done" ${done ? '' : 'disabled'}><span class="lm-passed-dot"></span><span class="lm-passed-label">${done ? t('lp_done') : t('lp_read_to_end')}</span></button>
        <button class="lm-close" id="sec-close">${_svg('<path d="M6 6l12 12M18 6L6 18"/>')}${t('lp_close')}</button>
      </div>
    </header>
    <div class="lm-scroll" id="sec-scroll">
      <article class="lm-article">
        <div class="lm-tag"><span class="lm-tag-dot"></span>${esc(moduleTag) || t('lp_material')}</div>
        <h2 class="lm-title">${esc(section.title)}</h2>
        <div class="lm-meta"><span class="lm-meta-i">${_svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}${readTime}</span><span class="lm-meta-dot"></span><span>${esc(ctx.title || 'HR PRO AI')}</span></div>
        <div class="lm-content">${section.html || ''}</div>
        <div class="lm-foot">
          <div id="sec-foot-slot">${done
      ? `<div class="lm-passed-banner"><span class="lm-passed-check">${LP_CHECK}</span><div><b>${t('lp_passed_title')}</b><span>${t('lp_passed_sub')}</span></div></div>`
      : `<button class="lm-mark" id="sec-done-2" disabled>${LP_CHECK}${t('lp_read_to_end')}</button>`}</div>
          <p class="lm-copyright">${LP_LOCK}${t('lp_protected')}</p>
        </div>
      </article>
    </div>
    <div class="sec-reader-shield" id="sec-shield"><div>${LP_LOCK}<span>${t('lp_hidden')}</span></div></div>`;
  document.body.appendChild(ov);
  document.body.classList.add('sec-lock');
  const wmEl = ov.querySelector('#sec-wm'); if (wmEl) wmEl.style.backgroundImage = 'url("' + wmSvg + '")';
  let bookmarked = section.bookmark != null;
  let curPct = section.bookmark != null ? section.bookmark : 0;

  const stop = e => { e.preventDefault(); e.stopPropagation(); return false; };
  const onCopy = e => {
    try { (e.clipboardData || window.clipboardData).setData('text/plain', '© ' + (email || 'HR PRO AI') + ' — материал защищён авторским правом, копирование запрещено (' + token + ')'); } catch (_) {}
    e.preventDefault(); e.stopPropagation(); toast(t('lp_copy_blocked')); return false;
  };
  const clearClip = () => { try { navigator.clipboard && navigator.clipboard.writeText(''); } catch (_) {} };
  const onKey = e => {
    const k = (e.key || '').toLowerCase();
    if (e.key === 'PrintScreen') { clearClip(); showShield(true); setTimeout(() => showShield(false), 1200); return; }
    if ((e.ctrlKey || e.metaKey) && ['c', 'x', 's', 'p', 'u', 'a'].includes(k)) return stop(e);
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k)) return stop(e);
    if (e.key === 'F12') return stop(e);
  };
  const showShield = on => { const s = ov.querySelector('#sec-shield'); if (s) s.classList.toggle('on', on); };
  const onVis = () => showShield(document.hidden);
  const onBlur = () => showShield(true);
  const onFocus = () => showShield(false);
  const onPrint = () => showShield(true);
  ['copy', 'cut'].forEach(ev => ov.addEventListener(ev, onCopy));
  ['paste', 'contextmenu', 'selectstart', 'dragstart'].forEach(ev => ov.addEventListener(ev, stop));
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  window.addEventListener('beforeprint', onPrint);
  // опрос: прячем контент при потере фокуса (переключение на инструмент захвата) или при открытых DevTools
  const devtoolsOpen = () => (window.outerWidth - window.innerWidth > 260) || (window.outerHeight - window.innerHeight > 260);
  const poll = setInterval(() => { if (!_secReader) return; showShield(!document.hasFocus() || document.hidden || devtoolsOpen()); }, 400);
  _secReader = { ov, onKey, onVis, onBlur, onFocus, onPrint, poll };

  const doneBtns = [ov.querySelector('#sec-done'), ov.querySelector('#sec-done-2')].filter(Boolean);
  const markDone = async (btn) => {
    if (btn.disabled) return;
    doneBtns.forEach(b => b.disabled = true);
    try { await api('/api/learning/' + programId + '/section/' + section.id, { method: 'POST', body: '{}' }); closeSecureReader(); openLearningProgram(programId); }
    catch (e) { toast(e.message); doneBtns.forEach(b => { b.disabled = false; }); }
  };
  doneBtns.forEach(b => b.onclick = () => markDone(b));

  // Закладка — сохраняет текущее место прокрутки, чтобы вернуться сюда позже.
  const saveBookmark = async (pct) => api('/api/learning/' + programId + '/bookmark', { method: 'POST', body: JSON.stringify({ sectionId: section.id, pct }) });
  const bmBtn = ov.querySelector('#sec-bm');
  if (bmBtn) bmBtn.onclick = async () => {
    try {
      if (bookmarked) { await saveBookmark(null); bookmarked = false; section.bookmark = null; bmBtn.classList.remove('on'); toast(t('lp_bookmark_removed')); }
      else { const pos = Math.round(curPct); await saveBookmark(pos); bookmarked = true; section.bookmark = pos; bmBtn.classList.add('on'); toast(t('lp_bookmark_set')); }
    } catch (e) { toast(e.message); }
  };

  // Трекинг чтения: раздел засчитывается только после доскролла материала до конца.
  const scroller = ov.querySelector('#sec-scroll');
  const fill = ov.querySelector('#sec-read-fill');
  const pctEl = ov.querySelector('#sec-read-pct');
  let reachedEnd = done;
  const enableDone = () => {
    if (reachedEnd) return;
    reachedEnd = true;
    const h = ov.querySelector('#sec-done');
    if (h) { h.disabled = false; h.classList.add('ready'); const lbl = h.querySelector('.lm-passed-label'); if (lbl) lbl.textContent = t('lp_mark_passed'); }
    const f = ov.querySelector('#sec-done-2');
    if (f) { f.disabled = false; f.classList.add('ready'); f.innerHTML = LP_CHECK + t('lp_mark_passed'); }
  };
  const updateRead = () => {
    if (!scroller) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    const pct = max <= 8 ? 0 : Math.min(100, Math.round(scroller.scrollTop / max * 100));
    curPct = pct;
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (pct >= 99) enableDone();
  };
  if (scroller) scroller.addEventListener('scroll', updateRead, { passive: true });
  requestAnimationFrame(updateRead);
  setTimeout(updateRead, 200);
  // короткий материал, помещающийся без прокрутки — доступен к отметке после раскладки
  setTimeout(() => { if (scroller && (scroller.scrollHeight - scroller.clientHeight) <= 8) { curPct = 100; if (fill) fill.style.width = '100%'; if (pctEl) pctEl.textContent = '100%'; enableDone(); } }, 600);
  // Восстановление позиции с закладки при открытии (повторяем после раскладки большого контента)
  if (section.bookmark != null && scroller) {
    const restore = () => { const max = scroller.scrollHeight - scroller.clientHeight; if (max > 8) scroller.scrollTop = section.bookmark / 100 * max; updateRead(); };
    requestAnimationFrame(restore); setTimeout(restore, 250); setTimeout(restore, 650);
    setTimeout(() => { toast(t('lp_bookmark_resumed')); }, 400);
  }

  // Выход: если закладка не стоит и материал начат, но не дочитан — спросить о закладке.
  const requestClose = () => {
    if (!bookmarked && !done && curPct > 2 && curPct < 98) {
      readerAsk(ov, {
        title: t('lp_bm_q_title'), text: t('lp_bm_q_text'), okLabel: t('lp_bm_set_btn'), cancelLabel: t('lp_bm_exit'),
        onOk: async () => { const pos = Math.round(curPct); try { await saveBookmark(pos); } catch (_) {} section.bookmark = pos; bookmarked = true; closeSecureReader(); },
        onCancel: () => closeSecureReader(),
      });
    } else closeSecureReader();
  };
  ov.querySelector('#sec-close').onclick = requestClose;
  _secReader.requestClose = requestClose;
}
// Небольшой диалог внутри ридера (поверх шилда/контента) — для вопроса о закладке.
function readerAsk(ov, o) {
  const m = document.createElement('div');
  m.className = 'lm-ask';
  m.innerHTML = `<div class="lm-ask-box"><div class="lm-ask-ic">${LP_BM}</div><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p>
    <div class="lm-ask-actions"><button class="lm-ask-cancel">${esc(o.cancelLabel)}</button><button class="lm-ask-ok">${esc(o.okLabel)}</button></div></div>`;
  ov.appendChild(m);
  m.querySelector('.lm-ask-ok').onclick = () => { m.remove(); o.onOk && o.onOk(); };
  m.querySelector('.lm-ask-cancel').onclick = () => { m.remove(); o.onCancel && o.onCancel(); };
}
function closeSecureReader() {
  if (!_secReader) return;
  const { ov, onKey, onVis, onBlur, onFocus, onPrint, poll } = _secReader;
  document.removeEventListener('keydown', onKey, true);
  document.removeEventListener('visibilitychange', onVis);
  window.removeEventListener('blur', onBlur);
  window.removeEventListener('focus', onFocus);
  window.removeEventListener('beforeprint', onPrint);
  clearInterval(poll);
  ov.remove();
  document.body.classList.remove('sec-lock');
  _secReader = null;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && _secReader) { _secReader.requestClose ? _secReader.requestClose() : closeSecureReader(); } });

async function renderSearch() {
  $('#main').innerHTML = `<div class="eyebrow reveal">Поиск</div><h1 class="page-h reveal d1" style="margin-top:10px">Найти кандидата</h1><div class="card reveal d2"><div class="search-wrap"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="gs" aria-label="Поиск кандидата" placeholder="Имя, email, телефон, город…" autofocus></div><div class="table-wrap" style="margin-top:16px;box-shadow:none"><table><thead><tr><th>Кандидат</th><th>Почта</th><th>Телефон</th><th>Город</th><th>Вакансия</th></tr></thead><tbody id="gs-rows"></tbody></table></div></div>`;
  await loadParticipantsAll();
  const draw = f => { const list = state.participants.filter(p => !f || (p.name + p.surname + p.email + (p.tel || '') + (p.city || '')).toLowerCase().includes(f)); $('#gs-rows').innerHTML = list.map(p => { const nm = (p.name + ' ' + p.surname).trim() || p.email; return `<tr onclick="openParticipant('${p.id}')"><td><div class="cand"><span class="avatar" style="width:30px;height:30px;background:${avColor(nm)}">${esc(initials(nm, p.email))}</span><b>${esc(nm)}</b></div></td><td>${esc(p.email)}</td><td>${esc(p.tel || '—')}</td><td>${esc(p.city || '—')}</td><td>${esc(p.vacancyName || '—')}</td></tr>`; }).join('') || `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">Ничего не найдено</td></tr>`; };
  draw(''); $('#gs').oninput = e => draw(e.target.value.toLowerCase());
}
async function renderBalance() {
  const [b, plansD, purch] = await Promise.all([api('/api/balance'), api('/api/plans'), api('/api/purchases')]);
  state.user = b.balance; const bal = b.balance;
  // символ валюты приходит с сервера (настраивается в админке)
  const cur = { eur: '€', usd: '$', pln: 'zł', rub: '₽' }[plansD.currency] || plansD.currency || '€';
  const plans = plansD.plans.map(p => `<div class="plan ${p.popular ? 'pop' : ''}" data-plan="${p.id}">${p.popular ? `<div class="ribbon">${t('bal_hit')}</div>` : ''}<div class="qty">${p.qty}</div><div class="muted" style="font-weight:600;margin-bottom:14px">${t('tests_word')}</div>${p.save ? `<span class="save">${t('bal_save')} ${p.save}%</span>` : ''}<div class="price">${p.price.toLocaleString('ru')} ${cur}</div><div class="per">${(p.price / p.qty).toFixed(0)} ${cur} ${t('bal_per')}</div><button class="btn ${p.popular ? '' : 'ghost'}" style="width:100%" data-buy="${p.id}">${t('bal_buy')}</button></div>`).join('');
  const hist = purch.purchases.length ? purch.purchases.map(p => `<div class="pt-row"><span>+${p.qty} ${t('tests_word')} <span class="muted">· ${p.method === 'stripe' ? 'Stripe' : 'demo'}</span></span><span class="mono">${p.amount.toLocaleString('ru')} ${cur} · ${fmtDate(p.createdAt)}</span></div>`).join('') : `<p class="muted">${t('bal_no_purch')}</p>`;
  $('#main').innerHTML = `<div class="eyebrow reveal">${t('bal_eyebrow')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('bal_title')}</h1>
    <div class="stat-grid reveal d2"><div class="stat"><div class="n" style="color:var(--brand)">${bal.balanceAvailable}</div><div class="l">${t('bal_available')}</div></div><div class="stat"><div class="n">${bal.balanceTotal}</div><div class="l">${t('bal_total')}</div></div><div class="stat"><div class="n" style="color:var(--warn)">${bal.balancePending}</div><div class="l">${t('bal_pending')}</div></div></div>
    <p class="muted reveal d2" style="margin:12px 2px 0;font-size:13.5px;display:flex;align-items:center;gap:7px"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${t('bal_ttl_note')}${bal.balanceExpiresAt ? ' ' + t('bal_ttl_next') + ' ' + fmtDate(bal.balanceExpiresAt) + '.' : ''}</span></p>
    <h2 style="margin:34px 0 6px" class="reveal d3">${t('bal_topup_h')}</h2><p class="muted reveal d3" style="margin:0 0 20px">${plansD.stripe ? t('bal_stripe') : t('bal_demo')}</p>
    <div class="plan-grid reveal d3">${plans}</div>
    <h2 style="margin:38px 0 14px">${t('bal_history')}</h2><div class="card">${hist}</div>`;
  $$('[data-buy]').forEach(btn => btn.onclick = () => buyPlan(btn.dataset.buy, btn));
  fillBars();
}
async function buyPlan(planId, btn) {
  const orig = btn.textContent; btn.disabled = true; btn.textContent = t('bal_paying');
  try {
    const d = await api('/api/checkout', { method: 'POST', body: JSON.stringify({ planId }) });
    if (d.url) { location.href = d.url; return; }
    state.user = d.balance; toast(t('bal_topped')); renderBalance();
  } catch (e) { toast(e.message); btn.disabled = false; btn.textContent = orig; }
}

// ================= SETTINGS =================
let settingsTab = 'profile';
const TZ_LIST = ['GMT+0 UTC', 'GMT+1 Europe/Warsaw', 'GMT+2 Europe/Kyiv', 'GMT+3 Europe/Moscow', 'GMT+4 Asia/Baku', 'GMT+5 Asia/Tashkent'];
function switchRow(id, label, on) { return `<label class="switchrow"><span>${label}</span><span class="switch ${on ? 'on' : ''}" data-switch="${id}"><i></i></span></label>`; }
function selOpts(list, cur) { return list.map(v => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join(''); }
async function renderSettings() {
  const d = await api('/api/settings'); state.user = d.user;
  if (d.langs) state.langs = d.langs;
  const tabs = [['profile', t('set_profile')], ['params', t('set_params')], ['notify', t('set_notify')], ['templates', t('set_templates')], ['security', t('set_security')]];
  $('#main').innerHTML = `<div class="eyebrow reveal">${t('set_account')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('set_title')}</h1>
    <div class="settabs reveal d2">${tabs.map(([k, l]) => `<button class="seg-tab ${settingsTab === k ? 'on' : ''}" data-stab="${k}">${l}</button>`).join('')}</div>
    <div class="reveal d2" id="set-body"></div>`;
  $$('.seg-tab').forEach(b => b.onclick = () => { settingsTab = b.dataset.stab; renderSettings(); });
  settingsBody(state.user);
}
function settingsBody(u) {
  const s = u.settings || {}, box = $('#set-body');
  if (settingsTab === 'profile') {
    box.innerHTML = `<div class="card"><h2 style="margin:0 0 16px;font-size:19px">${t(`prof_edit`)}</h2><div class="form-grid">
      <div><label class="lbl">${t(`prof_email`)}</label><input class="field" value="${esc(u.email)}" disabled></div>
      <div><label class="lbl">${t(`prof_name`)}</label><input class="field" id="st-name" value="${esc(u.name || '')}"></div>
      <div><label class="lbl">${t(`prof_surname`)}</label><input class="field" id="st-surname" value="${esc(u.surname || '')}"></div>
      <div><label class="lbl">${t(`prof_company`)}</label><input class="field" id="st-company" value="${esc(u.company || '')}"></div>
      <div><label class="lbl">${t(`prof_employees`)}</label><input class="field" id="st-employees" value="${esc(s.employees || '')}"></div>
      <div><label class="lbl">${t(`prof_phone`)}</label><input class="field" id="st-phone" value="${esc(s.phone || '')}"></div>
      <div class="full"><label class="lbl">${t(`prof_logo`)}</label>
        <div class="logo-up"><div class="logo-prev" id="logo-prev">${s.logo ? `<img src="${esc(s.logo)}">` : `<span class="muted">${t(`prof_no_logo`)}</span>`}</div>
          <input type="file" accept="image/*" id="logo-file" hidden>
          <button type="button" class="btn ghost sm" id="logo-btn">${t(`prof_upload`)}</button>
          <button type="button" class="btn ghost sm danger ${s.logo ? '' : 'hidden'}" id="logo-clear">${t(`prof_remove`)}</button></div>
        <input type="hidden" id="st-logo" value="${esc(s.logo || '')}"></div>
    </div><button class="btn" style="margin-top:16px" id="st-save">${t(`save`)}</button></div>`;
    $('#logo-btn').onclick = () => $('#logo-file').click();
    $('#logo-file').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => openLogoCrop(r.result, url => { $('#st-logo').value = url; $('#logo-prev').innerHTML = `<img src="${url}">`; $('#logo-clear').classList.remove('hidden'); }); r.readAsDataURL(f); e.target.value = ''; };
    $('#logo-clear').onclick = () => { $('#st-logo').value = ''; $(`#logo-prev`).innerHTML = `<span class="muted">${t(`prof_no_logo`)}</span>`; $('#logo-clear').classList.add('hidden'); };
    $('#st-save').onclick = () => saveSettings({ name: $('#st-name').value, surname: $('#st-surname').value, company: $('#st-company').value, employees: $('#st-employees').value, phone: $('#st-phone').value, logo: $('#st-logo').value });
  } else if (settingsTab === 'params') {
    // Очерёдность тестов настраивается в «Процессе найма» каждой вакансии, а не здесь
    box.innerHTML = `<div class="card"><h2 style="margin:0 0 16px;font-size:19px">${t(`set_params`)}</h2><div class="form-grid">
      <div><label class="lbl">${t(`par_tz`)}</label><select class="field" id="st-tz">${selOpts(TZ_LIST, s.timezone)}</select></div>
      <div><label class="lbl">${t(`par_uilang`)}</label><select class="field" id="st-uilang">${langOptions(s.uiLang || 'ru')}</select></div>
    </div><button class="btn" style="margin-top:16px" id="st-save">${t(`save`)}</button></div>`;
    $('#st-save').onclick = () => saveSettings({ timezone: $('#st-tz').value, uiLang: $('#st-uilang').value });
  } else if (settingsTab === 'notify') {
    box.innerHTML = `<div class="card"><h2 style="margin:0 0 16px;font-size:19px">${t(`notif_title`)}</h2>
      ${switchRow('notifySms', t(`notif_sms`), s.notifySms)}
      ${switchRow('notifyComment', t(`notif_comment`), s.notifyComment)}
      ${switchRow('searchAllAccounts', t(`notif_search`), s.searchAllAccounts)}
      ${switchRow('askPersonalData', t(`notif_personal`), s.askPersonalData)}
      <button class="btn" style="margin-top:18px" id="st-save">${t(`save`)}</button></div>`;
    $$('.switch[data-switch]').forEach(sw => sw.onclick = () => sw.classList.toggle('on'));
    $('#st-save').onclick = () => { const g = id => $('.switch[data-switch="' + id + '"]').classList.contains('on'); saveSettings({ notifySms: g('notifySms'), notifyComment: g('notifyComment'), searchAllAccounts: g('searchAllAccounts'), askPersonalData: g('askPersonalData') }); };
  } else if (settingsTab === 'templates') {
    const langs = state.langs.length ? state.langs : Object.keys(LANG_NAME).map(c => ({ code: c, name: LANG_NAME[c] }));
    if (!langs.some(l => l.code === tplLang)) tplLang = langs[0].code;
    if (!s.mailTemplates || !s.mailTemplates.send) s.mailTemplates = emptyMail();
    const items = mtCat === 'send' ? MAIL_SEND_OURS : MAIL_STATUS_OURS;
    if (!items[mtItem]) mtItem = Object.keys(items)[0];
    if (!s.mailTemplates[mtCat][mtItem]) s.mailTemplates[mtCat][mtItem] = {};
    const cur = s.mailTemplates[mtCat][mtItem][tplLang] || { subject: '', body: '' };
    const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
    const tb = `<div class="rte-toolbar" id="rte-tb">
      <button data-cmd="bold" title="${t('rte_bold')}"><b>${t('g_bold')}</b></button>
      <button data-cmd="italic" title="${t('rte_italic')}"><i>${t('g_italic')}</i></button>
      <button data-cmd="underline" title="${t('rte_underline')}"><u>${t('g_underline')}</u></button>
      <select data-cmd="fontName" title="${t('rte_font')}" class="rte-sel">${fonts.map(f => `<option value="${f}">${f}</option>`).join('')}</select>
      <select data-cmd="formatBlock" title="${t('rte_format')}" class="rte-sel"><option value="P">${t('fmt_normal')}</option><option value="H2">${t('fmt_h2')}</option><option value="H3">${t('fmt_h3')}</option></select>
      <select data-cmd="fontSize" title="${t('rte_size')}" class="rte-sel"><option value="2">${t('sz_small')}</option><option value="3" selected>${t('sz_normal')}</option><option value="5">${t('sz_large')}</option></select>
      <label class="rte-color" title="${t('rte_color')}"><input type="color" data-cmd="foreColor" value="#16203a"></label>
      <button data-cmd="insertUnorderedList" title="${t('rte_ul')}">•—</button>
      <button data-cmd="insertOrderedList" title="${t('rte_ol')}">1.</button>
      <button data-cmd="createLink" title="${t('rte_link')}">${ICON_LINK}</button>
      <button data-cmd="insertImage" title="${t('rte_img')}">${ICON_IMG}</button>
      <div class="grow"></div>
      <button class="rte-html-btn" id="rte-html" title="${t('rte_html')}">&lt;/&gt;</button></div>`;
    const sms = s.smsTemplates || {};
    const itemLabel = k => mtCat === 'send' ? testTitle(k) : t('st_' + k);
    const smsPanes = `<div class="sms-editor">${langs.map(l => `<div class="rte-pane ${l.code === tplLang ? '' : 'hidden'}" data-pane="${l.code}">
          <label class="lbl">${t('sms_label')} (${l.code.toUpperCase()})</label>
          <textarea class="field sms-text" data-tpl-sms="${l.code}" maxlength="360" spellcheck="false">${esc(sms[l.code] || '')}</textarea>
          <div class="muted" style="font-size:12px;margin-top:5px">${t('sms_hint')}</div></div>`).join('')}</div>`;
    const emailEditor = `
      <div class="tc-seg2"><button class="seg2 ${mtCat === 'send' ? 'on' : ''}" data-mcat="send">${t('mail_cat_send')}</button><button class="seg2 ${mtCat === 'status' ? 'on' : ''}" data-mcat="status">${t('mail_cat_status')}</button></div>
      <div class="tc-items" style="margin-bottom:10px">${Object.keys(items).map(k => `<button class="chip sm ${k === mtItem ? 'active' : ''}" data-mitem="${k}">${esc(itemLabel(k))}</button>`).join('')}</div>
      <div class="tpl-subtabs">${langs.map(l => `<button class="seg-tab sm ${l.code === tplLang ? 'on' : ''}" data-tlang="${l.code}">${l.code.toUpperCase()}</button>`).join('')}</div>
      <div class="rte">${tb}
        <div class="rte-pane" data-pane="${tplLang}">
          <label class="lbl">${t('tpl_subject')}</label><input class="field" id="mt-subject" value="${esc(cur.subject)}">
          <label class="lbl" style="margin-top:10px">${t('tpl_body')}</label>
          <div class="rte-body" contenteditable="true" data-tpl-body="${tplLang}">${htmlBody(cur.body)}</div>
          <textarea class="field rte-html-src hidden" data-tpl-html="${tplLang}" spellcheck="false"></textarea></div></div>`;
    box.innerHTML = `<div class="card"><h2 style="margin:0 0 6px;font-size:19px">${t('tpl_title')}</h2>
      <div class="seg" style="max-width:240px;margin:6px 0 12px"><button class="${tplMode === 'email' ? 'on' : ''}" data-tmode="email">E-mail</button><button class="${tplMode === 'sms' ? 'on' : ''}" data-tmode="sms">SMS</button></div>
      <p class="muted" style="margin:0 0 14px">${t('mail_vars')}: <code>$vac$</code> <code>$name$</code> <code>$company$</code> <code>$client$</code> <code>$link$</code> <code>$button_link$</code> <code>$phone$</code> <code>$date_interview$</code>. ${t('tpl_hint')}</p>
      ${tplMode === 'sms' ? `<div class="tpl-subtabs">${langs.map(l => `<button class="seg-tab sm ${l.code === tplLang ? 'on' : ''}" data-tlang="${l.code}">${l.code.toUpperCase()}</button>`).join('')}</div>${smsPanes}` : emailEditor}
      <button class="btn" style="margin-top:16px" id="st-save">${t('tpl_save_btn')}</button></div>`;
    function stashMail() {
      const pane = $('.rte-pane'); if (pane) { const src = pane.querySelector('.rte-html-src'); if (src && !src.classList.contains('hidden')) pane.querySelector('.rte-body').innerHTML = src.value; }
      const sub = $('#mt-subject'), body = $('.rte-body[data-tpl-body]');
      if (sub && body) { if (!s.mailTemplates[mtCat][mtItem]) s.mailTemplates[mtCat][mtItem] = {}; s.mailTemplates[mtCat][mtItem][tplLang] = { subject: sub.value, body: body.innerHTML }; }
    }
    $$('[data-tmode]').forEach(b => b.onclick = () => { if (tplMode === 'email') stashMail(); tplMode = b.dataset.tmode; settingsBody(u); });
    $$('[data-mcat]').forEach(b => b.onclick = () => { stashMail(); mtCat = b.dataset.mcat; mtItem = Object.keys(mtCat === 'send' ? MAIL_SEND_OURS : MAIL_STATUS_OURS)[0]; settingsBody(u); });
    $$('[data-mitem]').forEach(b => b.onclick = () => { stashMail(); mtItem = b.dataset.mitem; settingsBody(u); });
    $$('.tpl-subtabs .seg-tab').forEach(b => b.onclick = () => { if (tplMode === 'email') { stashMail(); tplLang = b.dataset.tlang; settingsBody(u); } else { tplLang = b.dataset.tlang; $$('.tpl-subtabs .seg-tab').forEach(x => x.classList.toggle('on', x.dataset.tlang === tplLang)); $$('.rte-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== tplLang)); } });
    if (tplMode === 'email') wireRte();
    $('#st-save').onclick = () => {
      if (tplMode === 'email') { stashMail(); saveSettings({ mailTemplates: s.mailTemplates }); }
      else { const smsTemplates = {}; $$('[data-tpl-sms]').forEach(i => { smsTemplates[i.dataset.tplSms] = i.value; }); saveSettings({ smsTemplates }); }
    };
  } else if (settingsTab === 'security') {
    box.innerHTML = `<div class="card"><h2 style="margin:0 0 16px;font-size:19px">${t(`sec_title`)}</h2><div class="form-grid">
      <div><label class="lbl">${t(`sec_cur`)}</label><input class="field" id="pw-cur" type="password"></div>
      <div><label class="lbl">${t(`sec_new`)}</label><input class="field" id="pw-new" type="password"></div>
      <div><label class="lbl">${t(`sec_rep`)}</label><input class="field" id="pw-rep" type="password"></div>
    </div><button class="btn" style="margin-top:16px" id="pw-save">${t(`sec_change`)}</button></div>`;
    $('#pw-save').onclick = async () => { const cur = $('#pw-cur').value, nw = $('#pw-new').value, rep = $('#pw-rep').value; if (nw !== rep) return toast(t(`sec_mismatch`)); try { await api('/api/settings/password', { method: 'POST', body: JSON.stringify({ current: cur, next: nw }) }); toast(t(`sec_changed`)); $('#pw-cur').value = $('#pw-new').value = $('#pw-rep').value = ''; } catch (e) { toast(e.message); } };
  }
}
async function saveSettings(patch) {
  try { const d = await api('/api/settings', { method: 'PUT', body: JSON.stringify(patch) }); state.user = d.user; toast(t(`saved`)); settingsBody(state.user); } catch (e) { toast(e.message); }
}
// ---- rich text editor for email templates ----
let tplLang = 'ru', tplMode = 'email', rteSavedRange = null;
let mtCat = 'send', mtItem = 'tools';
// в портале реально есть только эти тесты — их и показываем в шаблонах отправки
const MAIL_SEND_OURS = { tools: 'Тест Тулс', result: 'Тест Резалт', logic: 'Тест Логис', sales: 'Тест Сэйлс' };
const MAIL_STATUS_OURS = { rejected: 'Отказано', interview: 'Собеседование', reserve: 'Резерв', accepted: 'Принят' };
function htmlBody(b) { b = b || ''; return /<[a-z][\s\S]*>/i.test(b) ? b : esc(b).replace(/\n/g, '<br>'); }
function rteActive() { return $('.rte-pane:not(.hidden) .rte-body'); }
function rteSaveSel() { const s = window.getSelection(); const ed = rteActive(); if (s.rangeCount && ed && ed.contains(s.anchorNode)) rteSavedRange = s.getRangeAt(0).cloneRange(); }
function rteRestoreSel() { const ed = rteActive(); if (!ed) return; ed.focus(); if (rteSavedRange) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(rteSavedRange); } }
function rtePickImage(cb) { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = () => { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(f); }; inp.click(); }
function wireRte() {
  $$('.rte-body').forEach(ed => { ['keyup', 'mouseup', 'input'].forEach(ev => ed.addEventListener(ev, rteSaveSel)); });
  $$('#rte-tb [data-cmd]').forEach(el => {
    const cmd = el.dataset.cmd;
    if (el.tagName === 'SELECT') { el.onchange = () => { rteRestoreSel(); document.execCommand(cmd, false, cmd === 'formatBlock' ? '<' + el.value + '>' : el.value); rteSaveSel(); }; }
    else if (el.tagName === 'INPUT') { el.oninput = () => { rteRestoreSel(); document.execCommand(cmd, false, el.value); rteSaveSel(); }; }
    else { el.onmousedown = e => e.preventDefault(); el.onclick = () => { const ed = rteActive(); if (!ed) return; ed.focus(); if (cmd === 'createLink') { const u = prompt('Адрес ссылки:', 'https://'); if (u) document.execCommand('createLink', false, u); } else if (cmd === 'insertImage') { rtePickImage(url => { ed.focus(); rteRestoreSel(); document.execCommand('insertImage', false, url); }); } else document.execCommand(cmd, false, null); rteSaveSel(); }; }
  });
  const hb = $('#rte-html'); if (hb) hb.onclick = () => { const pane = $('.rte-pane:not(.hidden)'); if (!pane) return; const body = pane.querySelector('.rte-body'), src = pane.querySelector('.rte-html-src'); const on = hb.classList.toggle('on'); if (on) { src.value = body.innerHTML; src.classList.remove('hidden'); body.classList.add('hidden'); src.focus(); } else { body.innerHTML = src.value; src.classList.add('hidden'); body.classList.remove('hidden'); } };
}
function syncHtmlPanes() { $$('.rte-pane').forEach(p => { const src = p.querySelector('.rte-html-src'); if (src && !src.classList.contains('hidden')) p.querySelector('.rte-body').innerHTML = src.value; }); }

// ---- logo upload + crop ----
function openLogoCrop(src, onDone) {
  const V = 260;
  openModal(`<h2 style="margin:0 0 4px">Кадрирование логотипа</h2><p class="muted" style="margin:0 0 14px">Перетащите изображение и настройте масштаб.</p>
    <div class="crop-frame" id="crop-frame" style="width:${V}px;height:${V}px"><img id="crop-img" src="${src}" draggable="false"></div>
    <div class="row" style="margin-top:12px;gap:10px"><span class="muted" style="font-size:12px">Масштаб</span><input type="range" id="crop-zoom" min="1" max="3" step="0.01" value="1" style="flex:1"></div>
    <div class="row" style="margin-top:16px"><button class="btn" id="crop-apply">Применить</button><button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
  const img = $('#crop-img'), frame = $('#crop-frame');
  let iw = 1, ih = 1, base = 1, scale = 1, ox = 0, oy = 0, drag = null;
  function clampAndApply() { const w = iw * base * scale, h = ih * base * scale; ox = Math.min(0, Math.max(V - w, ox)); oy = Math.min(0, Math.max(V - h, oy)); img.style.width = w + 'px'; img.style.height = h + 'px'; img.style.transform = `translate(${ox}px,${oy}px)`; }
  function init() { iw = img.naturalWidth || 1; ih = img.naturalHeight || 1; base = Math.max(V / iw, V / ih); scale = 1; const w = iw * base, h = ih * base; ox = (V - w) / 2; oy = (V - h) / 2; clampAndApply(); }
  img.onload = init; if (img.complete && img.naturalWidth) init();
  $('#crop-zoom').oninput = e => { scale = +e.target.value; clampAndApply(); };
  frame.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, ox, oy }; frame.setPointerCapture(e.pointerId); };
  frame.onpointermove = e => { if (!drag) return; ox = drag.ox + (e.clientX - drag.x); oy = drag.oy + (e.clientY - drag.y); clampAndApply(); };
  frame.onpointerup = frame.onpointercancel = () => drag = null;
  $('#crop-apply').onclick = () => { const c = document.createElement('canvas'); c.width = V; c.height = V; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, V, V); g.drawImage(img, ox, oy, iw * base * scale, ih * base * scale); const url = c.toDataURL('image/png'); closeModal(); onDone(url); };
}

// ================= FAQ =================
const FAQ = [
  { cat: 'С чего начать', items: [
    ['Заполнение личных данных', 'Первым делом зайдите в раздел «Настройки» и заполните профиль: название компании, вашу фамилию и контактный номер, часовой пояс и язык интерфейса. Эти данные подставляются в письма кандидатам через плейсхолдеры {company}, поэтому важно указать их корректно. Загрузите и при необходимости кадрируйте логотип компании — он появится в письмах и на публичной странице анкеты, чтобы всё выглядело фирменно и вызывало доверие у соискателя. После заполнения профиля создайте первый раздел и вакансию — и можно отправлять тесты.'],
    ['Демонстрация возможностей', 'Чтобы понять, что именно увидит рекрутёр по каждому кандидату, отправьте тест самому себе. На дашборде в поле «Быстрая отправка теста» укажите свою почту, выберите «Резалт» и «Тулс» и нажмите «Отправить». Пройдите тесты по ссылкам из письма и откройте готовые отчёты в кабинете: вы увидите график из 10 точек по «Тулсу», интерпретацию, синдромы, подсказку ИИ и вердикт «Резалта». Это лучший способ за 10 минут разобраться в системе перед работой с реальными кандидатами.'],
  ] },
  { cat: 'Общие вопросы', items: [
    ['Как правильно обрабатывать отклики соискателей?', 'Не тратьте часы на чтение резюме — резюме показывает, кем человек хочет казаться, а не кто он на самом деле. Правильный порядок такой: сразу отправляйте соискателю тест «Резалт» (продуктивность) — это первый и главный фильтр. Тех, кто показал себя продуктивным, проверяйте тестом «Тулс» (личность), чтобы оценить риски и стиль управления. Для руководителей добавьте «Логис» (интеллект), для продавцов — «Сэйлс». Из ста откликов так вы за считанные минуты выделяете 3–5 сильных кандидатов и приглашаете на собеседование только их. Главное правило: берём по продуктивности, а по личным качествам оцениваем риск, а не отсеиваем эффективных.'],
    ['Настройка таблицы кандидатов: поиск и сортировка', 'Список кандидатов на вкладке «Тесты» полностью настраивается. Сверху — фильтры по типу теста, этапу и статусу, а также сортировка «сначала новые / по имени». Справа — поле поиска по имени, email, телефону и городу; глобальный поиск также открывается по Ctrl+K из любого места. Набор столбцов вы задаёте сами: нажмите иконку-шестерёнку в правом верхнем углу таблицы и включите/выключите нужные колонки (ID, возраст, пол, телефон, рейтинги, дата, город, комментарий). Любого кандидата можно пометить звёздочкой — избранные всегда поднимаются наверх списка.'],
    ['Статусы кандидатов и письма', 'Каждому кандидату присваивается этап воронки: «Новый», «Собеседование», «Резерв», «Принят» или «Отказ». Этап отображается цветной пилюлей в таблице, подсвечивает строку слева и меняется в один клик — прямо из отчёта по тесту или из карточки кандидата. По этапам можно фильтровать список и строить воронку найма на дашборде. Тексты писем, которые получают кандидаты (приглашение на тест), полностью редактируются в разделе «Настройки → Шаблоны писем» отдельно для каждого языка.'],
    ['Статистика по кандидатам на вакансию', 'Рядом с вкладками вакансий есть иконка «Статистика вакансий» (значок графика). Она открывает таблицу с разбивкой по каждой вакансии: сколько всего кандидатов, сколько тестов пройдено и сколько ещё в ожидании. Более полная аналитика — на «Дашборде»: KPI (кандидаты, пройденные и ожидающие тесты, конверсия в найм), воронка найма, распределение по этапам, тесты по типам, приток новых кандидатов за 14 дней и топ вакансий по числу откликов.'],
    ['На чём основана система?', 'В основе — две проверенные методики. Оценка продуктивности построена на подходе Performia (типология сотрудников по реальным прошлым результатам), а оценка личности — на Оксфордском анализе личности (OCA/Exec-U-Test), который измеряет 10 черт характера. Продуктивность — главный фактор найма: её нельзя «дать» обучением, поэтому непродуктивный кандидат не интересен ни при каких обстоятельствах. Личность же оценивает не «хороший/плохой», а риск на конкретной должности и то, как этим человеком эффективнее управлять.'],
    ['Что такое продуктивность', 'Продуктивность — это способность человека производить ценный конечный продукт своей должности и доводить дела до результата, а не имитировать деятельность. По типологии выделяют три типа: Виннер (сам видит проблему, находит и внедряет решение без давления), Дуер (исполнитель — сделает, если подсказать и проконтролировать) и Вейтер (ждущий — тянет и останавливается при первом препятствии). Продуктивность врождённа и практически не меняется, поэтому прошлые измеримые результаты человека надёжно предсказывают будущие — именно это и оценивает тест «Резалт».'],
    ['На чём основаны тесты «Резалт» / «Тулс» / «Сэйлс»?', '«Резалт» — сценарный тест из открытых вопросов о реальных прошлых достижениях; ключевые вопросы про продукт должности и измеримые результаты выявляют тип сотрудника. «Тулс» — классический Оксфордский анализ личности: 200 вопросов дают график из 10 точек A–J с зонами, синдромами (сочетаниями точек) и «плавающими» точками. «Сэйлс» оценивает 12 показателей продавца по трём блокам — внутренние качества, эффективность и отношения с клиентами. Все интерпретации, пороги зон (±32/±68) и синдромы соответствуют исходной методике.'],
    ['Достоверность результатов тестов', 'Достоверность обеспечивается несколькими механизмами. В «Тулсе» на каждую из 10 точек приходится по 20 вопросов, так что случайные ответы усредняются; отдельная точка D (Уверенность) служит индикатором надёжности всего результата, а встроенный детектор «случайного графика» отсекает тех, кто отвечал наугад. Слишком большое число ответов «Может быть» (более 50) отмечается как искажающее портрет. В «Резалте» открытые вопросы не дают спрятаться за заученными формулировками. Итог теста — это оценка риска и «инструкция по эксплуатации» сотрудника, а финальное решение всегда остаётся за рекрутёром.'],
    ['Как формируется цена?', 'Вы платите не за подписку, а за пройденные тесты: один тест — один кандидат. Баланс тестов пополняется пакетами, и чем больше пакет, тем ниже цена за один тест. Остаток баланса не сгорает и переносится на будущее. Забронированный, но не пройденный тест возвращается на баланс, если удалить отправку. Актуальные пакеты и цены — на странице «Баланс».'],
    ['Чем вы выделяетесь среди конкурентов?', 'Мы оцениваем не «красоту резюме», а реальную продуктивность и характер кандидата на одном графике, экономя рекрутёру десятки часов. Готовый отчёт содержит не только цифры, но и интерпретацию, синдромы и подсказку ИИ с вердиктом — рекрутёру не нужно быть психологом. Плюс единый инструмент закрывает весь цикл: сбор откликов через публичные анкеты, автоматическое назначение тестов, воронка найма и аналитика на дашборде.'],
    ['Планируется ли вводить новые тесты?', 'Текущего набора (Резалт, Тулс, Логис, Сэйлс) достаточно для большинства задач найма. Мы развиваем систему и добавляем инструменты; при необходимости возможна интеграция кастомных тестов под ваши задачи, в том числе с автоматической интерпретацией ответов через ИИ. Если у вас есть пожелание по конкретному тесту — сообщите вашему менеджеру.'],
  ] },
  { cat: 'Технические вопросы', items: [
    ['Настройки личного кабинета', 'Все настройки собраны в разделе «Настройки» и разбиты по вкладкам: «Профиль» (email, имя, компания, логотип), «Параметры» (часовой пояс, язык интерфейса), «Уведомления» (SMS-дубли, e-mail при комментарии, приватность), «Шаблоны писем» (тексты для кандидатов по языкам) и «Безопасность» (смена пароля). Изменения сохраняются кнопкой на каждой вкладке.'],
    ['Как импортировать свою базу кандидатов на вакансию?', 'Самый быстрый способ добавить кандидатов — отправить им тесты: укажите несколько email или телефонов через запятую в поле отправки, и по каждому автоматически создастся карточка кандидата в выбранной вакансии. Также кандидаты попадают в вакансию сами, когда откликаются через публичную анкету. Экспорт текущей базы доступен кнопкой «Экспорт CSV» над таблицей.'],
    ['Как поменять email для входа?', 'Email входа привязан к аккаунту. Сменить имя, компанию, телефон и остальные данные можно в «Настройках → Профиль». Для смены самого адреса входа обратитесь к вашему менеджеру — это делается на стороне поддержки, чтобы защитить аккаунт.'],
    ['Как поменять или восстановить пароль?', 'Откройте «Настройки → Безопасность», введите текущий пароль и дважды новый (минимум 6 символов) — и сохраните. Если пароль забыт и войти не получается, воспользуйтесь восстановлением на странице входа или напишите вашему менеджеру.'],
    ['Как включить уведомления в браузере?', 'Уведомления настраиваются во вкладке «Настройки → Уведомления»: можно включить дублирование ссылок кандидату по SMS и e-mail-оповещения (например, при добавлении комментария). Всплывающие уведомления браузера разрешаются в настройках самого браузера для этого сайта.'],
    ['Что делать, если несколько HR-менеджеров работают с сервисом?', 'Разделяйте работу по разделам и вакансиям: каждый менеджер ведёт свои вакансии, а кандидаты не теряются благодаря общему поиску и фильтрам. В настройках можно включить опцию «Искать соискателей во всех аккаунтах компании», чтобы видеть кандидатов коллег и не дублировать отправку тестов одному и тому же человеку.'],
    ['Как настроить тексты писем? Можно ли их менять полностью?', 'Да, тексты писем меняются полностью. Откройте «Настройки → Шаблоны писем»: для каждого языка (русский, украинский, польский, английский) редактируется тема и тело письма во встроенном редакторе — можно менять шрифт, форматирование, добавлять картинки и даже править исходный HTML. Используйте плейсхолдеры {candidate}, {company}, {vacancy}, {test}, {link} — они автоматически подставятся в письмо. Язык письма для конкретного кандидата задаётся у его вакансии.'],
    ['Как переносить отклики между вакансиями?', 'Откройте карточку кандидата (клик по строке в списке) и в поле «Вакансия» выберите другую вакансию — кандидат вместе со всеми его тестами перенесётся туда. Так удобно перераспределять отклики, если человек лучше подходит на другую позицию.'],
    ['Как отправить тест кандидату, если почты нет?', 'Есть два способа. Первый: в поле отправки укажите номер телефона вместо email — тест уйдёт по SMS (текст SMS настраивается в «Шаблонах писем»). Второй: после отправки система показывает прямую ссылку на прохождение — скопируйте её кнопкой и передайте кандидату любым мессенджером.'],
  ] },
  { cat: 'Функционал системы', items: [
    ['Создание разделов и вакансий', 'Структура двухуровневая: разделы → вакансии. Раздел (например, «Продажи» или «Офис») создаётся кнопкой «+ Добавить» в верхней панели над вакансиями и группирует вакансии по отделам. Вакансия добавляется кнопкой «+ Вакансия»: укажите точное название (оно попадает в письмо кандидату), выберите раздел и язык отправляемых писем. Переключение раздела фильтрует список вакансий, а фильтры и статистика работают в разрезе выбранной вакансии.'],
    ['Как добавить свои вопросы к тестам?', 'Стандартные тесты (Резалт, Тулс, Логис, Сэйлс) имеют выверенную методику, поэтому их вопросы менять нельзя без потери достоверности интерпретации. Если вам нужен собственный опросник или тест с кастомной логикой оценки — обратитесь к менеджеру: возможна разработка отдельного теста, в том числе с интерпретацией ответов через ИИ.'],
  ] },
  { cat: 'Вопросы по тестам', items: [
    ['Какой тест основной, на что опираться?', 'Основной и первый — «Резалт» (продуктивность): именно он отсеивает непродуктивных кандидатов, и опираться при найме нужно прежде всего на него. Затем «Тулс» (личность) — не для отсева, а для оценки риска и понимания, как управлять сотрудником. «Логис» (интеллект) добавляют для руководящих должностей, «Сэйлс» — для менеджеров по продажам. Правило: берём по продуктивности, риск оцениваем по личным качествам.'],
    ['Тест «Резалт»', 'Сценарный performance-тест из открытых вопросов о реальных результатах кандидата на прошлой работе. По ответам определяется тип сотрудника — Виннер, Дуер или Вейтер. Ключевые вопросы: №5 (как кандидат описывает продукт своей должности) и №7 (какие измеримые результаты он приводил). Виннеры чётко называют продукт и делятся цифрами; Вейтеры не понимают, что от них хотят, и не измеряют свою работу. Это первый фильтр найма.'],
    ['Тест «Тулс»', 'Оксфордский анализ личности: 200 вопросов формируют график из 10 точек A–J. Точки сгруппированы по трём блокам — «Быть» (A, B, C — внутреннее наполнение), «Делать» (E, F, G — эффективность) и «Иметь» (H, I, J — отношения), при этом точка D (Уверенность) выделена отдельно как индикатор достоверности. Отчёт показывает зоны (пороги ±32/±68), синдромы (сочетания точек), компульсивные точки и «плавающие» точки-молнии на B и E. Тест отвечает на вопрос, как характер поможет или помешает на конкретной должности.'],
    ['Тест «Сэйлс»', 'Тест для оценки менеджеров по продажам: 12 показателей, сгруппированных в три блока — внутренние качества (организованность, стрессоустойчивость, экспертность, преданность), эффективность (деловая хватка, результативность, настойчивость, перфекционизм) и отношения с клиентами (самоотдача, командная игра, привлечение, удержание). Результат — профиль продавца на графике 0–100 с интерпретацией по каждому показателю, показывающий, к какому типу продаж кандидат предрасположен.'],
    ['Тест «Логис»', 'Тест на интеллект (IQ) — до 80 вопросов, около 30 минут. Особенно важен для руководителей и ключевых должностей, где нужно быстро и безошибочно принимать решения. Результат — числовой коэффициент IQ и уровень (очень низкий → очень высокий) с расшифровкой и рекомендацией, подходит ли кандидат для задач, требующих аналитического мышления. IQ — только часть картины: оценивайте его вместе с продуктивностью и характером.'],
    ['Видеоинтервью', 'Видеоинтервью позволяет заранее задать список вопросов, ограничить время на обдумывание и длительность ответа, чтобы оценить реальные компетенции кандидата, а не его умение искать ответы. В текущей версии портала функция ещё не подключена — следите за обновлениями или уточните доступность у менеджера.'],
  ] },
  { cat: 'Оплата и тарифы', items: [
    ['Способы оплаты', 'Баланс тестов пополняется банковской картой через защищённую оплату Stripe. На странице «Баланс» выберите подходящий пакет — оплата проходит мгновенно, и тесты сразу зачисляются на счёт. Для юридических лиц возможна оплата по счёту — уточните у менеджера.'],
    ['Какой тариф выбрать?', 'Ориентируйтесь на объём найма. Чем больше пакет тестов, тем ниже стоимость одного теста, поэтому при регулярном подборе выгоднее брать пакеты покрупнее — остаток не сгорает. Для разовой задачи или знакомства с сервисом подойдёт минимальный пакет. Один тест — это один отправленный кандидату тест.'],
    ['Предоставление закрывающих документов', 'Закрывающие документы для бухгалтерии (акты, счета) предоставляются по запросу. Оставьте заявку вашему менеджеру с реквизитами компании — и мы подготовим необходимые документы по оплаченным пакетам.'],
    ['Договор оферты', 'Использование сервиса регулируется публичным договором-офертой. Совершая оплату, вы соглашаетесь с его условиями. Полный текст оферты доступен по запросу у менеджера или на странице оплаты.'],
  ] },
];
function renderFAQ() {
  const src = (LANG === 'pl' && typeof FAQ_PL !== 'undefined') ? FAQ_PL : ((LANG === 'en' && typeof FAQ_EN !== 'undefined') ? FAQ_EN : FAQ);
  const cats = src.map((c, ci) => `<section class="faq-cat" id="faq-cat-${ci}"><h2>${esc(c.cat)}</h2>${c.items.map((it, ii) => `<div class="faq-q" data-q="${esc((c.cat + ' ' + it[0] + ' ' + it[1]).toLowerCase())}"><button class="faq-head"><span>${esc(it[0])}</span><i class="faq-plus">${_svg('<line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/>')}</i></button><div class="faq-body"><p>${esc(it[1])}</p></div></div>`).join('')}</section>`).join('');
  const nav = src.map((c, ci) => `<button class="faq-navi" data-goto="${ci}">${esc(c.cat)}</button>`).join('');
  $('#main').innerHTML = `<div class="eyebrow reveal">${t('faq_help')}</div><h1 class="page-h reveal d1" style="margin-top:10px">${t('faq_title')}</h1>
    <div class="faq-layout reveal d2">
      <aside class="faq-side">
        <div class="search-wrap"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="faq-search" placeholder="${t('faq_search')}"></div>
        <button class="btn soft sm" style="width:100%;margin-bottom:12px" onclick="startPortalTour()">${_svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2" stroke-linecap="round"/>')} ${tt('relaunch')}</button>
        <nav class="faq-nav">${nav}</nav>
      </aside>
      <div class="faq-main" id="faq-main">${cats}</div>
    </div>`;
  $$('.faq-head').forEach(h => h.onclick = () => h.parentElement.classList.toggle('open'));
  $$('.faq-navi').forEach(b => b.onclick = () => { const el = document.getElementById('faq-cat-' + b.dataset.goto); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#faq-search').oninput = e => { const q = e.target.value.toLowerCase().trim(); $$('.faq-q').forEach(x => x.classList.toggle('hidden', q && !x.dataset.q.includes(q))); $$('.faq-cat').forEach(s => s.classList.toggle('hidden', !s.querySelector('.faq-q:not(.hidden)'))); };
}

// ================= INSTRUCT =================
function renderInstruct() {
  $('#main').innerHTML = `<div class="eyebrow reveal">Руководство</div><h1 class="page-h reveal d1" style="margin-top:10px">Инструкция</h1>
    <div class="card reveal d2 instruct">
      <h2>Добро пожаловать в HR PRO AI — систему онлайн-оценки персонала</h2>
      <p>Для подбора продуктивных сотрудников используйте связку тестов <b>«Резалт»</b> и <b>«Тулс»</b>: они оценивают продуктивность и личные качества кандидата.</p>
      <p>Вместо чтения резюме сразу отправляйте соискателю performance-тест <b>«Резалт»</b>. Для нас важнее понять, какого реального измеримого результата человек достигает, а не то, как он умеет писать резюме.</p>
      <p>Получив и правильно оценив «Резалт», отправьте <b>«Тулс»</b> — он покажет личностные качества, которыми кандидат пользуется, добиваясь результата, и поможет собрать гармоничную команду.</p>
      <p>Для менеджеров по продажам используйте <b>«Сэйлс»</b>, для руководителей — <b>«Логис»</b> (интеллект и способность принимать решения).</p>
      <div class="callout ok"><div class="co-t">Главное правило</div>Берём по продуктивности, а по личным качествам оцениваем риск, а не отсеиваем эффективных. Пусть в истории вашей компании будут только подходящие сотрудники.</div>
      <h2 style="margin-top:26px">Скрипт звонка перед первым тестом («Резалт»)</h2>
      <p class="muted" style="margin-bottom:8px">Голос должен быть приятным и располагающим.</p>
      <div class="synd"><b>Пример</b>Добрый день, [Имя]! Меня зовут [ … ], я HR-менеджер компании [ … ]. Вам удобно сейчас разговаривать? — Да. — Вы откликнулись на нашу вакансию [ … ], ваше резюме нам интересно. Перед собеседованием есть два небольших этапа — анкета и тест. Прошу пройти их сегодня, чтобы завтра назначить встречу с руководителем. Первый тест уже на вашей почте; если не пришёл — перезвоните мне, я продублирую. Договорились? — Да. — Спасибо за отклик, ждём ваш ответ.</div>
      <h2 style="margin-top:22px">Скрипт звонка перед вторым тестом («Тулс»)</h2>
      <div class="synd"><b>Пример</b>Добрый день, [Имя]! Это [ … ], HR-менеджер компании [ … ]. Мы получили вашу анкету по вакансии [ … ], результаты нас впечатлили, и мы отправили заключительный тест — он уже ждёт вас в почте. Ждём ваш ответ.</div>
      <div class="callout"><div class="co-t">Материалы</div>Подробные методики чтения тестов «Резалт», «Тулс», «Сэйлс» и «Логис» — в разделе <a href="#" onclick="setView('education');return false">Обучение</a>.</div>
    </div>`;
}

// ============ КАЛЕНДАРЬ СОБЕСЕДОВАНИЙ ============
const CAL_STAGE = {
  screen: { key: 'screen', color: '#6f97ff' },
  tests:  { key: 'tests',  color: '#8b6cff' },
  intv:   { key: 'intv',   color: '#ff7a5c' },
  final:  { key: 'final',  color: '#43e0a0' },
};
const CI18N = {
  ru: { title: 'Календарь собеседований', eyebrow: 'Планирование собеседований', neww: 'Новое собеседование', today: 'Сегодня',
    s_screen: 'Скрининг', s_tests: 'Тесты', s_intv: 'Интервью', s_final: 'Финал',
    upcoming: 'Ближайшие собеседования', none_up: 'Пока нет запланированных собеседований.',
    m_new_tag: 'Новое собеседование', m_edit_tag: 'Редактирование', m_new_title: 'Запланировать собеседование', m_edit_title: 'Изменить собеседование',
    f_candidate: 'Кандидат', f_candidate_ph: 'Имя и фамилия кандидата', f_link: 'Связать с кандидатом из базы', f_link_none: 'Не связывать',
    f_role: 'Должность', f_role_ph: 'Например: Менеджер по продажам', f_stage: 'Этап', f_date: 'Дата', f_time: 'Время',
    f_format: 'Формат', fmt_video: 'Видеозвонок', fmt_office: 'В офисе', fmt_phone: 'Телефон',
    f_interviewer: 'Интервьюер', f_interviewer_ph: 'Кто проводит', f_note: 'Заметка', f_note_opt: '(ссылка на встречу, комментарий)',
    save_new: 'Запланировать', save_edit: 'Сохранить', cancel: 'Отмена', del: 'Удалить',
    sync: 'Добавить в календарь', sync_g: 'Google', sync_a: 'Apple / iPhone', sync_o: 'Outlook',
    need: 'Укажите кандидата и дату', saved: 'Сохранено', deleted: 'Удалено', del_confirm: 'Удалить это собеседование?', more: 'ещё' },
  pl: { title: 'Kalendarz rozmów', eyebrow: 'Planowanie rozmów', neww: 'Nowa rozmowa', today: 'Dziś',
    s_screen: 'Screening', s_tests: 'Testy', s_intv: 'Rozmowa', s_final: 'Finał',
    upcoming: 'Najbliższe rozmowy', none_up: 'Brak zaplanowanych rozmów.',
    m_new_tag: 'Nowa rozmowa', m_edit_tag: 'Edycja', m_new_title: 'Zaplanuj rozmowę', m_edit_title: 'Edytuj rozmowę',
    f_candidate: 'Kandydat', f_candidate_ph: 'Imię i nazwisko', f_link: 'Powiąż z kandydatem z bazy', f_link_none: 'Nie wiązać',
    f_role: 'Stanowisko', f_role_ph: 'Np. Menedżer sprzedaży', f_stage: 'Etap', f_date: 'Data', f_time: 'Godzina',
    f_format: 'Format', fmt_video: 'Wideorozmowa', fmt_office: 'W biurze', fmt_phone: 'Telefon',
    f_interviewer: 'Prowadzący', f_interviewer_ph: 'Kto prowadzi', f_note: 'Notatka', f_note_opt: '(link do spotkania, komentarz)',
    save_new: 'Zaplanuj', save_edit: 'Zapisz', cancel: 'Anuluj', del: 'Usuń',
    sync: 'Dodaj do kalendarza', sync_g: 'Google', sync_a: 'Apple / iPhone', sync_o: 'Outlook',
    need: 'Podaj kandydata i datę', saved: 'Zapisano', deleted: 'Usunięto', del_confirm: 'Usunąć tę rozmowę?', more: 'więcej' },
  en: { title: 'Interview calendar', eyebrow: 'Interview scheduling', neww: 'New interview', today: 'Today',
    s_screen: 'Screening', s_tests: 'Tests', s_intv: 'Interview', s_final: 'Final',
    upcoming: 'Upcoming interviews', none_up: 'No interviews scheduled yet.',
    m_new_tag: 'New interview', m_edit_tag: 'Editing', m_new_title: 'Schedule an interview', m_edit_title: 'Edit interview',
    f_candidate: 'Candidate', f_candidate_ph: 'Candidate full name', f_link: 'Link to a candidate', f_link_none: "Don't link",
    f_role: 'Position', f_role_ph: 'e.g. Sales manager', f_stage: 'Stage', f_date: 'Date', f_time: 'Time',
    f_format: 'Format', fmt_video: 'Video call', fmt_office: 'In office', fmt_phone: 'Phone',
    f_interviewer: 'Interviewer', f_interviewer_ph: 'Who runs it', f_note: 'Note', f_note_opt: '(meeting link, comment)',
    save_new: 'Schedule', save_edit: 'Save', cancel: 'Cancel', del: 'Delete',
    sync: 'Add to calendar', sync_g: 'Google', sync_a: 'Apple / iPhone', sync_o: 'Outlook',
    need: 'Enter candidate and date', saved: 'Saved', deleted: 'Deleted', del_confirm: 'Delete this interview?', more: 'more' },
};
function ct(k) { return (CI18N[LANG] || CI18N.ru)[k] || CI18N.ru[k] || k; }
function cStageLabel(k) { return ct('s_' + k); }
let calState = { y: null, m: null, events: [], cands: [] };
async function renderCalendar() {
  if (calState.y === null) { const n = new Date(); calState.y = n.getFullYear(); calState.m = n.getMonth(); }
  try { calState.events = (await api('/api/calendar')).events || []; } catch (e) { calState.events = []; }
  try { if (!calState.cands.length) calState.cands = (await api('/api/candidates?lang=' + LANG)).candidates || []; } catch (e) {}
  drawCalendar();
}
function calPad(n) { return String(n).padStart(2, '0'); }
function calIso(y, m, d) { return y + '-' + calPad(m + 1) + '-' + calPad(d); }
function calHexA(hex, a) { const h = hex.replace('#', ''); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')'; }
function drawCalendar() {
  const S = calState;
  const monNom = { ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] }[LANG] || null;
  const monShort = { ru: ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'], pl: ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'], en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] }[LANG] || ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monName = monNom ? monNom[S.m] : new Date(S.y, S.m, 1).toLocaleString('en', { month: 'long' });
  const wd = { ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }[LANG] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date(); const todayIso = calIso(now.getFullYear(), now.getMonth(), now.getDate());
  const byDate = {}; S.events.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  Object.values(byDate).forEach(a => a.sort((x, y) => x.time.localeCompare(y.time)));
  const first = new Date(S.y, S.m, 1); let sd = first.getDay(); sd = sd === 0 ? 6 : sd - 1;
  const dim = new Date(S.y, S.m + 1, 0).getDate(); const dip = new Date(S.y, S.m, 0).getDate();
  const total = Math.ceil((sd + dim) / 7) * 7; let cells = '';
  for (let i = 0; i < total; i++) {
    let dn, mm = S.m, yy = S.y, inM = true;
    if (i < sd) { dn = dip - sd + 1 + i; mm = S.m - 1; inM = false; if (mm < 0) { mm = 11; yy--; } }
    else if (i >= sd + dim) { dn = i - sd - dim + 1; mm = S.m + 1; inM = false; if (mm > 11) { mm = 0; yy++; } }
    else dn = i - sd + 1;
    const iso = calIso(yy, mm, dn); const isToday = iso === todayIso; const dow = i % 7;
    const evs = byDate[iso] || []; const shown = evs.slice(0, 3);
    const evHtml = shown.map(ev => { const st = CAL_STAGE[ev.stage] || CAL_STAGE.intv;
      return '<div class="cal-evt" data-caledit="' + ev.id + '" style="background:' + calHexA(st.color, .12) + ';border-left:2px solid ' + st.color + '">' +
        '<div class="cal-evt-top"><span class="cal-evt-t" style="color:' + st.color + '">' + esc(ev.time) + '</span><span class="cal-evt-st">' + esc(cStageLabel(ev.stage)) + '</span></div>' +
        '<div class="cal-evt-c">' + esc(ev.candidate) + '</div>' + (ev.role ? '<div class="cal-evt-r">' + esc(ev.role) + '</div>' : '') + '</div>'; }).join('');
    const more = evs.length > 3 ? '<span class="cal-more">+' + (evs.length - 3) + ' ' + ct('more') + '</span>' : '';
    cells += '<div class="cal-cell ' + (inM ? '' : 'out') + ' ' + (isToday ? 'today' : '') + ' ' + (dow >= 5 ? 'we' : '') + '" data-caladd="' + iso + '">' +
      '<div class="cal-cell-h"><span class="cal-num">' + dn + '</span><span class="cal-add">' + _svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>') + '</span></div>' +
      '<div class="cal-evts">' + evHtml + more + '</div></div>';
  }
  const legend = Object.values(CAL_STAGE).map(st => '<span class="cal-leg"><i style="background:' + st.color + ';box-shadow:0 0 8px ' + calHexA(st.color, .6) + '"></i>' + cStageLabel(st.key) + '</span>').join('');
  const up = [...S.events].filter(e => e.date >= todayIso).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6);
  const upHtml = up.length ? up.map(ev => { const st = CAL_STAGE[ev.stage] || CAL_STAGE.intv; const parts = ev.date.split('-').map(Number); const d = parts[2], m = parts[1];
    return '<div class="cal-up" data-caledit="' + ev.id + '" style="border-left:3px solid ' + st.color + '">' +
      '<div class="cal-up-d"><b>' + d + '</b><span>' + monShort[m - 1] + '</span></div><div class="cal-up-sep"></div>' +
      '<div class="cal-up-main"><div class="cal-up-c">' + esc(ev.candidate) + '</div><div class="cal-up-r">' + esc(ev.role || '') + '</div>' +
      '<div class="cal-up-b"><span class="cal-up-t">' + esc(ev.time) + '</span><span class="cal-tag" style="color:' + st.color + ';background:' + calHexA(st.color, .12) + ';border-color:' + calHexA(st.color, .3) + '">' + esc(cStageLabel(ev.stage)) + '</span></div></div></div>'; }).join('')
    : '<p class="muted" style="grid-column:1/-1">' + ct('none_up') + '</p>';
  $('#main').innerHTML =
    '<div class="cal-wrap reveal">' +
      '<div class="cal-head">' +
        '<div><div class="eyebrow">' + ct('eyebrow') + '</div><h1 style="margin:10px 0 0">' + ct('title') + '</h1></div>' +
        '<button class="btn" id="cal-new">' + _svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>') + ' ' + ct('neww') + '</button>' +
      '</div>' +
      '<div class="cal-toolbar">' +
        '<div class="cal-nav">' +
          '<button class="btn ghost ic-btn" id="cal-prev" aria-label="prev">' + _svg('<path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>') + '</button>' +
          '<div class="cal-month">' + esc(monName) + ' ' + S.y + '</div>' +
          '<button class="btn ghost ic-btn" id="cal-next" aria-label="next">' + _svg('<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>') + '</button>' +
          '<button class="btn ghost xs" id="cal-today">' + ct('today') + '</button>' +
        '</div>' +
        '<div class="cal-legend">' + legend + '</div>' +
      '</div>' +
      '<div class="cal-grid-card">' +
        '<div class="cal-weekdays">' + wd.map((n, i) => '<div class="' + (i >= 5 ? 'we' : '') + '">' + n + '</div>').join('') + '</div>' +
        '<div class="cal-grid">' + cells + '</div>' +
      '</div>' +
      '<div class="cal-up-sec"><div class="eyebrow">' + ct('upcoming') + '</div><div class="cal-up-grid">' + upHtml + '</div></div>' +
    '</div>';
  $('#cal-new').onclick = () => openCalModal(null, calIso(S.y, S.m, Math.min(now.getDate(), dim)));
  $('#cal-prev').onclick = () => { S.m--; if (S.m < 0) { S.m = 11; S.y--; } drawCalendar(); };
  $('#cal-next').onclick = () => { S.m++; if (S.m > 11) { S.m = 0; S.y++; } drawCalendar(); };
  $('#cal-today').onclick = () => { S.y = now.getFullYear(); S.m = now.getMonth(); drawCalendar(); };
  $$('[data-caladd]').forEach(c => c.onclick = () => openCalModal(null, c.dataset.caladd));
  $$('[data-caledit]').forEach(el => el.onclick = e => { e.stopPropagation(); const ev = S.events.find(x => x.id === el.dataset.caledit); if (ev) openCalModal(ev); });
}
function calBlank(date) { return { candidate: '', role: '', stage: 'intv', date: date || '', time: '10:00', format: ct('fmt_video'), interviewer: '', note: '', participantId: null }; }
function openCalModal(ev, dateIso) {
  const isEdit = !!ev; const f = ev ? Object.assign({}, ev) : calBlank(dateIso);
  const stageBtns = Object.values(CAL_STAGE).map(st => '<button type="button" class="cal-stage ' + (f.stage === st.key ? 'on' : '') + '" data-calstage="' + st.key + '" style="' + (f.stage === st.key ? 'background:' + calHexA(st.color, .14) + ';border-color:' + calHexA(st.color, .5) : '') + '"><i style="background:' + st.color + '"></i>' + cStageLabel(st.key) + '</button>').join('');
  const candOpts = '<option value="">' + ct('f_link_none') + '</option>' + calState.cands.map(c => '<option value="' + c.id + '" ' + (f.participantId === c.id ? 'selected' : '') + '>' + esc(c.name) + (c.vacancyName ? ' · ' + esc(c.vacancyName) : '') + '</option>').join('');
  const fmt = v => '<option ' + (f.format === v ? 'selected' : '') + '>' + v + '</option>';
  const sync = isEdit ? '<div class="cal-sync"><span class="cal-sync-l">' + ct('sync') + ':</span>' +
      '<a class="btn ghost xs" target="_blank" id="cal-sync-g">' + ct('sync_g') + '</a>' +
      '<button class="btn ghost xs" id="cal-sync-a">' + ct('sync_a') + '</button>' +
      '<a class="btn ghost xs" target="_blank" id="cal-sync-o">' + ct('sync_o') + '</a></div>' : '';
  mkDecodeModal('<div class="cal-modal">' +
    '<div class="cal-m-head"><div><div class="db-note" style="margin:0 0 4px;text-transform:uppercase;letter-spacing:.12em;font-size:10px;color:#b3a4ff">' + (isEdit ? ct('m_edit_tag') : ct('m_new_tag')) + '</div>' +
      '<h2 class="db-h" style="margin:0">' + (isEdit ? ct('m_edit_title') : ct('m_new_title')) + '</h2></div></div>' +
    '<label class="db-lb">' + ct('f_candidate') + '</label><input class="field" id="cf-candidate" value="' + esc(f.candidate) + '" placeholder="' + ct('f_candidate_ph') + '">' +
    '<label class="db-lb">' + ct('f_link') + '</label><select class="field" id="cf-link">' + candOpts + '</select>' +
    '<label class="db-lb">' + ct('f_role') + '</label><input class="field" id="cf-role" value="' + esc(f.role) + '" placeholder="' + ct('f_role_ph') + '">' +
    '<label class="db-lb">' + ct('f_stage') + '</label><div class="cal-stages" id="cf-stages">' + stageBtns + '</div>' +
    '<div class="row" style="gap:12px">' +
      '<div style="flex:1"><label class="db-lb">' + ct('f_date') + '</label><input class="field" id="cf-date" type="date" value="' + esc(f.date) + '"></div>' +
      '<div style="flex:1"><label class="db-lb">' + ct('f_time') + '</label><input class="field" id="cf-time" type="time" value="' + esc(f.time) + '"></div>' +
    '</div>' +
    '<div class="row" style="gap:12px">' +
      '<div style="flex:1"><label class="db-lb">' + ct('f_format') + '</label><select class="field" id="cf-format">' + fmt(ct('fmt_video')) + fmt(ct('fmt_office')) + fmt(ct('fmt_phone')) + '</select></div>' +
      '<div style="flex:1"><label class="db-lb">' + ct('f_interviewer') + '</label><input class="field" id="cf-interviewer" value="' + esc(f.interviewer) + '" placeholder="' + ct('f_interviewer_ph') + '"></div>' +
    '</div>' +
    '<label class="db-lb">' + ct('f_note') + ' <span style="color:#5f6885;font-weight:400">' + ct('f_note_opt') + '</span></label><input class="field" id="cf-note" value="' + esc(f.note) + '">' +
    sync +
    '<div class="db-modal-foot">' +
      (isEdit ? '<button class="btn ghost danger xs ic-btn" id="cf-del" title="' + ct('del') + '">' + ICON_TRASH + '</button>' : '') +
      '<button class="btn ghost" onclick="closeDecodeModal()">' + ct('cancel') + '</button>' +
      '<button class="btn" id="cf-save">' + (isEdit ? ct('save_edit') : ct('save_new')) + '</button>' +
    '</div></div>', true);
  let stage = f.stage;
  $$('#cf-stages .cal-stage').forEach(b => b.onclick = () => { stage = b.dataset.calstage; $$('#cf-stages .cal-stage').forEach(x => { x.classList.remove('on'); x.removeAttribute('style'); }); const st = CAL_STAGE[stage]; b.classList.add('on'); b.style.background = calHexA(st.color, .14); b.style.borderColor = calHexA(st.color, .5); });
  $('#cf-link').onchange = e => { const c = calState.cands.find(x => x.id === e.target.value); if (c) { $('#cf-candidate').value = c.name; if (c.vacancyName && !$('#cf-role').value) $('#cf-role').value = c.vacancyName; } };
  const collect = () => ({ candidate: $('#cf-candidate').value.trim(), role: $('#cf-role').value.trim(), stage: stage, date: $('#cf-date').value, time: $('#cf-time').value || '10:00', format: $('#cf-format').value, interviewer: $('#cf-interviewer').value.trim(), note: $('#cf-note').value.trim(), participantId: $('#cf-link').value || null });
  if (isEdit) {
    const upd = () => { const ev2 = Object.assign({}, f, collect()); $('#cal-sync-g').href = googleCalLink(ev2); $('#cal-sync-o').href = outlookLink(ev2); };
    upd(); ['cf-candidate', 'cf-role', 'cf-date', 'cf-time', 'cf-format', 'cf-interviewer', 'cf-note'].forEach(id => { const el = $('#' + id); if (el) el.oninput = upd; });
    $('#cal-sync-a').onclick = () => downloadIcs(Object.assign({}, f, collect()));
    $('#cf-del').onclick = async () => { if (!confirm(ct('del_confirm'))) return; await api('/api/calendar/' + f.id, { method: 'DELETE' }); closeDecodeModal(); toast(ct('deleted')); renderCalendar(); };
  }
  $('#cf-save').onclick = async () => {
    const d = collect(); if (!d.candidate || !d.date) return toast(ct('need'));
    try { if (isEdit) await api('/api/calendar/' + f.id, { method: 'PUT', body: JSON.stringify(d) }); else await api('/api/calendar', { method: 'POST', body: JSON.stringify(d) });
      closeDecodeModal(); toast(ct('saved')); renderCalendar(); } catch (e) { toast(e.message); }
  };
}
function calDates(ev) { const p = ev.date.split('-').map(Number); const tm = (ev.time || '10:00').split(':').map(Number);
  const start = new Date(p[0], p[1] - 1, p[2], tm[0] || 0, tm[1] || 0); const end = new Date(start.getTime() + 60 * 60000); return { start: start, end: end }; }
function calZ(dt) { return dt.getUTCFullYear() + calPad(dt.getUTCMonth() + 1) + calPad(dt.getUTCDate()) + 'T' + calPad(dt.getUTCHours()) + calPad(dt.getUTCMinutes()) + '00Z'; }
function calTitle(ev) { return (LANG === 'pl' ? 'Rozmowa: ' : LANG === 'en' ? 'Interview: ' : 'Собеседование: ') + ev.candidate + (ev.role ? ' — ' + ev.role : ''); }
function calDetails(ev) { return [ev.role, ev.interviewer ? (LANG === 'en' ? 'Interviewer: ' : 'Интервьюер: ') + ev.interviewer : '', ev.format, ev.note].filter(Boolean).join('\n'); }
function googleCalLink(ev) { const dd = calDates(ev);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(calTitle(ev)) + '&dates=' + calZ(dd.start) + '/' + calZ(dd.end) + '&details=' + encodeURIComponent(calDetails(ev)) + '&location=' + encodeURIComponent(ev.format || ''); }
function outlookLink(ev) { const dd = calDates(ev);
  return 'https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=' + encodeURIComponent(calTitle(ev)) + '&startdt=' + dd.start.toISOString() + '&enddt=' + dd.end.toISOString() + '&body=' + encodeURIComponent(calDetails(ev)) + '&location=' + encodeURIComponent(ev.format || ''); }
function downloadIcs(ev) { const dd = calDates(ev);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HR PRO AI//Calendar//RU', 'BEGIN:VEVENT', 'UID:' + (ev.id || Date.now()) + '@hr-pro.ai', 'DTSTAMP:' + calZ(new Date()), 'DTSTART:' + calZ(dd.start), 'DTEND:' + calZ(dd.end), 'SUMMARY:' + calTitle(ev).replace(/[,;]/g, ' '), 'DESCRIPTION:' + calDetails(ev).replace(/\n/g, '\\n').replace(/[,;]/g, ' '), 'LOCATION:' + (ev.format || ''), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' }); const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'interview-' + (ev.candidate || 'event').replace(/\s+/g, '-') + '.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

// ============ ТУР ПО ПОРТАЛУ (онбординг новых пользователей) ============
const TOURI18N = {
  ru: { w_title: 'Добро пожаловать на портал!', w_body: 'Покажем за минуту, где что находится и как отправить первому кандидату тест. Всего 6 коротких подсказок.', w_skip: 'Не сейчас', w_start: 'Начать тур',
    skip: 'Пропустить тур', back: 'Назад', next: 'Далее', finish: 'Завершить',
    f_title: 'Готово — теперь ваша очередь', f_body: 'Вы знаете, где что находится. Пригласите первого кандидата — и посмотрите, как ИИ раскроет его профиль.', f_replay: 'Пройти заново', f_go: 'Начать работу', relaunch: 'Тур по порталу',
    t1_tag: 'Навигация', t1_t: 'Ваша панель управления', t1_b: 'Слева — всё меню портала: вакансии, кандидаты, календарь, тесты, обучение. Отсюда вы попадёте в любой раздел.',
    t2_tag: 'Первый шаг', t2_t: 'Отправьте тест кандидату', t2_b: 'Раздел «Тесты» — главное действие. Введите e-mail кандидата: он получит ссылку и пройдёт тесты сам, без вашего участия.',
    t3_tag: 'Результаты', t3_t: 'Кандидаты и их профили', t3_b: 'Каждый кандидат — карточка с тегом этапа. Клик открывает полный профиль: спектр личности, баллы и рекомендацию ИИ, итоговое решение.',
    t4_tag: 'Планирование', t4_t: 'Календарь собеседований', t4_b: 'Планируйте собеседования, редактируйте их и синхронизируйте с Google, Apple и Outlook в один клик.',
    t5_tag: 'Обучение', t5_t: 'Академия и материалы', t5_b: 'Программа для вас и команды: как читать графики, проводить собеседования и не ошибаться в найме.',
    t6_tag: 'Баланс', t6_t: 'Тесты и баланс', t6_b: 'Здесь видно, сколько тестов доступно, и можно пополнить баланс. Каждый тест — это один разбор кандидата.' },
  pl: { w_title: 'Witaj w portalu!', w_body: 'Pokażemy w minutę, gdzie co jest i jak wysłać test pierwszemu kandydatowi. Tylko 6 krótkich wskazówek.', w_skip: 'Nie teraz', w_start: 'Zacznij tur',
    skip: 'Pomiń', back: 'Wstecz', next: 'Dalej', finish: 'Zakończ',
    f_title: 'Gotowe — teraz Twoja kolej', f_body: 'Wiesz już, gdzie co jest. Zaproś pierwszego kandydata i zobacz, jak AI odkryje jego profil.', f_replay: 'Powtórz', f_go: 'Zaczynamy', relaunch: 'Tur po portalu',
    t1_tag: 'Nawigacja', t1_t: 'Twój panel', t1_b: 'Po lewej — całe menu: wakaty, kandydaci, kalendarz, testy, szkolenia.',
    t2_tag: 'Pierwszy krok', t2_t: 'Wyślij test kandydatowi', t2_b: 'Sekcja „Testy” — główne działanie. Podaj e-mail kandydata: dostanie link i wykona testy sam.',
    t3_tag: 'Wyniki', t3_t: 'Kandydaci i ich profile', t3_b: 'Każdy kandydat to karta z tagiem etapu. Kliknięcie otwiera pełny profil: spektrum, punkty i rekomendację AI.',
    t4_tag: 'Planowanie', t4_t: 'Kalendarz rozmów', t4_b: 'Planuj rozmowy i synchronizuj z Google, Apple i Outlook jednym kliknięciem.',
    t5_tag: 'Szkolenia', t5_t: 'Akademia i materiały', t5_b: 'Program dla Ciebie i zespołu: jak czytać wykresy i nie mylić się w rekrutacji.',
    t6_tag: 'Saldo', t6_t: 'Testy i saldo', t6_b: 'Tu widać dostępne testy i można doładować saldo. Każdy test to jedna analiza kandydata.' },
  en: { w_title: 'Welcome to the portal!', w_body: "We'll show you in a minute where everything is and how to send a test to your first candidate. Just 6 short tips.", w_skip: 'Not now', w_start: 'Start tour',
    skip: 'Skip tour', back: 'Back', next: 'Next', finish: 'Finish',
    f_title: "You're all set", f_body: 'You know where everything is. Invite your first candidate and see how AI reveals their profile.', f_replay: 'Replay', f_go: 'Get started', relaunch: 'Portal tour',
    t1_tag: 'Navigation', t1_t: 'Your control panel', t1_b: 'On the left is the whole menu: vacancies, candidates, calendar, tests, learning.',
    t2_tag: 'First step', t2_t: 'Send a test to a candidate', t2_b: 'The "Tests" section is the main action. Enter a candidate email — they get a link and take the tests themselves.',
    t3_tag: 'Results', t3_t: 'Candidates and their profiles', t3_b: 'Each candidate is a card with a stage tag. A click opens the full profile: personality spectrum, scores and the AI recommendation.',
    t4_tag: 'Scheduling', t4_t: 'Interview calendar', t4_b: 'Plan interviews and sync them with Google, Apple and Outlook in one click.',
    t5_tag: 'Learning', t5_t: 'Academy and materials', t5_b: 'A program for you and your team: how to read the charts and avoid hiring mistakes.',
    t6_tag: 'Balance', t6_t: 'Tests and balance', t6_b: 'See how many tests are available and top up. Each test is one candidate analysis.' },
};
function tt(k) { return (TOURI18N[LANG] || TOURI18N.ru)[k] || TOURI18N.ru[k] || k; }
function tourSteps() {
  return [
    { sel: '.sidebar', tag: tt('t1_tag'), title: tt('t1_t'), body: tt('t1_b') },
    { sel: '[data-view="home"]', tag: tt('t2_tag'), title: tt('t2_t'), body: tt('t2_b') },
    { sel: '[data-view="candidates"]', tag: tt('t3_tag'), title: tt('t3_t'), body: tt('t3_b') },
    { sel: '[data-view="calendar"]', tag: tt('t4_tag'), title: tt('t4_t'), body: tt('t4_b') },
    { sel: '[data-view="education"]', tag: tt('t5_tag'), title: tt('t5_t'), body: tt('t5_b') },
    { sel: '[data-view="balance"]', tag: tt('t6_tag'), title: tt('t6_t'), body: tt('t6_b') },
  ];
}
let tourS = { i: 0, steps: [] };
function maybeStartTour() { try { if (localStorage.getItem('hp_tour_v1')) return; } catch (e) { return; } setTimeout(startPortalTour, 650); }
function tourOv() { let o = document.getElementById('tour-ov'); if (!o) { o = document.createElement('div'); o.id = 'tour-ov'; o.className = 'tour-ov'; document.body.appendChild(o); } return o; }
function startPortalTour() { tourS = { i: 0, steps: tourSteps() }; showTourWelcome(); }
window.startPortalTour = startPortalTour;
function tourDone() { try { localStorage.setItem('hp_tour_v1', '1'); } catch (e) {} const o = document.getElementById('tour-ov'); if (o) o.remove(); window.removeEventListener('resize', tourReposition); }
function showTourWelcome() {
  const o = tourOv(); o.className = 'tour-ov tour-center';
  o.innerHTML = '<div class="tour-hero">' +
    '<div class="tour-hero-ic">' + _svg('<path d="M12 3l2.2 5.5L20 9l-4 4 1.2 6L12 16l-5.2 3 1.2-6-4-4 5.8-.5z" stroke-linejoin="round"/>') + '</div>' +
    '<h2>' + tt('w_title') + '</h2><p>' + tt('w_body') + '</p>' +
    '<div class="tour-hero-btns"><button class="btn ghost" id="tour-skip">' + tt('w_skip') + '</button><button class="btn" id="tour-go">' + tt('w_start') + ' →</button></div></div>';
  $('#tour-skip').onclick = tourDone; $('#tour-go').onclick = () => { tourS.i = 0; showTourStep(0); };
}
function showTourFinish() {
  const o = tourOv(); o.className = 'tour-ov tour-center';
  o.innerHTML = '<div class="tour-hero fin">' +
    '<div class="tour-hero-ic ok">' + _svg('<path d="M4 12.5l5 5 11-11" stroke-linecap="round" stroke-linejoin="round"/>') + '</div>' +
    '<h2>' + tt('f_title') + '</h2><p>' + tt('f_body') + '</p>' +
    '<div class="tour-hero-btns"><button class="btn ghost" id="tour-replay">' + tt('f_replay') + '</button><button class="btn" id="tour-fin">' + tt('f_go') + '</button></div></div>';
  $('#tour-replay').onclick = () => { tourS.i = 0; showTourStep(0); }; $('#tour-fin').onclick = tourDone;
}
function showTourStep(idx) {
  tourS.i = idx; const step = tourS.steps[idx];
  const el = document.querySelector(step.sel);
  if (!el) { if (idx < tourS.steps.length - 1) return showTourStep(idx + 1); return showTourFinish(); }
  const r = el.getBoundingClientRect(); const pad = 6;
  const sx = Math.max(2, r.left - pad), sy = Math.max(2, r.top - pad), sw = r.width + pad * 2, sh = r.height + pad * 2;
  const tw = 340, gap = 18; let tx = r.right + gap, ty = r.top;
  if (tx + tw > window.innerWidth - 12) tx = Math.max(12, r.left - tw - gap); // fallback left
  const maxTy = window.innerHeight - 300; if (ty > maxTy) ty = Math.max(12, maxTy);
  const dots = tourS.steps.map((_, i) => '<span class="tour-dot ' + (i === idx ? 'on' : i < idx ? 'past' : '') + '"></span>').join('');
  const last = idx === tourS.steps.length - 1;
  const o = tourOv(); o.className = 'tour-ov';
  o.innerHTML =
    '<div class="tour-spot" style="left:' + sx + 'px;top:' + sy + 'px;width:' + sw + 'px;height:' + sh + 'px"><span class="tour-ring"></span></div>' +
    '<div class="tour-tip" style="left:' + tx + 'px;top:' + ty + 'px">' +
      '<div class="tour-tip-head"><span class="tour-tag">' + esc(step.tag) + '</span><span class="tour-counter">' + (idx + 1) + ' / ' + tourS.steps.length + '</span></div>' +
      '<h3>' + esc(step.title) + '</h3><p>' + esc(step.body) + '</p>' +
      '<div class="tour-dots">' + dots + '</div>' +
      '<div class="tour-btns"><button class="tour-linkbtn" id="tour-skip2">' + tt('skip') + '</button><div style="flex:1"></div>' +
        (idx > 0 ? '<button class="btn ghost xs" id="tour-prev">' + tt('back') + '</button>' : '') +
        '<button class="btn xs" id="tour-next">' + (last ? tt('finish') : tt('next')) + ' →</button></div>' +
    '</div>';
  $('#tour-skip2').onclick = tourDone;
  const pv = $('#tour-prev'); if (pv) pv.onclick = () => showTourStep(idx - 1);
  $('#tour-next').onclick = () => { if (last) showTourFinish(); else showTourStep(idx + 1); };
}
function tourReposition() { const o = document.getElementById('tour-ov'); if (o && !o.classList.contains('tour-center') && tourS.steps.length) showTourStep(tourS.i); }
window.addEventListener('resize', tourReposition);
