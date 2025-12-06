document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ENHANCEMENT: Interactive Gradient Background ---
  const pageWrapper = document.querySelector('.page-wrapper');
  if (pageWrapper && window.matchMedia("(pointer: fine)").matches) { // Only run on devices with a mouse
    document.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) * 100;
      const y = (clientY / innerHeight) * 100;
      pageWrapper.style.setProperty('--mouse-x', x);
      pageWrapper.style.setProperty('--mouse-y', y);
    }, { passive: true });
  }

  // --- 2. CORE: Countdown Timer ---
  const countdownElement = document.getElementById('countdown');
  if (countdownElement) {
    const targetDate = new Date('2026-01-15T00:00:00');
    let countdownInterval = setInterval(updateCountdown, 1000);

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        countdownElement.textContent = "Lancement aujourd'hui !";
        clearInterval(countdownInterval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      countdownElement.textContent = `Lancement dans ${days}j ${hours}h ${minutes}m ${seconds}s`;
    }
    updateCountdown();
  }

  // --- 3. CORE: Accessible Modal System ---
  const overlay = document.getElementById('modal-overlay');
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let activeModal = null;
  let lastFocusedElement = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    const focusableElements = Array.from(modal.querySelectorAll(focusableSelector));
    focusableElements[0]?.focus();

    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.removeEventListener('keydown', trapFocus);
    activeModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lastFocusedElement?.focus();
    activeModal = null;
  }

  function trapFocus(e) {
    if (e.key !== 'Tab' || !activeModal) return;
    const focusableElements = Array.from(activeModal.querySelectorAll(focusableSelector));
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }

  // Modal Triggers
  document.getElementById('newsletter-btn')?.addEventListener('click', () => openModal(document.getElementById('modal-newsletter')));
  document.querySelector('#premium .cta')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(document.getElementById('modal-premium'));
  });

  // Modal Closers
  document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));
  overlay?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) closeModal();
  });

  // --- 4. CORE: Newsletter Form (Brevo) ---
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('newsletter-submit');
      const statusDiv = document.getElementById('newsletter-status');
      if (!document.getElementById('newsletter-consent').checked) {
        statusDiv.textContent = '❌ Veuillez accepter de recevoir des emails.';
        Object.assign(statusDiv.style, { display: 'block', background: '#fee', color: '#c33' });
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Inscription en cours...';
      statusDiv.style.display = 'none';
      try {
        const response = await fetch('brevo-subscribe.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newsletterForm.email.value, prenom: newsletterForm.prenom.value })
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Erreur serveur');
        statusDiv.textContent = '✅ Merci pour votre inscription !';
        Object.assign(statusDiv.style, { display: 'block', background: '#e8f5e9', color: '#2e7d32' });
        newsletterForm.reset();
        setTimeout(() => { closeModal(); statusDiv.style.display = 'none'; }, 2000);
      } catch (error) {
        console.error('Erreur:', error);
        statusDiv.textContent = '❌ Une erreur est survenue. Réessayez.';
        Object.assign(statusDiv.style, { display: 'block', background: '#fee', color: '#c33' });
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'S\'inscrire';
      }
    });
  }

  // --- 5. CORE: Premium/Pricing Buttons ---
  document.getElementById('premium-month')?.addEventListener('click', () => {
    alert('Super choix ! L\'abonnement mensuel à 0,99€/mois sera disponible au lancement. 🎉');
    closeModal();
  });
  document.getElementById('premium-life')?.addEventListener('click', () => {
    alert('Excellent ! L\'offre à vie à 4,99€ sera disponible dès le lancement. 🚀');
    closeModal();
  });

  // --- 6. ENHANCEMENT: Animations on Scroll (Fade-in & Stars) ---
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        const starContainer = entry.target.querySelector('.rev-stars[data-rating]');
        if (starContainer && !starContainer.classList.contains('animated')) {
          starContainer.classList.add('animated');
          const rating = parseInt(starContainer.dataset.rating, 10);
          starContainer.innerHTML = Array.from({ length: 5 }, (_, i) =>
            `<span class="${i < rating ? '' : 'star-empty'}" style="transition-delay: ${i * 0.05}s;">★</span>`
          ).join('');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".fade-in, .review").forEach(el => animationObserver.observe(el));

  // --- 7. CORE: Reviews Carousel ---
  (function() {
    const track = document.getElementById('reviews-track');
    if (!track) return;
    const leftBtn = track.parentElement.querySelector('.rev-arrow.left');
    const rightBtn = track.parentElement.querySelector('.rev-arrow.right');
    let isDown = false, startX, scrollLeft;
    
    Array.from(track.children).forEach(node => track.appendChild(node.cloneNode(true)));
    
    const scroll = (offset) => track.scrollBy({ left: offset, behavior: 'smooth' });
    let autoScroll = setInterval(() => scroll(340), 5000);
    const resetAutoScroll = () => { clearInterval(autoScroll); autoScroll = setInterval(() => scroll(340), 5000); };

    track.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; track.style.cursor = 'grabbing'; });
    track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.5; });
    
    leftBtn.addEventListener('click', () => scroll(-340));
    rightBtn.addEventListener('click', () => scroll(340));
    [track, leftBtn, rightBtn].forEach(el => {
      el.addEventListener('mouseenter', () => clearInterval(autoScroll));
      el.addEventListener('mouseleave', resetAutoScroll);
    });
  })();

  // --- 8. CORE: Phone Carousel ---
  (function() {
    const container = document.getElementById('phone-preview');
    if (!container) return;
    
    const screens = container.querySelectorAll('.phone-screen');
    const dots = container.querySelectorAll('.phone-dots .dot');
    const featureCards = document.querySelectorAll('.hero-layout .card[data-slide-to]');
    let currentIndex = 0;

    function showScreen(index) {
      // Ensure index is within bounds
      currentIndex = (index + screens.length) % screens.length;

      // Update screens visibility
      screens.forEach((screen, i) => screen.classList.toggle('active', i === currentIndex));

      // Update dots visibility
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));

      // Update card highlight
      featureCards.forEach(card => {
        card.classList.toggle('active-card', parseInt(card.dataset.slideTo) === currentIndex);
      });
    }

    // Link arrows, dots, and cards to the carousel
    container.querySelector('.phone-arrow.prev')?.addEventListener('click', e => { e.stopPropagation(); showScreen(currentIndex - 1); });
    container.querySelector('.phone-arrow.next')?.addEventListener('click', e => { e.stopPropagation(); showScreen(currentIndex + 1); });
    dots.forEach((dot, i) => dot.addEventListener('click', e => { e.stopPropagation(); showScreen(i); }));
    featureCards.forEach(card => {
      card.addEventListener('click', () => {
        const slideIndex = parseInt(card.dataset.slideTo, 10);
        if (!isNaN(slideIndex)) showScreen(slideIndex);
      });
    });

    // Initialize
    showScreen(0);
  })();
});
