document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const contactForm = document.getElementById('contact-form');

    // Sticky nav shadow on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                nav.classList.toggle('scrolled', window.scrollY > 20);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const spans = navToggle.querySelectorAll('span');
        const isOpen = mobileMenu.classList.contains('open');
        spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
        spans[1].style.opacity = isOpen ? '0' : '1';
        spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Scroll-triggered fade-in animations
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateTargets = [
        '.step-card', '.feature-card', '.use-case-card',
        '.case-study-content', '.case-study-visual',
        '.stat-card', '.contact-info', '.contact-form'
    ];

    animateTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${i * 0.08}s`;
            observer.observe(el);
        });
    });

    // Contact form handling via Resend API
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Something went wrong.');
            }

            contactForm.innerHTML = `
                <div class="form-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h3>Thank you for your inquiry!</h3>
                    <p>We've received your message and will get back to you within one business day.</p>
                </div>
            `;
            contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Inquiry';
            alert(err.message || 'Failed to send. Please try again.');
        }
    });
});
