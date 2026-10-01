/**
 * Janette Amoatemaa Sarfo — UI/UX Portfolio
 * Aesthetic: Warm Digital Editorial
 * Dynamic Data-Driven Engine:
 * - Loads from localStorage ('jay_portfolio_data') or data/portfolio-data.json
 * - Supports real-time live sync with the /dashboard/ editor via StorageEvent
 * - Interactive Case Study Modal, Category Filters, Live GMT Time, Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'jay_portfolio_data';
  const CONVEX_CLOUD_URL = 'https://rightful-mandrill-291.convex.cloud';
  const CONVEX_SITE_URL = 'https://rightful-mandrill-291.convex.site';
  let portfolioData = null;

  // --------------------------------------------------------------------------
  // 1. Data Loader & Convex Cloud Integration
  // --------------------------------------------------------------------------
  async function fetchFromConvex() {
    // 1. Try Convex Site HTTP endpoint
    try {
      const res = await fetch(`${CONVEX_SITE_URL}/get-portfolio`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) return json.data;
      }
    } catch (_) {}

    // 2. Try Convex Cloud API query
    try {
      const res = await fetch(`${CONVEX_CLOUD_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'portfolio:get', args: {} })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.value) return json.value;
      }
    } catch (_) {}

    return null;
  }

  async function loadDataAndRender() {
    // 1. Try Convex backend first for live cloud data!
    try {
      const convexData = await fetchFromConvex();
      if (convexData) {
        portfolioData = convexData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
        renderEntirePortfolio();
        return;
      }
    } catch (e) {
      console.warn('Convex backend check bypassed:', e);
    }

    // 2. Fallback to localStorage cache
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        portfolioData = JSON.parse(saved);
        renderEntirePortfolio();
        return;
      } catch (e) {
        console.error('Error parsing stored portfolio data:', e);
      }
    }

    // 3. Fallback to data/portfolio-data.json
    try {
      const response = await fetch('data/portfolio-data.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      portfolioData = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
      renderEntirePortfolio();
    } catch (err) {
      console.warn('Could not fetch data/portfolio-data.json, using static fallback.', err);
    }
  }

  // Listen to dashboard edits from other tabs/windows in real time!
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        portfolioData = JSON.parse(e.newValue);
        renderEntirePortfolio();
        showToast('Portfolio content updated live from Studio CMS!');
      } catch (err) {
        console.error('Failed to parse updated storage data:', err);
      }
    }
  });

  // --------------------------------------------------------------------------
  // 2. Render Functions
  // --------------------------------------------------------------------------
  function renderEntirePortfolio() {
    if (!portfolioData) return;
    renderGeneral();
    renderHero();
    renderAbout();
    renderProjects();
    renderPhilosophy();
    renderCredentials();
    renderVisibility();
  }

  // A. General
  function renderGeneral() {
    const g = portfolioData.general || {};
    document.querySelectorAll('.brand-name').forEach(el => el.textContent = g.brandName || 'Janette Amoatemaa Sarfo');
    document.querySelectorAll('.brand-monogram').forEach(el => el.textContent = g.brandMonogram || 'JS');
    document.querySelectorAll('.footer-brand').forEach(el => el.textContent = g.brandName || 'Janette Amoatemaa Sarfo');
    
    const emailEls = document.querySelectorAll('#displayEmail');
    emailEls.forEach(el => el.textContent = g.contactEmail || 'janette.sarfo.design@gmail.com');

    const statusTextEl = document.querySelector('.status-text');
    if (statusTextEl && g.availabilityText) {
      statusTextEl.textContent = g.availabilityText;
    }

    const statusDotEl = document.querySelector('.status-dot');
    if (statusDotEl && g.isAvailable === false) {
      statusDotEl.style.backgroundColor = '#94A3B8';
      statusDotEl.style.boxShadow = 'none';
      statusDotEl.style.animation = 'none';
    } else if (statusDotEl) {
      statusDotEl.style.backgroundColor = '#22C55E';
      statusDotEl.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.2)';
      statusDotEl.style.animation = 'pulse-dot 2.2s infinite';
    }

    // Social Links
    const socialContainer = document.querySelector('.social-links-list');
    if (socialContainer && g.socials && g.socials.length > 0) {
      socialContainer.innerHTML = g.socials.map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-link">
          <span>${s.name}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      `).join('');
    }
  }

  // B. Hero
  function renderHero() {
    const h = portfolioData.hero || {};
    const badgeTextEl = document.querySelector('.hero-badge .badge-text');
    if (badgeTextEl && h.badgeText) badgeTextEl.textContent = h.badgeText;

    const headlineEl = document.querySelector('.hero-title');
    if (headlineEl && h.headline) {
      headlineEl.innerHTML = formatSerifHeadline(h.headline);
    }

    const leadEl = document.querySelector('.hero-lead');
    if (leadEl && h.leadText) leadEl.textContent = h.leadText;

    const portraitImg = document.querySelector('.hero-portrait-img');
    if (portraitImg && h.portraitImage) {
      portraitImg.src = h.portraitImage;
    }

    const floatSub = document.querySelector('.floating-sub');
    const floatTitle = document.querySelector('.floating-title');
    if (floatSub && h.floatingBadge?.subtitle) floatSub.textContent = h.floatingBadge.subtitle;
    if (floatTitle && h.floatingBadge?.title) floatTitle.textContent = h.floatingBadge.title;

    // Metrics
    const metricsEl = document.querySelector('.hero-metrics');
    if (metricsEl && h.metrics && h.metrics.length > 0) {
      metricsEl.innerHTML = h.metrics.map((m, idx) => `
        <div class="metric-item">
          <span class="metric-value">${m.value}</span>
          <span class="metric-label">${m.label}</span>
        </div>
        ${idx < h.metrics.length - 1 ? '<div class="metric-divider" aria-hidden="true"></div>' : ''}
      `).join('');
    }

    // Ribbon Track Marquee
    const ribbonTrack = document.querySelector('.ribbon-track');
    if (ribbonTrack && h.marqueeItems && h.marqueeItems.length > 0) {
      const itemsString = h.marqueeItems.map(item => `
        <span>${item}</span>
        <span class="ribbon-dot">•</span>
      `).join('');
      // Duplicate for infinite marquee effect
      ribbonTrack.innerHTML = itemsString + itemsString;
    }
  }

  function formatSerifHeadline(text) {
    if (!text.includes('people') && !text.includes('systems')) {
      return text;
    }
    return `I think deeply about <span class="title-serif italic">people</span>, <span class="title-serif">systems</span>, and <span class="title-serif italic accent-rose">experiences</span> — and craft thoughtful digital products.`;
  }

  // C. About
  function renderAbout() {
    const a = portfolioData.about || {};
    const aboutEyebrow = document.querySelector('#about .eyebrow-tag span:last-child');
    if (aboutEyebrow && a.eyebrow) aboutEyebrow.textContent = a.eyebrow;

    const aboutTitle = document.querySelector('#about .section-title');
    if (aboutTitle && a.title) {
      aboutTitle.innerHTML = a.title.replace('algorithmic clarity', '<span class="italic accent-navy">algorithmic clarity</span>');
    }

    const aboutSubtitle = document.querySelector('#about .section-subtitle');
    if (aboutSubtitle && a.subtitle) aboutSubtitle.textContent = a.subtitle;

    const cardHeadline = document.querySelector('.about-bio-card .card-headline');
    if (cardHeadline && a.headline) cardHeadline.textContent = a.headline;

    const goldBadge = document.querySelector('.about-bio-card .gold-badge-tiny');
    if (goldBadge && a.profileBadge) goldBadge.textContent = a.profileBadge;

    const paragraphs = a.bioParagraphs || [];
    const bioCard = document.querySelector('.about-bio-card');
    if (bioCard) {
      const existingParas = bioCard.querySelectorAll('.card-paragraph');
      existingParas.forEach((p, idx) => {
        if (paragraphs[idx]) p.textContent = paragraphs[idx];
      });
    }

    // Values List
    const valuesList = document.querySelector('.personal-values-list');
    if (valuesList && a.values && a.values.length > 0) {
      valuesList.innerHTML = a.values.map(v => `
        <div class="value-item">
          <span class="value-number">${v.num}</span>
          <div>
            <strong>${v.title}</strong>
            <p>${v.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // Pillars Stack
    const pillarsStack = document.querySelector('.about-pillars-stack');
    if (pillarsStack && a.pillars && a.pillars.length > 0) {
      pillarsStack.innerHTML = a.pillars.map((p, i) => {
        const bgClass = i === 0 ? 'navy-bg' : i === 1 ? 'rose-bg' : 'periwinkle-bg';
        const iconSvg = i === 0 
          ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
          : i === 1
          ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
          : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;

        const pillsHtml = (p.tags || []).map(t => `<span class="skill-pill">${t}</span>`).join('');

        return `
          <div class="pillar-card card">
            <div class="pillar-header">
              <div class="pillar-icon ${bgClass}" aria-hidden="true">${iconSvg}</div>
              <div>
                <h4 class="pillar-title">${p.title}</h4>
                <span class="pillar-subtitle">${p.subtitle}</span>
              </div>
            </div>
            <p class="pillar-desc">${p.desc}</p>
            <div class="pill-group">
              ${pillsHtml}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // D. Selected Works / Projects
  function renderProjects() {
    const projects = portfolioData.projects || [];
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    // Build Project Filter Tabs dynamically
    const filtersWrap = document.querySelector('.work-filters');
    if (filtersWrap) {
      const categoriesMap = new Map();
      categoriesMap.set('all', `All Case Studies (${projects.length})`);
      projects.forEach(p => {
        if (!categoriesMap.has(p.category)) {
          categoriesMap.set(p.category, p.categoryLabel || p.category);
        }
      });

      filtersWrap.innerHTML = Array.from(categoriesMap.entries()).map(([cat, label], idx) => `
        <button type="button" class="filter-btn ${idx === 0 ? 'active' : ''}" data-filter="${cat}" role="tab" aria-selected="${idx === 0}">${label}</button>
      `).join('');

      // Re-attach filter listeners
      setupFilterListeners();
    }

    // Render Cards
    container.innerHTML = projects.map(proj => {
      const swatchesHtml = (proj.palette || []).map(item => `
        <span class="palette-swatch" style="background-color: ${item.hex};" title="${item.name} (${item.hex})"></span>
      `).join('');

      const statsHtml = (proj.stats || []).map(s => `
        <div class="key-stat">
          <strong>${s.value}</strong>
          <span>${s.label}</span>
        </div>
      `).join('');

      return `
        <article class="project-card card" data-category="${proj.category}" id="project-${proj.id}" style="border-left: 4px solid ${proj.accentColor || '#17233C'};">
          <div class="project-visual-wrapper">
            <img 
              src="${proj.image}" 
              alt="${proj.name} UI mockup" 
              class="project-img" 
              loading="lazy"
              width="800"
              height="450"
            >
            <div class="project-overlay-badge">
              <span class="domain-tag">${proj.domainTag || 'Digital Product'}</span>
            </div>
          </div>

          <div class="project-details">
            <div class="project-meta-bar">
              <span class="project-client">${proj.client || ''}</span>
              <span class="meta-dot" aria-hidden="true">•</span>
              <span class="project-role">${proj.role || ''}</span>
            </div>

            <h3 class="project-name">${proj.name}</h3>
            <p class="project-tagline">${proj.tagline || ''}</p>

            <div class="project-palette-preview" title="${proj.paletteDesc || 'Visual Identity'}">
              ${swatchesHtml}
              <span class="palette-desc">${proj.paletteDesc || 'Palette'}</span>
            </div>

            <div class="project-key-stats">
              ${statsHtml}
            </div>

            <div class="project-actions">
              <button type="button" class="btn btn-primary open-case-study-btn" data-project="${proj.id}">
                <span>View Complete Case Study</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
              <button type="button" class="btn btn-ghost open-prototype-quickview" data-project="${proj.id}" aria-label="Quick preview of ${proj.name} design system">
                <span>Design Highlights</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Re-attach modal opener listeners
    setupProjectModalListeners();
  }

  // E. Philosophy
  function renderPhilosophy() {
    const phil = portfolioData.philosophy || {};
    const philTitle = document.querySelector('#philosophy .section-title');
    if (philTitle && phil.title) {
      philTitle.innerHTML = phil.title.replace('From ambiguity to intentional clarity', '<span class="italic accent-navy">From ambiguity to intentional clarity</span>');
    }

    const philSubtitle = document.querySelector('#philosophy .section-subtitle');
    if (philSubtitle && phil.subtitle) philSubtitle.textContent = phil.subtitle;

    const manifestoLabel = document.querySelector('.manifesto-label');
    const manifestoQuote = document.querySelector('.manifesto-quote');
    const manifestoAuthor = document.querySelector('.manifesto-author');
    if (manifestoLabel && phil.manifesto?.label) manifestoLabel.textContent = phil.manifesto.label;
    if (manifestoQuote && phil.manifesto?.quote) {
      manifestoQuote.innerHTML = `“When deciding between something visually impressive and something clear, <span class="highlight">choose clarity</span>. Visual identity must elevate human capability, never obscure it.”`;
    }
    if (manifestoAuthor && phil.manifesto?.author) manifestoAuthor.textContent = phil.manifesto.author;

    const stepsGrid = document.querySelector('.process-steps-grid');
    if (stepsGrid && phil.steps && phil.steps.length > 0) {
      stepsGrid.innerHTML = phil.steps.map(step => `
        <div class="process-step-card card">
          <div class="step-num-badge">${step.num}</div>
          <h3 class="step-title">${step.title}</h3>
          <p class="step-desc">${step.desc}</p>
          <ul class="step-checkmarks">
            ${(step.checks || []).map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
  }

  // F. Credentials
  function renderCredentials() {
    const cred = portfolioData.credentials || {};
    const credTitle = document.querySelector('#credentials .section-title');
    if (credTitle && cred.title) {
      credTitle.innerHTML = cred.title.replace('Tooling', '<span class="italic accent-rose">Tooling</span>');
    }

    // Timeline
    const timelineList = document.querySelector('.timeline-list');
    if (timelineList && cred.timeline && cred.timeline.length > 0) {
      timelineList.innerHTML = cred.timeline.map(item => `
        <div class="timeline-item card">
          <span class="timeline-year">${item.year}</span>
          <h4 class="timeline-role">${item.role}</h4>
          <p class="timeline-org">${item.org}</p>
          <p class="timeline-detail">${item.detail}</p>
        </div>
      `).join('');
    }

    // Skills
    const skillsCol = document.querySelector('.skills-column');
    if (skillsCol && cred.skills && cred.skills.length > 0) {
      const headingHtml = `<h3 class="column-heading"><span class="gold-sparkle" aria-hidden="true">✦</span> Craft &amp; Technical Capabilities</h3>`;
      const categoriesHtml = cred.skills.map(sc => `
        <div class="skill-category-card card">
          <h4 class="category-title">
            <span class="${sc.colorClass || 'bullet-navy'}" aria-hidden="true"></span> ${sc.title}
          </h4>
          <ul class="skills-badges">
            ${(sc.badges || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `).join('');

      skillsCol.innerHTML = headingHtml + categoriesHtml;
    }
  }

  // G. Section Visibility Toggles
  function renderVisibility() {
    const vis = portfolioData.sectionsVisibility || {};
    const sectionMap = {
      hero: document.getElementById('hero'),
      about: document.getElementById('about'),
      work: document.getElementById('work'),
      philosophy: document.getElementById('philosophy'),
      credentials: document.getElementById('credentials'),
      contact: document.getElementById('contact')
    };

    Object.keys(sectionMap).forEach(key => {
      const secEl = sectionMap[key];
      if (secEl) {
        if (vis[key] === false) {
          secEl.style.display = 'none';
        } else {
          secEl.style.display = '';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Project Filter Listeners
  // --------------------------------------------------------------------------
  function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (filterValue === 'all' || cardCategory === filterValue) {
            card.style.display = 'grid';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. Case Study Modal Engine
  // --------------------------------------------------------------------------
  const caseStudyModal = document.getElementById('caseStudyModal');
  const closeCaseStudyBtn = document.getElementById('closeCaseStudyBtn');
  const modalBodyContent = document.getElementById('modalBodyContent');
  const modalClientBadge = document.getElementById('modalClientBadge');

  function openCaseStudy(projectId) {
    if (!portfolioData?.projects) return;
    const study = portfolioData.projects.find(p => p.id === projectId);
    if (!study) return;

    if (modalClientBadge) {
      modalClientBadge.textContent = study.client || 'Client Project';
    }

    const swatchesHtml = (study.palette || []).map(item => `
      <div class="study-swatch-chip">
        <span class="study-swatch-circle" style="background-color: ${item.hex};"></span>
        <span>${item.name} (${item.hex})</span>
      </div>
    `).join('');

    const statsHtml = (study.stats || []).map(s => `
      <div class="study-meta-item">
        <strong>${s.label}</strong>
        <span>${s.value}</span>
      </div>
    `).join('');

    modalBodyContent.innerHTML = `
      <div class="study-hero-img-wrap">
        <img src="${study.image}" alt="${study.name}" class="study-hero-img">
      </div>

      <div class="study-meta-grid">
        <div class="study-meta-item">
          <strong>Domain</strong>
          <span>${study.categoryLabel || study.category}</span>
        </div>
        <div class="study-meta-item">
          <strong>My Role</strong>
          <span>${study.role || 'UI/UX Designer'}</span>
        </div>
        <div class="study-meta-item">
          <strong>Timeline</strong>
          <span>${study.timeline || 'Project Scope'}</span>
        </div>
        ${statsHtml}
      </div>

      <div class="study-tabs" role="tablist">
        <button type="button" class="study-tab-btn active" data-tab="overview">Overview &amp; Problem</button>
        <button type="button" class="study-tab-btn" data-tab="research">Research &amp; Insights</button>
        <button type="button" class="study-tab-btn" data-tab="system">Design System &amp; Tokens</button>
        <button type="button" class="study-tab-btn" data-tab="outcomes">Impact &amp; Results</button>
      </div>

      <div class="study-tab-pane active" id="pane-overview">
        <h3 class="study-heading">The Challenge &amp; Strategic Solution</h3>
        <p class="study-text"><strong>Problem Statement:</strong> ${study.overview?.problem || study.tagline || ''}</p>
        <div class="study-callout-box">
          <strong>The Solution Philosophy</strong>
          <p>${study.overview?.solution || ''}</p>
        </div>
      </div>

      <div class="study-tab-pane" id="pane-research">
        <h3 class="study-heading">Human-Centered Inquiry &amp; Findings</h3>
        <ul style="list-style: disc; margin-left: 20px; line-height: 1.8; color: var(--color-slate); font-size: 0.9375rem;">
          ${(study.research || []).map(r => `<li style="margin-bottom: 10px;">${r}</li>`).join('')}
        </ul>
      </div>

      <div class="study-tab-pane" id="pane-system">
        <h3 class="study-heading">Bespoke Visual Architecture</h3>
        <p class="study-text">${study.paletteDesc || 'Individual domain visual language'}</p>
        <div class="study-swatches-row">
          ${swatchesHtml}
        </div>
        <ul style="list-style: disc; margin-left: 20px; line-height: 1.8; color: var(--color-slate); font-size: 0.9375rem;">
          ${(study.systemDetails || []).map(s => `<li style="margin-bottom: 10px;">${s}</li>`).join('')}
        </ul>
      </div>

      <div class="study-tab-pane" id="pane-outcomes">
        <h3 class="study-heading">Measurable Impact &amp; Engineering Hand-off</h3>
        <ul style="list-style: disc; margin-left: 20px; line-height: 1.8; color: var(--color-slate); font-size: 0.9375rem;">
          ${(study.outcomes || []).map(o => `<li style="margin-bottom: 10px;">${o}</li>`).join('')}
        </ul>
      </div>
    `;

    // Modal Tabs Listener
    modalBodyContent.querySelectorAll('.study-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        modalBodyContent.querySelectorAll('.study-tab-btn').forEach(t => t.classList.remove('active'));
        modalBodyContent.querySelectorAll('.study-tab-pane').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const target = modalBodyContent.querySelector(`#pane-${tab.getAttribute('data-tab')}`);
        if (target) target.classList.add('active');
      });
    });

    caseStudyModal.classList.add('open');
    caseStudyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseStudy() {
    caseStudyModal.classList.remove('open');
    caseStudyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setupProjectModalListeners() {
    document.querySelectorAll('.open-case-study-btn, .open-prototype-quickview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-project');
        openCaseStudy(id);
      });
    });
  }

  if (closeCaseStudyBtn) closeCaseStudyBtn.addEventListener('click', closeCaseStudy);
  caseStudyModal?.addEventListener('click', (e) => {
    if (e.target === caseStudyModal) closeCaseStudy();
  });

  // --------------------------------------------------------------------------
  // 5. Resume Modal
  // --------------------------------------------------------------------------
  const resumeModal = document.getElementById('resumeModal');
  const openResumeBtn = document.getElementById('openResumeBtn');
  const mobileResumeBtn = document.getElementById('mobileResumeBtn');
  const closeResumeBtn = document.getElementById('closeResumeBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');
  const copyResumeLinkBtn = document.getElementById('copyResumeLinkBtn');

  function openResume() {
    resumeModal.classList.add('open');
    resumeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeResume() {
    resumeModal.classList.remove('open');
    resumeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
  if (mobileResumeBtn) mobileResumeBtn.addEventListener('click', openResume);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);
  resumeModal?.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResume();
  });
  if (printResumeBtn) printResumeBtn.addEventListener('click', () => window.print());
  if (copyResumeLinkBtn) {
    copyResumeLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href.split('#')[0] + '#credentials')
        .then(() => showToast('Direct link to qualifications copied to clipboard!'))
        .catch(() => showToast('Could not copy link.'));
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (caseStudyModal.classList.contains('open')) closeCaseStudy();
      if (resumeModal.classList.contains('open')) closeResume();
    }
  });

  // --------------------------------------------------------------------------
  // 6. Direct Copy Email & Toast Alerts
  // --------------------------------------------------------------------------
  const toastNotification = document.getElementById('toastNotification');
  const emailCopyCard = document.getElementById('emailCopyCard');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3600);
  }

  if (emailCopyCard) {
    emailCopyCard.addEventListener('click', () => {
      const email = portfolioData?.general?.contactEmail || 'janette.sarfo.design@gmail.com';
      navigator.clipboard.writeText(email)
        .then(() => showToast(`Copied ${email} to clipboard!`))
        .catch(() => showToast(`Email: ${email}`));
    });

    emailCopyCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        emailCopyCard.click();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Scroll Progress & Sticky Header
  // --------------------------------------------------------------------------
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const siteHeader = document.getElementById('siteHeader');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && scrollProgressBar) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgressBar.style.width = `${progress}%`;
    }
    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 8. Live Local Time (GMT - Ghana)
  // --------------------------------------------------------------------------
  const desktopTimeEl = document.getElementById('desktopLocalTime');
  const mobileTimeEl = document.getElementById('mobileLocalTime');

  function updateLocalTime() {
    const now = new Date();
    const options = {
      timeZone: portfolioData?.general?.timezone || 'Africa/Accra',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    try {
      const timeFormatter = new Intl.DateTimeFormat([], options);
      const timeStr = timeFormatter.format(now);
      if (desktopTimeEl) desktopTimeEl.textContent = `${timeStr} GMT`;
      if (mobileTimeEl) mobileTimeEl.textContent = `${timeStr} GMT`;
    } catch {
      const utc = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} GMT`;
      if (desktopTimeEl) desktopTimeEl.textContent = utc;
      if (mobileTimeEl) mobileTimeEl.textContent = utc;
    }
  }

  updateLocalTime();
  setInterval(updateLocalTime, 1000);

  // --------------------------------------------------------------------------
  // 9. Mobile Menu Toggle
  // --------------------------------------------------------------------------
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.classList.toggle('open');
      mobileDrawer.setAttribute('aria-hidden', isExpanded);
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. Contact Form
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = document.getElementById('userName');
      const userEmail = document.getElementById('userEmail');
      const userMessage = document.getElementById('userMessage');

      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('emailError');
      const messageError = document.getElementById('messageError');

      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';

      let isValid = true;
      if (!userName.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        isValid = false;
      }
      if (!userEmail.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }
      if (!userMessage.value.trim()) {
        messageError.textContent = 'Please write a brief message.';
        isValid = false;
      }

      if (isValid) {
        const submitBtn = document.getElementById('submitFormBtn');
        const orig = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending Message...</span>`;

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Message Sent Successfully ✓</span>`;
          submitBtn.style.backgroundColor = '#22C55E';
          showToast('Thank you! Your message has been prepared for Janette.');
          contactForm.reset();
          setTimeout(() => {
            submitBtn.innerHTML = orig;
            submitBtn.style.backgroundColor = '';
          }, 4000);
        }, 700);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 11. Initial Kickoff
  // --------------------------------------------------------------------------
  loadDataAndRender();
});
