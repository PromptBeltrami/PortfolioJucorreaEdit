/* jucorrea.edit · interações do site */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Header ao rolar */
  const header = $("#header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 2. Menu mobile */
  const toggle = $("#navToggle");
  const nav = $("#mainNav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.documentElement.style.overflowY = open ? "hidden" : "";
  };
  toggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false);
  });

  /* 3. Palavras que trocam no título */
  const words = $$("#rotator .word");
  if (words.length > 1 && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      words[i].classList.remove("is-active");
      i = (i + 1) % words.length;
      words[i].classList.add("is-active");
    }, 2800);
  }

  /* 3b. Vídeos do topo: pausados para quem prefere menos movimento; timecode correndo */
  const heroVideos = $$(".hero-video");
  if (reduceMotion) heroVideos.forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
  const tc = $("#tc");
  if (tc && !reduceMotion) {
    const t0 = performance.now();
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const ms = performance.now() - t0 + 12000;
      const f = Math.floor((ms % 1000) / 41.67);
      const s = Math.floor(ms / 1000);
      tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
      requestAnimationFrame(tick);
    };
    tick();
  } else if (tc) tc.textContent = "00:00:12:08";

  /* 4. Filtro do portfólio */
  const filters = $$("#portfolioFilters .filter");
  const works = $$("#portfolioGrid .work");
  const empty = $("#portfolioEmpty");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const f = btn.dataset.filter;
      let visible = 0;
      works.forEach((w) => {
        const show = f === "all" || w.dataset.category === f;
        w.classList.toggle("is-hidden", !show);
        if (show) visible++;
        else $$("video", w).forEach((v) => v.pause());
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  /* 5. YouTube: carrega o player só quando a pessoa clica (site mais leve) */
  $$(".yt").forEach((btn) => {
    const img = $("img", btn);
    img?.addEventListener("error", () => img.remove());
    btn.addEventListener("click", () => {
      const id = btn.dataset.yt;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = btn.getAttribute("aria-label") || "Vídeo do YouTube";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  /* 6. Só um vídeo tocando por vez */
  $$("video[controls]").forEach((v) =>
    v.addEventListener("play", () => {
      $$("video[controls]").forEach((o) => { if (o !== v) o.pause(); });
    })
  );

  /* 7. Animação de entrada ao rolar */
  const reveals = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* 8. Formulário (Formspree) com validação e confirmação na própria página */
  const form = $("#contactForm");
  const status = $("#formStatus");
  if (form) {
    const fields = $$("input, textarea", form);
    const msg = (el) => {
      if (el.validity.valueMissing) return "Esse campo é obrigatório.";
      if (el.validity.typeMismatch) return "Confere o e-mail? Parece que falta algo.";
      return "";
    };
    fields.forEach((el) => {
      el.addEventListener("blur", () => {
        el.dataset.touched = "true";
        el.nextElementSibling.textContent = msg(el);
      });
      el.addEventListener("input", () => {
        if (el.dataset.touched) el.nextElementSibling.textContent = msg(el);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      fields.forEach((el) => {
        el.dataset.touched = "true";
        const m = msg(el);
        el.nextElementSibling.textContent = m;
        if (m) ok = false;
      });
      if (!ok) {
        fields.find((el) => !el.checkValidity())?.focus();
        return;
      }

      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      btn.textContent = "Enviando…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("falha");
        form.reset();
        fields.forEach((el) => delete el.dataset.touched);
        status.textContent = "recebi! já já te respondo :)";
        btn.textContent = "Mensagem enviada";
      } catch {
        status.textContent = "ops, não foi. tenta de novo ou me chama no WhatsApp?";
        btn.disabled = false;
        btn.textContent = "Enviar mensagem";
      }
    });
  }
});
