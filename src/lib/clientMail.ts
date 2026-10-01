import { LeadType } from "@/generated/prisma/enums";
import { sendMail } from "@/lib/mailer";
import { CONTACTS } from "@/lib/site-content";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// PNG-иконка сайта (не .ico: Gmail и Outlook его не показывают)
const ICON_URL = SITE ? `${SITE}/email-icon.png` : "";

// Заглушки вида «XXX» в письма не попадают
const isFilled = (v?: string) => !!v && !/X{2,}/.test(v);

const CONTACT_PHONE = isFilled(CONTACTS.phone) ? CONTACTS.phone : "";
const CONTACT_EMAIL = isFilled(CONTACTS.email) ? CONTACTS.email : "";
const CONTACT_ADDRESS = isFilled(CONTACTS.address) ? CONTACTS.address : "";
const CONTACT_HOURS = isFilled(CONTACTS.hours) ? CONTACTS.hours : "";

// имя, сообщение и названия товаров приходят от пользователя — экранируем
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

// Абзац вводного текста. last = true — последний абзац, после него отступ побольше
const para = (html: string, last = false) => `
  <p style="margin:0 0 ${last ? 28 : 6}px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#767d83;">
    ${html}
  </p>`;

function layout(title: string, body: string) {
  const siteUrl = SITE || "#";

  const linkStyle = "color:#767d83;text-decoration:none;";
  const contactLines = [
    CONTACT_PHONE &&
      `<a href="tel:${esc(CONTACT_PHONE.replace(/[^\d+]/g, ""))}" style="${linkStyle}">${esc(CONTACT_PHONE)}</a>`,
    CONTACT_EMAIL &&
      `<a href="mailto:${esc(CONTACT_EMAIL)}" style="${linkStyle}">${esc(CONTACT_EMAIL)}</a>`,
    CONTACT_ADDRESS && esc(CONTACT_ADDRESS),
    CONTACT_HOURS && esc(CONTACT_HOURS),
  ].filter(Boolean);

  return `
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      width:100%;
      background-color:#f4f5f7;
      font-family:Arial,Helvetica,sans-serif;
      color:#1c2126;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width:100%;
        margin:0;
        padding:0;
        background-color:#f4f5f7;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding:32px 16px;
            background-color:#f4f5f7;
          "
        >
          <table
            role="presentation"
            width="600"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width:100%;
              max-width:600px;
              background-color:#ffffff;
              border:1px solid #e5e7e8;
              border-radius:16px;
              overflow:hidden;
            "
          >

            <!-- Шапка -->
            <tr>
              <td style="padding:20px 28px;background-color:#28313d;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${
                      ICON_URL
                        ? `
                    <td style="padding-right:12px;vertical-align:middle;">
                      <img
                        src="${ICON_URL}"
                        alt=""
                        width="32"
                        height="32"
                        style="display:block;width:32px;height:32px;padding:4px;background-color:#ffffff;border-radius:8px;border:0;"
                      />
                    </td>`
                        : ""
                    }
                    <td
                      style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:28px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;"
                    >
                      AKVERA
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Акцентная линия -->
            <tr>
              <td
                style="
                  height:4px;
                  padding:0;
                  background-color:#179146;
                  font-size:0;
                  line-height:0;
                "
              >
                &nbsp;
              </td>
            </tr>

            <!-- Контент -->
            <tr>
              <td
                style="
                  padding:32px 28px 28px;
                  background-color:#ffffff;
                "
              >
                <h1
                  style="
                    margin:0 0 24px;
                    padding:0;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:24px;
                    line-height:32px;
                    font-weight:700;
                    color:#28313d;
                  "
                >
                  ${esc(title)}
                </h1>

                ${body}
              </td>
            </tr>

            <!-- CTA -->
<tr>
  <td
    style="
      padding:0 28px 32px;
      background-color:#ffffff;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="border-collapse:separate;"
    >
      <tr>
        <td
          align="center"
          valign="middle"
          style="
            background-color:#179146;
            border-radius:10px;
            mso-padding-alt:14px 24px;
          "
        >
          <a
            href="${siteUrl}"
            target="_blank"
            style="
              display:block;
              padding:14px 24px;
              background-color:#179146;
              border:1px solid #179146;
              border-radius:10px;
              color:#ffffff;
              font-family:Arial,Helvetica,sans-serif;
              font-size:14px;
              line-height:20px;
              font-weight:700;
              text-align:center;
              text-decoration:none;
              white-space:nowrap;
            "
          >
            Перейти на сайт
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>

            ${
              contactLines.length
                ? `
            <!-- Контакты -->
            <tr>
              <td style="padding:22px 28px;border-top:1px solid #e5e7e8;background-color:#ffffff;">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;font-weight:700;color:#28313d;">
                  Контакты
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#767d83;">
                  ${contactLines.join("<br />")}
                </p>
              </td>
            </tr>`
                : ""
            }

            <!-- Футер -->
            <tr>
              <td
                style="
                  padding:18px 28px 22px;
                  background-color:#f4f5f7;
                  border-top:1px solid #e5e7e8;
                "
              >
                <p
                  style="
                    margin:0;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:11px;
                    line-height:17px;
                    color:#767d83;
                  "
                >
                  Это автоматическое письмо, отвечать на него не нужно.
                </p>

                ${
                  SITE
                    ? `
                <p
                  style="
                    margin:6px 0 0;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:11px;
                    line-height:17px;
                  "
                >
                  <a
                    href="${SITE}"
                    style="
                      color:#767d83;
                      text-decoration:none;
                    "
                  >
                    ${SITE}
                  </a>
                </p>
                `
                    : ""
                }
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function sendLeadConfirmation(p: {
  type: LeadType;
  name: string;
  phone: string;
  email: string;
  hasFiles: boolean;
}) {
  if (p.type === LeadType.CALLBACK) {
    return sendMail({
      to: p.email,
      subject: "Мы получили вашу заявку на звонок",
      text: `Здравствуйте, ${p.name}! Мы получили вашу заявку и перезвоним на номер ${p.phone} в ближайшее рабочее время.`,
      html: layout(
        "Заявка на звонок принята",
        `
          <!-- Приветствие -->
          <p
            style="
              margin:0 0 12px;
              font-family:Arial,Helvetica,sans-serif;
              font-size:16px;
              line-height:24px;
              color:#1c2126;
            "
          >
            Здравствуйте, ${esc(p.name)}!
          </p>

          ${para("Мы получили вашу заявку.")}
          ${para("Перезвоним вам в ближайшее рабочее время.", true)}

          <!-- Номер телефона -->
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width:100%;
              border-collapse:collapse;
              background-color:#f4f5f7;
              border-radius:12px;
            "
          >
            <tr>
              <td
                style="
                  padding:18px 20px;
                  border-left:3px solid #179146;
                "
              >
                <p
                  style="
                    margin:0 0 5px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:11px;
                    line-height:16px;
                    font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:0.5px;
                    color:#767d83;
                  "
                >
                  Номер телефона
                </p>

                <p
                  style="
                    margin:0;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:17px;
                    line-height:24px;
                    font-weight:700;
                    color:#28313d;
                  "
                >
                  ${esc(p.phone)}
                </p>
              </td>
            </tr>
          </table>
        `
      ),
    });
  }

  return sendMail({
    to: p.email,
    subject: "Мы получили запрос на коммерческое предложение",
    text: `Здравствуйте, ${p.name}! Мы получили ваш запрос на КП. Подготовим предложение и свяжемся с вами.`,
    html: layout(
      "Запрос на КП принят",
      `
        <!-- Приветствие -->
        <p
          style="
            margin:0 0 12px;
            font-family:Arial,Helvetica,sans-serif;
            font-size:16px;
            line-height:24px;
            color:#1c2126;
          "
        >
          Здравствуйте, ${esc(p.name)}!
        </p>

        ${para(
          `Мы получили ваш запрос на коммерческое предложение${
            p.hasFiles ? " и приложенную спецификацию" : ""
          }.`
        )}
        ${para("Подготовим КП и свяжемся с вами по телефону или на эту почту.")}
        ${para(
          `Телефон для связи: <strong style="color:#28313d;white-space:nowrap;">${esc(p.phone)}</strong>`,
          true
        )}

        <!-- Статус -->
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            border-collapse:collapse;
            background-color:#f4f5f7;
            border-radius:12px;
          "
        >
          <tr>
            <td
              style="
                padding:18px 20px;
                border-left:3px solid #179146;
              "
            >
              <p
                style="
                  margin:0 0 5px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:11px;
                  line-height:16px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:0.5px;
                  color:#767d83;
                "
              >
                Статус заявки
              </p>

              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:16px;
                  line-height:24px;
                  font-weight:700;
                  color:#28313d;
                "
              >
                Заявка получена
              </p>
            </td>
          </tr>
        </table>

        ${
          p.hasFiles
            ? `
        <p
          style="
            margin:16px 0 0;
            font-family:Arial,Helvetica,sans-serif;
            font-size:12px;
            line-height:19px;
            color:#767d83;
          "
        >
          Приложенная спецификация будет использована менеджером<br />
          при подготовке коммерческого предложения.
        </p>
        `
            : ""
        }
      `
    ),
  });
}

export function sendOrderConfirmation(p: {
  orderNumber: number | string;
  name: string;
  email: string;
  items: {
    title: string;
    quantity: number;
    price: number | null;
  }[];
}) {
  const hasOnRequest = p.items.some((i) => i.price === null);

  const total = p.items.reduce(
    (s, i) => s + (i.price ?? 0) * i.quantity,
    0
  );

  const rows = p.items
    .map(
      (i) => `
        <tr>
          <td
            style="
              padding:13px 8px 13px 0;
              border-bottom:1px solid #e5e7e8;
              font-family:Arial,Helvetica,sans-serif;
              font-size:13px;
              line-height:19px;
              color:#28313d;
              vertical-align:top;
            "
          >
            ${esc(i.title)}

            <span
              style="
                color:#767d83;
                white-space:nowrap;
              "
            >
              × ${esc(String(i.quantity))}
            </span>
          </td>

          <td
            style="
              width:120px;
              padding:13px 0;
              border-bottom:1px solid #e5e7e8;
              font-family:Arial,Helvetica,sans-serif;
              font-size:13px;
              line-height:19px;
              text-align:right;
              white-space:nowrap;
              color:#28313d;
              vertical-align:top;
            "
          >
            ${
              i.price === null
                ? `<span style="color:#767d83;">По запросу</span>`
                : rub(i.price * i.quantity)
            }
          </td>
        </tr>
      `
    )
    .join("");

  return sendMail({
    to: p.email,
    subject: `Заявка №${p.orderNumber} принята`,
    text: `Здравствуйте, ${p.name}! Ваша заявка принята. Номер заявки: №${p.orderNumber}. Мы свяжемся с вами в ближайшее время.`,
    html: layout(
      `Заявка №${p.orderNumber} принята`,
      `
        <!-- Приветствие -->
        <p
          style="
            margin:0 0 12px;
            font-family:Arial,Helvetica,sans-serif;
            font-size:16px;
            line-height:24px;
            color:#1c2126;
          "
        >
          Здравствуйте, ${esc(p.name)}!
        </p>

        ${para("Спасибо за заявку.")}
        ${para("Менеджер свяжется с вами в ближайшее время.", true)}

        <!-- Номер заявки -->
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            border-collapse:collapse;
            background-color:#28313d;
            border-radius:12px;
          "
        >
          <tr>
            <td
              style="
                padding:20px 22px;
                border-left:4px solid #179146;
              "
            >
              <p
                style="
                  margin:0 0 6px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:11px;
                  line-height:16px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:0.6px;
                  color:#aeb4ba;
                "
              >
                Номер заявки
              </p>

              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:26px;
                  line-height:32px;
                  font-weight:700;
                  color:#ffffff;
                "
              >
                №${esc(String(p.orderNumber))}
              </p>
            </td>
          </tr>
        </table>

        <!-- Состав заказа -->
        <p
          style="
            margin:28px 0 12px;
            font-family:Arial,Helvetica,sans-serif;
            font-size:15px;
            line-height:22px;
            font-weight:700;
            color:#28313d;
          "
        >
          Состав заявки
        </p>

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            border-collapse:collapse;
          "
        >
          <tr>
            <td
              style="
                padding:0 8px 10px 0;
                border-bottom:2px solid #e5e7e8;
                font-family:Arial,Helvetica,sans-serif;
                font-size:11px;
                line-height:16px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:0.4px;
                color:#767d83;
              "
            >
              Товар
            </td>

            <td
              style="
                width:120px;
                padding:0 0 10px;
                border-bottom:2px solid #e5e7e8;
                font-family:Arial,Helvetica,sans-serif;
                font-size:11px;
                line-height:16px;
                font-weight:700;
                text-align:right;
                text-transform:uppercase;
                letter-spacing:0.4px;
                color:#767d83;
              "
            >
              Сумма
            </td>
          </tr>

          ${rows}

          <!-- Итог -->
          <tr>
            <td
              style="
                padding:18px 8px 0 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:15px;
                line-height:22px;
                font-weight:700;
                color:#28313d;
              "
            >
              Итого
            </td>

            <td
              style="
                padding:18px 0 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:17px;
                line-height:24px;
                font-weight:700;
                text-align:right;
                white-space:nowrap;
                color:#179146;
              "
            >
              ${rub(total)}${hasOnRequest ? " +" : ""}
            </td>
          </tr>
        </table>

        ${
          hasOnRequest
            ? `
        <!-- Пояснение -->
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            margin-top:18px;
            border-collapse:collapse;
            background-color:#f4f5f7;
            border-radius:10px;
          "
        >
          <tr>
            <td
              style="
                padding:14px 16px;
                border-left:3px solid #aeb4ba;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  line-height:19px;
                  color:#767d83;
                "
              >
                Часть товаров с ценой по запросу —
                сумма будет уточнена при обработке заявки.
              </p>
            </td>
          </tr>
        </table>
        `
            : ""
        }
      `
    ),
  });
}