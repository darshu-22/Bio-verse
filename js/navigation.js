'use strict';

class BioNavigation {
  constructor() {
    this.currentPage = 'homepage';
    this.activeSys = 'fullBody';
    this.pendingNavigation = null;

    this.bindNavEvents();
    this.bindSystemCards();
    this.bindExplorerNav();
    this.bindBodyLabels();
    this.handleScroll();
    this.bindSignInModal();
    this.checkSession();

    this.updateSidebarSelection(this.activeSys);
    this.updateInfoPanel(this.activeSys);
    window.addEventListener('bioSystemChanged', (e) => {
      const sys = e.detail.system;
      if (sys) {
        this.activeSys = sys;
        this.updateSidebarSelection(sys);
        this.updateInfoPanel(sys);
      }
    });

    if (window.initHeroViewer) {
      window.initHeroViewer();
    }
  }

  async checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        if (user) {
          window.currentUser = user;
          this.updateNavbarAuthUI();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  updateNavbarAuthUI() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    navActions.innerHTML = '';

    if (window.currentUser) {
      const greetingSpan = document.createElement('span');
      greetingSpan.className = 'user-greeting';
      greetingSpan.textContent = `Hi, ${window.currentUser.full_name.split(' ')[0]}`;

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn-glass btn-sm';
      logoutBtn.id = 'nav-logout-btn';
      logoutBtn.setAttribute('aria-label', 'Log out of your account');
      logoutBtn.textContent = 'Logout';

      navActions.appendChild(greetingSpan);
      navActions.appendChild(document.createTextNode(' '));
      navActions.appendChild(logoutBtn);
    } else {
      const signinBtn = document.createElement('button');
      signinBtn.className = 'btn-primary btn-sm';
      signinBtn.id = 'nav-signin-btn';
      signinBtn.setAttribute('aria-label', 'Sign in to your account');
      signinBtn.textContent = 'Sign In';

      navActions.appendChild(signinBtn);
    }
  }

  navigateTo(page) {
    if (page === 'explore' && !window.currentUser) {
      this.pendingNavigation = 'explore';
      const modal = document.getElementById('signin-modal');
      if (modal) {
        modal.classList.add('visible');
        this.clearAuthModalErrors();
        this.showAuthForm('signin');
      }
      return;
    }

    if (page !== 'homepage') {
      if (window.disposeHeroViewer) {
        window.disposeHeroViewer();
      }
    }

    const from = document.getElementById(this.currentPage === 'homepage' ? 'homepage' : 'explore-page');
    const to = document.getElementById(page === 'homepage' ? 'homepage' : 'explore-page');

    if (from) {
      from.style.opacity = '0';
      setTimeout(() => from.classList.remove('active'), 300);
    }

    if (to) {
      setTimeout(() => {
        to.classList.add('active');
        to.style.opacity = '1';
        if (page === 'homepage') {
          if (window.initHeroViewer) {
            window.initHeroViewer();
          }
        }
      }, 320);
    }

    this.currentPage = page;

    if (page === 'explore') {
      if (window.bioExplorer) {
        window.bioExplorer.switchSystem(this.activeSys);
      }
    }

    if (window.bioGestureController) {
      if (page === 'explore') {
        if (window.bioGestureController.isActive) {
          window.bioGestureController.start();
        }
      } else {
        window.bioGestureController.stop();
      }
    }
  }

