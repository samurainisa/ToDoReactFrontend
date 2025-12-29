export function forcePrimeDialogRepaint(): void {
  if (typeof window === "undefined") return;

  const body = document.body;

  const syncScrollbarWidth = () => {
    if (!body.classList.contains("p-overflow-hidden")) return;

    const current = body.style.getPropertyValue("--scrollbar-width").trim();

    if (current) {
      body.style.setProperty("--scrollbar-width", current);
      return;
    }

    const width = Math.max(0, window.innerWidth - document.documentElement.offsetWidth);
    body.style.setProperty("--scrollbar-width", `${width}px`);
  };

  const forceLayout = () => {
    void body.offsetHeight;
    syncScrollbarWidth();
    window.dispatchEvent(new Event("resize"));
  };

  window.requestAnimationFrame(() => {
    forceLayout();
    window.requestAnimationFrame(forceLayout);
  });
}

