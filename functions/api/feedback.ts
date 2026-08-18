// Anonymous feedback endpoint. Receives the plain HTML form POST from the
// Feedback section and forwards it via Resend. The destination address lives
// only in the FEEDBACK_TO env var, never in the repo or client code.
//
// Every outcome redirects to /thanks: spam and validation failures are
// dropped silently so bots learn nothing, and real delivery errors are
// visible in the Pages function logs.

// A per-message subject keeps Gmail from threading every submission into one
// conversation, and the excerpt makes the inbox scannable.
const subjectFor = (message: string) => {
  const oneLine = message.replace(/\s+/g, " ").trim();
  const excerpt = oneLine.length > 60 ? `${oneLine.slice(0, 59)}…` : oneLine;
  return `bromney.com feedback: ${excerpt}`;
};

interface Env {
  RESEND_API_KEY: string;
  FEEDBACK_TO: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const redirect = () =>
    new Response(null, { status: 303, headers: { Location: "/thanks/" } });

  // Strict same-origin check that also holds on *.pages.dev preview deploys.
  // Browsers always send Origin on form POSTs; a missing header means a
  // scripted request that never loaded the page, so it is rejected too.
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin) return redirect();

  const form = await request.formData().catch(() => null);
  if (!form) return redirect();

  const message = String(form.get("message") ?? "").trim();

  // The honeypot must be present (proof the real form was loaded) and empty
  // (proof a human filled it out).
  if (!form.has("website") || String(form.get("website")) !== "") {
    return redirect();
  }

  if (message.length < 2 || message.length > 5000) {
    return redirect();
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Feedback <feedback@bromney.com>",
      to: [env.FEEDBACK_TO],
      subject: subjectFor(message),
      text: message,
    }),
  }).catch((err) => {
    console.error("Resend request failed", err);
    return null;
  });

  if (res && !res.ok) {
    console.error("Resend error", res.status, await res.text());
  }

  return redirect();
};