  bindNavEvents() {
    const exploreBtn = document.getElementById('explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        this.navigateTo('explore');
      });
    }

    const systemsExploreBtn = document.getElementById('systems-explore-btn');
    if (systemsExploreBtn) {
      systemsExploreBtn.addEventListener('click', () => {
        this.navigateTo('explore');
      });
    }

    const navExploreLink = document.getElementById('nav-explore-link');
    if (navExploreLink) {
      navExploreLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('explore');
      });
    }

    const backBtn = document.getElementById('back-home-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.navigateTo('homepage');
      });
    }

    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', () => {
        this.navigateTo('homepage');
      });
    }

    const navHome = document.getElementById('nav-home');
    if (navHome) {
      navHome.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('homepage');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const navAbout = document.getElementById('nav-about');
    if (navAbout) {
      navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('homepage');
        const aboutSec = document.getElementById('about-section');
        if (aboutSec) {
          aboutSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
      learnMoreBtn.addEventListener('click', () => {
        const aboutSec = document.getElementById('about-section');
        if (aboutSec) {
          aboutSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      navActions.addEventListener('click', async (e) => {
        if (e.target.id === 'nav-signin-btn') {
          const modal = document.getElementById('signin-modal');
          if (modal) {
            modal.classList.add('visible');
            this.clearAuthModalErrors();
            this.showAuthForm('signin');
          }
        } else if (e.target.id === 'nav-logout-btn') {
          try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
              window.currentUser = null;
              this.updateNavbarAuthUI();
              if (this.currentPage === 'explore') {
                this.navigateTo('homepage');
              }
            }
          } catch (err) {
            console.error(err);
          }
        }
      });
    }
  }

  bindSystemCards() {
    const sysItems = document.querySelectorAll('.sidebar-system-item');
    sysItems.forEach((item) => {
      item.addEventListener('click', () => {
        const sys = item.getAttribute('data-system');
        if (sys) {
          this.activeSys = sys;
          window._activeBioSystem = sys;
          this.updateSidebarSelection(sys);
          this.updateInfoPanel(sys);
          if (window.bioExplorer) window.bioExplorer.switchSystem(sys);
          if (window.bioHierarchy) window.bioHierarchy.render(sys);
        }
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
      });
    });
  }

  updateSidebarSelection(systemKey) {
    document.querySelectorAll('.sidebar-system-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-system') === systemKey);
    });
  }

  updateInfoPanel(systemKey) {
    let data;
    if (systemKey === 'fullBody') {
      data = {
        name: 'Full Body',
        stat1: { value: '—', label: '' },
        stat2: { value: '—', label: '' }
      };
    } else {
      data = (typeof BioAnatomyData !== 'undefined' && BioAnatomyData.systems[systemKey])
        ? BioAnatomyData.systems[systemKey]
        : (BioSystemsData && BioSystemsData.systems[systemKey]);
    }
    if (!data) return;

    const stat1Val = document.getElementById('info-stat1-value');
    const stat1Label = document.getElementById('info-stat1-label');
    const stat2Val = document.getElementById('info-stat2-value');
    const stat2Label = document.getElementById('info-stat2-label');

    if (stat1Val) stat1Val.textContent = data.stat1?.value || '';
    if (stat1Label) stat1Label.textContent = data.stat1?.label || '';
    if (stat2Val) stat2Val.textContent = data.stat2?.value || '';
    if (stat2Label) stat2Label.textContent = data.stat2?.label || '';

    const label = document.getElementById('active-system-label');
    if (label) label.textContent = data.name;
    const hud = document.getElementById('hud-system');
    if (hud) hud.textContent = data.name;
  }

  bindExplorerNav() {
    const resetBtn = document.getElementById('reset-view-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.bioExplorer) window.bioExplorer.resetView();
      });
    }

    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          fsBtn.textContent = '⛶ Exit Full';
        } else {
          document.exitFullscreen();
          fsBtn.textContent = '⛶ Fullscreen';
        }
      });
    }

    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValue = document.getElementById('opacity-value');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', () => {
        const val = opacitySlider.value;
        if (opacityValue) opacityValue.textContent = `${val}%`;
        if (window.bioExplorer) window.bioExplorer.setOpacity(parseInt(val, 10));
      });
    }
  }

  bindBodyLabels() {
    const labels = document.querySelectorAll('.body-label');
    labels.forEach((label) => {
      label.addEventListener('click', () => {
        const system = label.id.replace('label-', '');
        const systemMap = {
          brain: 'nervous',
          heart: 'cardiovascular',
          lungs: 'respiratory',
          skeletal: 'skeletal',
        };
        const sys = systemMap[system] || system;
        this.activeSys = sys;
        window._activeBioSystem = sys;
        this.navigateTo('explore');
        setTimeout(() => {
          if (window.bioExplorer) window.bioExplorer.switchSystem(sys);
          this.updateInfoPanel(sys);
          this.updateSidebarSelection(sys);
        }, 400);
      });

      label.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          label.click();
        }
      });
    });
  }

  showAuthForm(type) {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const tabSigninBtn = document.getElementById('tab-signin-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');

    if (type === 'signin') {
      if (signinForm) signinForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
      tabSigninBtn?.classList.add('active');
      tabSignupBtn?.classList.remove('active');
    } else {
      if (signinForm) signinForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'block';
      tabSigninBtn?.classList.remove('active');
      tabSignupBtn?.classList.add('active');
    }
  }

  clearAuthModalErrors() {
    const errorIds = [
      'signin-email-error', 'signin-password-error',
      'signup-name-error', 'signup-email-error',
      'signup-password-error', 'signup-confirm-password-error'
    ];
    errorIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    const successMsg = document.getElementById('signin-success-msg');
    if (successMsg) {
      successMsg.textContent = '';
      successMsg.style.display = 'none';
    }
  }

  bindSignInModal() {
    const modal = document.getElementById('signin-modal');
    const closeBtn = document.getElementById('signin-close-btn');

    const tabSigninBtn = document.getElementById('tab-signin-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');

    if (tabSigninBtn) {
      tabSigninBtn.addEventListener('click', () => {
        this.clearAuthModalErrors();
        this.showAuthForm('signin');
      });
    }

    if (tabSignupBtn) {
      tabSignupBtn.addEventListener('click', () => {
        this.clearAuthModalErrors();
        this.showAuthForm('signup');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('visible');
        }
      });
    }

    const toggleSigninPwdBtn = document.getElementById('toggle-signin-pwd-btn');
    const signinPwdInput = document.getElementById('signin-password');
    if (toggleSigninPwdBtn && signinPwdInput) {
      toggleSigninPwdBtn.addEventListener('click', () => {
        if (signinPwdInput.type === 'password') {
          signinPwdInput.type = 'text';
          toggleSigninPwdBtn.textContent = '🔒';
        } else {
          signinPwdInput.type = 'password';
          toggleSigninPwdBtn.textContent = '👁️';
        }
      });
    }

    const toggleSignupPwdBtn = document.getElementById('toggle-signup-pwd-btn');
    const signupPwdInput = document.getElementById('signup-password');
    if (toggleSignupPwdBtn && signupPwdInput) {
      toggleSignupPwdBtn.addEventListener('click', () => {
        if (signupPwdInput.type === 'password') {
          signupPwdInput.type = 'text';
          toggleSignupPwdBtn.textContent = '🔒';
        } else {
          signupPwdInput.type = 'password';
          toggleSignupPwdBtn.textContent = '👁️';
        }
      });
    }

    const toggleSignupConfpwdBtn = document.getElementById('toggle-signup-confpwd-btn');
    const signupConfpwdInput = document.getElementById('signup-confirm-password');
    if (toggleSignupConfpwdBtn && signupConfpwdInput) {
      toggleSignupConfpwdBtn.addEventListener('click', () => {
        if (signupConfpwdInput.type === 'password') {
          signupConfpwdInput.type = 'text';
          toggleSignupConfpwdBtn.textContent = '🔒';
        } else {
          signupConfpwdInput.type = 'password';
          toggleSignupConfpwdBtn.textContent = '👁️';
        }
      });
    }

    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
      signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.clearAuthModalErrors();

        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        const emailError = document.getElementById('signin-email-error');
        const passwordError = document.getElementById('signin-password-error');
        const submitBtn = document.getElementById('signin-submit-btn');

        let valid = true;
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email) {
          if (emailError) emailError.textContent = 'Email is required';
          valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (emailError) emailError.textContent = 'Invalid email address';
          valid = false;
        }

        if (!password) {
          if (passwordError) passwordError.textContent = 'Password is required';
          valid = false;
        }

        if (!valid) return;

        if (submitBtn) submitBtn.classList.add('loading');

        try {
          const res = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (res.ok) {
            const user = await res.json();
            window.currentUser = user;
            this.updateNavbarAuthUI();
            if (modal) modal.classList.remove('visible');
            if (this.pendingNavigation) {
              const target = this.pendingNavigation;
              this.pendingNavigation = null;
              this.navigateTo(target);
            }
          } else {
            const data = await res.json();
            if (emailError) emailError.textContent = data.error || 'Authentication failed';
          }
        } catch (err) {
          console.error(err);
          if (emailError) emailError.textContent = 'Server connection error';
        } finally {
          if (submitBtn) submitBtn.classList.remove('loading');
        }
      });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.clearAuthModalErrors();

        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');

        const nameError = document.getElementById('signup-name-error');
        const emailError = document.getElementById('signup-email-error');
        const passwordError = document.getElementById('signup-password-error');
        const confirmPasswordError = document.getElementById('signup-confirm-password-error');
        const submitBtn = document.getElementById('signup-submit-btn');

        let valid = true;
        const full_name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (!full_name) {
          if (nameError) nameError.textContent = 'Name is required';
          valid = false;
        }

        if (!email) {
          if (emailError) emailError.textContent = 'Email is required';
          valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (emailError) emailError.textContent = 'Invalid email address';
          valid = false;
        }

        if (!password) {
          if (passwordError) passwordError.textContent = 'Password is required';
          valid = false;
        } else if (password.length < 6) {
          if (passwordError) passwordError.textContent = 'Password must be at least 6 characters';
          valid = false;
        }

        if (!confirmPassword) {
          if (confirmPasswordError) confirmPasswordError.textContent = 'Please confirm password';
          valid = false;
        } else if (password !== confirmPassword) {
          if (confirmPasswordError) confirmPasswordError.textContent = 'Passwords do not match';
          valid = false;
        }

        if (!valid) return;

        if (submitBtn) submitBtn.classList.add('loading');

        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password, confirmPassword })
          });

          if (res.ok) {
            signupForm.reset();
            this.showAuthForm('signin');
            const successMsg = document.getElementById('signin-success-msg');
            if (successMsg) {
              successMsg.textContent = 'Account created successfully. Please sign in.';
              successMsg.style.display = 'block';
            }
          } else {
            const data = await res.json();
            if (emailError) emailError.textContent = data.error || 'Registration failed';
          }
        } catch (err) {
          console.error(err);
          if (emailError) emailError.textContent = 'Server connection error';
        } finally {
          if (submitBtn) submitBtn.classList.remove('loading');
        }
      });
    }
  }

  handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', BioUtils.debounce(() => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, 50));
  }
}

window.BioNavigation = BioNavigation;
