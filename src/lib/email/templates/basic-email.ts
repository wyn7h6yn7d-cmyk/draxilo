export function renderBasicEmailHtml(params: {
  subject: string;
  bodyText: string;
  footer?: string;
}) {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const paragraphs = params.bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px 0;line-height:1.55;">${escape(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const footer = params.footer
    ? `<div style="margin-top:24px;color:#71717a;font-size:12px;line-height:1.4;">${escape(
        params.footer,
      )}</div>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(params.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;color:#0a0a0a;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
      ${paragraphs}
      ${footer}
    </div>
  </body>
</html>`;
}

