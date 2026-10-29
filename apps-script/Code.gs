// Скрипт принимает заявки с сайта-анкеты «Автоматизация Бизнеса» и присылает каждую письмом на почту. Таблица не нужна.
// Устроен так же, как скрипт сайта «Тяга»: создайте проект на script.google.com, вставьте этот код и разверните как «Веб-приложение».
//
// Необязательно: если в «Свойствах скрипта» (Project Settings → Script properties) заданы
// BOT_TOKEN и OWNER_CHAT_ID, заявка дополнительно уходит в личный Telegram-бот.

var EMAIL = 'ddzon4553@gmail.com'; // куда присылать заявки

// [ключ в запросе сайта, подпись в письме]
var FIELDS = [
  ['sphere', 'Сфера деятельности'],
  ['instagram', 'Instagram'],
  ['channels', 'Как привлекают клиентов'],
  ['leads', 'Где оставляют заявку'],
  ['dropoff', 'Где останавливаются'],
  ['messenger', 'Способ связи'],
  ['contact', 'Контакт']
];
var MAX_LEN = 1000;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    // Ловушка для ботов: настоящий человек это поле не заполняет
    if (data.honey) return json({ success: true });

    var values = FIELDS.map(function (f) {
      var v = String(data[f[0]] == null ? '' : data[f[0]]).trim().slice(0, MAX_LEN);
      if (!v) throw new Error('Не заполнено поле: ' + f[1]);
      return v;
    });
    sendMail(values);
    sendTelegram(values); // не мешает заявке, если Telegram не настроен или недоступен
    return json({ success: true });
  } catch (err) {
    return json({ success: false, message: String(err) });
  }
}

function esc(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sendMail(values) {
  var rows = FIELDS.map(function (f, i) {
    return '<tr><td style="padding:6px 12px;border:1px solid #ddd;color:#555">' + esc(f[1]) + '</td>' +
           '<td style="padding:6px 12px;border:1px solid #ddd"><b>' + esc(values[i]) + '</b></td></tr>';
  }).join('');
  MailApp.sendEmail({
    to: EMAIL,
    subject: 'Новая заявка: ' + values[0],
    htmlBody: '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' + rows + '</table>',
    name: 'Автоматизация Бизнеса'
  });
}

function sendTelegram(values) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('BOT_TOKEN');
  var chatId = props.getProperty('OWNER_CHAT_ID');
  if (!token || !chatId) return;
  try {
    var text = '🆕 <b>Новая заявка</b>\n\n' + FIELDS.map(function (f, i) {
      return '<b>' + f[1] + ':</b> ' + esc(values[i]);
    }).join('\n');
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', disable_web_page_preview: true }),
      muteHttpExceptions: true
    });
  } catch (err) {
    console.error('Telegram: ' + err);
  }
}

// Запустите эту функцию один раз в редакторе: Google попросит разрешение на отправку почты и пришлёт тестовое письмо.
function testEmail() {
  sendMail(['Тест', '@test', 'проверка', 'проверка', 'проверка', 'Telegram', '@test']);
}

function doGet() {
  return json({ success: true, message: 'Скрипт заявок работает' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
