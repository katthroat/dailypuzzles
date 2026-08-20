// Mobile keyboard scroll guard: Mobile Safari/Firefox auto-scroll the page
// to keep a focused input "visible above the keyboard" whenever it's
// focused or the keyboard finishes animating in, and doesn't reliably
// respect the focused element being off-screen/invisible. Fighting it by
// guessing scroll offsets doesn't work, so instead the whole page is
// briefly made unscrollable (position:fixed on <body>) around tap/keystroke
// moments, so there's nothing for the browser to scroll.
let freezeTimer = null;

export function freezeScrollBriefly(ms = 600) {
  const body = document.body;
  const alreadyFrozen = body.style.position === "fixed";
  if (!alreadyFrozen) {
    const y = window.scrollY || window.pageYOffset || 0;
    const x = window.scrollX || window.pageXOffset || 0;
    body.dataset.freezeX = x;
    body.dataset.freezeY = y;
    document.documentElement.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = -y + "px";
    body.style.left = -x + "px";
    body.style.right = "0";
    body.style.width = "100%";
  }
  if (freezeTimer) clearTimeout(freezeTimer);
  freezeTimer = setTimeout(() => {
    const x = Number(body.dataset.freezeX || 0);
    const y = Number(body.dataset.freezeY || 0);
    document.documentElement.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(x, y);
    freezeTimer = null;
  }, ms);
}
