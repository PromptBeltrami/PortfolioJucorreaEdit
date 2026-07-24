/**
 * PORTFÓLIO DE EDIÇÃO DE VÍDEO
 * Funcionalidades interativas e interações de UI/UX
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inicialização de todas as funcionalidades
  initMobileNav();
  initHeaderScroll();
  initTextRotator();
  initPortfolioFilters();
  initFormValidation();
  initScrollReveal();
});

/* ==========================================================================
   1. Menu Mobile (Hamburguer / Toggle)
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener("click", () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", !isExpanded);
    mainNav.classList.toggle("is-open");
  });

  // Fecha o menu ao clicar em um link
  const navLinks = mainNav.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleBtn.setAttribute("aria-expanded", "false");
      mainNav.classList.remove("is-open");
    });
  });
}

/* ==========================================================================
   2. Header com Efeito ao Rolar (Scrolled Border & Blur)
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}

/* ==========================================================================
   3. Rotação de Palavras no Hero (.hero-rotator .word)
   ========================================================================== */
function initTextRotator() {
  const rotator = document.querySelector(".hero-rotator");
  if (!rotator) return;

  const words = rotator.querySelectorAll(".word");
  if (words.length < 2) return;

  let currentIndex = 0;
  const intervalTime = 3000; // Troca a cada 3 segundos

  setInterval(() => {
    // Remove a classe ativa da palavra atual
    words[currentIndex].classList.remove("is-active");

    // Calcula a próxima palavra
    currentIndex = (currentIndex + 1) % words.length;

    // Adiciona a classe ativa na próxima
    words[currentIndex].classList.add("is-active");
  }, intervalTime);
}

/* ==========================================================================
   4. Filtro do Portfólio
   ========================================================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".portfolio-item");
  const emptyMessage = document.querySelector(".portfolio-empty");

  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Atualiza os botões ativos
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filterValue = btn.getAttribute("data-filter");
      let visibleCount = 0;

      items.forEach((item) => {
        const category = item.getAttribute("data-category");

        if (filterValue === "all" || category === filterValue) {
          item.classList.remove("is-hidden");
          visibleCount++;
        } else {
          item.classList.add("is-hidden");
        }
      });

      // Exibe mensagem caso nenhum item pertença à categoria
      if (emptyMessage) {
        emptyMessage.style.display = visibleCount === 0 ? "block" : "none";
      }
    });
  });
}

/* ==========================================================================
   5. Validação e Envio do Formuário de Contato
   ========================================================================== */
function initFormValidation() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const inputs = form.querySelectorAll("input, textarea");

  // Marca os campos como "tocados" ao sair do foco para exibir o erro CSS
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      input.setAttribute("data-touched", "true");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    inputs.forEach((input) => {
      input.setAttribute("data-touched", "true");
      if (!input.checkValidity()) {
        isValid = false;
      }
    });

    if (isValid) {
      // Exibe mensagem de sucesso
      form.innerHTML = `
        <div class="form-success">
          <h3>Mensagem enviada com sucesso!</h3>
          <p>Obrigado pelo contato. Retornarei o mais breve possível.</p>
        </div>
      `;
    }
  });
}

/* ==========================================================================
   6. Animação de Ancoragem / Reveal ao Rolar (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!revealElements.length) return;

  // Respeita preferência do usuário por movimento reduzido
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Anima apenas uma vez
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}