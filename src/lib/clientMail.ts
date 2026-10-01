import { LeadType } from "@/generated/prisma/enums";
import { sendMail } from "@/lib/mailer";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// имя, сообщение и названия товаров приходят от пользователя — экранируем
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

function layout(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c2126">
      <h2 style="margin:0 0 16px">${esc(title)}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7e8;margin:24px 0" />
      <p style="font-size:12px;color:#767d83">
        Это автоматическое письмо, отвечать на него не нужно.
        ${SITE ? `<br/><a href="${SITE}">${SITE}</a>` : ""}
      </p>
    </div>`;
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
        `<p>Здравствуйте, ${esc(p.name)}!</p>
         <p>Мы получили вашу заявку и перезвоним на номер <b>${esc(p.phone)}</b> в ближайшее рабочее время.</p>`
      ),
    });
  }

  return sendMail({
    to: p.email,
    subject: "Мы получили запрос на коммерческое предложение",
    text: `Здравствуйте, ${p.name}! Мы получили ваш запрос на КП. Подготовим предложение и свяжемся с вами.`,
    html: layout(
      "Запрос на КП принят",
      `<p>Здравствуйте, ${esc(p.name)}!</p>
       <p>Мы получили ваш запрос на коммерческое предложение${p.hasFiles ? " и приложенную спецификацию" : ""}.
       Подготовим КП и свяжемся с вами по телефону <b>${esc(p.phone)}</b> или по почте.</p>`
    ),
  });
}

export function sendOrderConfirmation(p: {
  orderNumber: number | string;
  name: string;
  email: string;
  items: { title: string; quantity: number; price: number | null }[];
}) {
  const hasOnRequest = p.items.some((i) => i.price === null);
  const total = p.items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  const rows = p.items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0">${esc(i.title)} × ${i.quantity}</td>
        <td style="padding:6px 0;text-align:right;white-space:nowrap">
          ${i.price === null ? "По запросу" : rub(i.price * i.quantity)}
        </td></tr>`
    )
    .join("");

  return sendMail({
    to: p.email,
    subject: `Заявка №${p.orderNumber} принята`,
    text: `Здравствуйте, ${p.name}! Ваша заявка принята. Номер заявки: №${p.orderNumber}. Мы свяжемся с вами в ближайшее время.`,
    html: layout(
      `Заявка №${p.orderNumber} принята`,
      `<p>Здравствуйте, ${esc(p.name)}!</p>
       <p>Спасибо за заявку. Её номер — <b>№${p.orderNumber}</b>. Менеджер свяжется с вами в ближайшее время.</p>
       <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
       <p style="font-size:16px"><b>Итого: ${rub(total)}${hasOnRequest ? " +" : ""}</b></p>
       ${hasOnRequest ? `<p style="font-size:12px;color:#767d83">Часть товаров с ценой по запросу — сумма будет уточнена при обработке заявки.</p>` : ""}`
    ),
  });
}