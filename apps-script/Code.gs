// Google Apps Script: принимает заявку с сайта, записывает её в таблицу и отправляет письмо владельцу.
// Так же устроен приём заявок на сайте «Тяга»: сайт отправляет POST на адрес веб-приложения Apps Script.
//
// Необязательно: если в «Свойствах скрипта» (Project Settings → Script properties) заданы
// BOT_TOKEN и OWNER_CHAT_ID, заявка дополнительно уходит в личный Telegram-бот.

const OWNER_EMAIL = 'ddzon4553@gmail.com';
const SHEET_NAME = 'Заявки';

const FIELDS = [
  ['sphere', 'Сфера деятельности'],
  ['instagram', 'Instagram'],
  ['channels', 'Как привлекают клиентов'],
  ['leads', 'Где оставляют заявку'],
  ['dropoff', 'Где останавливаются'],
  ['messenger', 'Способ связи'],
  ['contact', 'Контакт'],
];
const MAX_LEN = 1000;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);

    // Ловушка для ботов: настоящий человек это поле не заполняет
    if (data.honey) return reply_({ success: true });

    const values = FIELDS.map(([key, label]) => {
      const v = String(data[key] == null ? '' : data[key]).trim().slice(0, MAX_LEN);
      if (!v) throw new Error('Не заполнено поле: ' + label);
      return v;
    });

    saveToSheet_(values);
    sendEmail_(values);
    sendTelegram_(values); // не мешает заявке, если Telegram не настроен или недоступен

    return reply_({ success: true });
  } catch (err) {
    return reply_({ success: false, message: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// Открытие адреса в браузере показывает, что скрипт жив
function doGet() {
  return reply_({ ok: true });
}

function saveToSheet_(values) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) return; // скрипт не привязан к таблице, заявки идут только на почту
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(['Дата'].concat(FIELDS.map((f) => f[1])));
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date()].concat(values));
}

function sendEmail_(values) {
  const rows = FIELDS.map((f, i) =>
    '<tr><td style="padding:6px 14px 6px 0;color:#566074">' + esc_(f[1]) + '</td><td style="padding:6px 0"><b>' + esc_(values[i]) + '</b></td></tr>'
  ).join('');
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: 'Новая заявка: ' + values[0],
    name: 'Автоматизация Бизнеса',
    htmlBody: '<h3 style="margin:0 0 12px">Новая заявка с сайта</h3><table style="font:15px/1.5 Arial,sans-serif">' + rows + '</table>',
  });
}

function sendTelegram_(values) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chatId = props.getProperty('OWNER_CHAT_ID');
  if (!token || !chatId) return;
  try {
    const text = '🆕 <b>Новая заявка</b>\n\n' + FIELDS.map((f, i) => '<b>' + f[1] + ':</b> ' + esc_(values[i])).join('\n');
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', disable_web_page_preview: true }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error('Telegram: ' + err);
  }
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
