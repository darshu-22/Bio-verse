







'use strict';




const SchoolDB = {
  PREFIX: 'bvx_school_',

  get(key) {
    try {
      return JSON.parse(localStorage.getItem(this.PREFIX + key));
    } catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  
  getUsers() { return this.get('users') || []; },
  saveUsers(u) { this.set('users', u); },

  getClasses() { return this.get('classes') || []; },
  saveClasses(c) { this.set('classes', c); },

  getAssignments() { return this.get('assignments') || []; },
  saveAssignments(a) { this.set('assignments', a); },

  getSession() { return this.get('session') || null; },
  saveSession(s) { this.set('session', s); },
  clearSession() { this.remove('session'); },

  
  seedIfEmpty() {
    if (this.get('seeded')) return;

    const users = [
      {
        id: 'u1', role: 'teacher', name: 'Dr. Sarah Chen',
        email: 'teacher@bioverse.edu', password: 'teach123',
        classIds: ['c1', 'c2', 'c3']
      },
      {
        id: 'u2', role: 'student', name: 'Arjun Mehta',
        email: 'student@bioverse.edu', password: 'study123',
        classIds: ['c1'],
        progress: {
          skeletal: 85, muscular: 72, nervous: 60,
          circulatory: 90, digestive: 45, respiratory: 55
        },
        quizHistory: [
          { system: 'skeletal', score: 8, total: 10, date: '2026-06-20' },
          { system: 'muscular', score: 7, total: 10, date: '2026-06-21' },
          { system: 'circulatory', score: 9, total: 10, date: '2026-06-22' },
          { system: 'nervous', score: 6, total: 10, date: '2026-06-23' },
        ],
        achievements: ['first_quiz', 'perfect_score', 'system_master'],
        xp: 1240
      },
      {
        id: 'u3', role: 'student', name: 'Priya Sharma',
        email: 'priya@bioverse.edu', password: 'study456',
        classIds: ['c1', 'c2'],
        progress: {
          skeletal: 95, muscular: 88, nervous: 75,
          circulatory: 82, digestive: 60, respiratory: 70
        },
        quizHistory: [
          { system: 'skeletal', score: 10, total: 10, date: '2026-06-18' },
          { system: 'muscular', score: 9, total: 10, date: '2026-06-19' },
          { system: 'nervous', score: 8, total: 10, date: '2026-06-22' },
        ],
        achievements: ['first_quiz', 'perfect_score', 'system_master', 'streak_7', 'top_student'],
        xp: 2100
      },
      {
        id: 'u4', role: 'student', name: 'Rohan Das',
        email: 'rohan@bioverse.edu', password: 'study789',
        classIds: ['c1'],
        progress: {
          skeletal: 60, muscular: 45, nervous: 35,
          circulatory: 55, digestive: 25, respiratory: 30
        },
        quizHistory: [
          { system: 'skeletal', score: 6, total: 10, date: '2026-06-21' },
          { system: 'muscular', score: 5, total: 10, date: '2026-06-23' },
        ],
        achievements: ['first_quiz'],
        xp: 480
      }
    ];

    const classes = [
      {
        id: 'c1', name: 'Grade 10 — Biology', teacherId: 'u1',
        icon: '🧬', iconClass: 'bio',
        studentIds: ['u2', 'u3', 'u4'],
        subject: 'Biology', schedule: 'Mon/Wed/Fri 9:00 AM'
      },
      {
        id: 'c2', name: 'Grade 11 — Anatomy', teacherId: 'u1',
        icon: '🫀', iconClass: 'med',
        studentIds: ['u3'],
        subject: 'Anatomy', schedule: 'Tue/Thu 10:30 AM'
      },
      {
        id: 'c3', name: 'Grade 9 — Life Science', teacherId: 'u1',
        icon: '🌿', iconClass: 'sci',
        studentIds: [],
        subject: 'Life Science', schedule: 'Mon/Wed 2:00 PM'
      }
    ];

    const assignments = [
      {
        id: 'a1', classId: 'c1', teacherId: 'u1',
        title: 'Skeletal System Quiz', system: 'skeletal',
        type: 'quiz', due: '2026-06-28', status: 'active',
        completions: { u2: true, u3: true, u4: false }
      },
      {
        id: 'a2', classId: 'c1', teacherId: 'u1',
        title: 'Circulatory System — Explore & Report', system: 'circulatory',
        type: 'explore', due: '2026-07-02', status: 'active',
        completions: { u2: false, u3: false, u4: false }
      },
      {
        id: 'a3', classId: 'c2', teacherId: 'u1',
        title: 'Nervous System Deep Dive', system: 'nervous',
        type: 'quiz', due: '2026-06-25', status: 'overdue',
        completions: { u3: true }
      },
      {
        id: 'a4', classId: 'c1', teacherId: 'u1',
        title: 'Muscular System Identification', system: 'muscular',
        type: 'explore', due: '2026-07-10', status: 'active',
        completions: {}
      }
    ];

    this.saveUsers(users);
    this.saveClasses(classes);
    this.saveAssignments(assignments);
    this.set('seeded', true);
  }
};




const ACHIEVEMENTS = [
  { id: 'first_quiz',    icon: '🎯', name: 'First Quiz' },
  { id: 'perfect_score', icon: '💯', name: 'Perfect Score' },
  { id: 'system_master', icon: '🏆', name: 'System Master' },
  { id: 'streak_7',      icon: '🔥', name: '7-Day Streak' },
  { id: 'top_student',   icon: '⭐', name: 'Top Student' },
  { id: 'explorer',      icon: '🔭', name: 'Explorer' },
  { id: 'neet_ready',    icon: '🩺', name: 'NEET Ready' },
  { id: 'anatomy_ace',   icon: '🧠', name: 'Anatomy Ace' },
];

const SYSTEM_NAMES = {
  skeletal: 'Skeletal System',
  muscular: 'Muscular System',
  nervous: 'Nervous System',
  circulatory: 'Circulatory System',
  digestive: 'Digestive System',
  respiratory: 'Respiratory System',
};




class SchoolPlatform {
  constructor() {
    SchoolDB.seedIfEmpty();

    this.currentUser = null;
    this.currentView = 'overview'; 

    
    this.authOverlay = document.getElementById('school-auth-overlay');
    this.dashOverlay = document.getElementById('school-dashboard-overlay');
    this.authRole = 'student'; 

    this._buildAuthOverlay();
    this._buildDashOverlay();
    this._bindNavBtn();

    
    const saved = SchoolDB.getSession();
    if (saved) {
      const users = SchoolDB.getUsers();
      const user = users.find(u => u.id === saved.userId);
      if (user) {
        this.currentUser = user;
        this._showDashboard();
      }
    }
  }

  


  _bindNavBtn() {
    const btn = document.getElementById('school-platform-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.currentUser) {
          this._showDashboard();
        } else {
          this._showAuth();
        }
      });
    }

    
    document.getElementById('nav-login-btn')?.addEventListener('click', () => this._showAuth());
    document.getElementById('nav-signup-btn')?.addEventListener('click', () => {
      this._showAuth();
      
      setTimeout(() => {
        document.getElementById('auth-switch-signup-link')?.click();
      }, 100);
    });
  }

  


  _buildAuthOverlay() {
    if (!this.authOverlay) return;

    this.authOverlay.innerHTML = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
        <button class="auth-close-btn" id="auth-close-btn" aria-label="Close">✕</button>

        <div class="auth-logo">
          <div class="auth-logo-icon">🧬</div>
          <div class="auth-logo-text">BioVerse <span>X</span></div>
        </div>

        <div id="auth-title-section">
          <div class="auth-title" id="auth-dialog-title">Sign in to your account</div>
          <div class="auth-subtitle">Access your personalized anatomy learning platform</div>
        </div>

        <div class="auth-role-tabs" id="auth-role-tabs">
          <button class="auth-role-tab active" id="auth-tab-student" data-role="student" aria-pressed="true">
            🎓 Student
          </button>
          <button class="auth-role-tab" id="auth-tab-teacher" data-role="teacher" aria-pressed="false">
            📚 Teacher
          </button>
        </div>

        <div class="auth-error-msg" id="auth-error-msg"></div>

        <form class="auth-form" id="auth-form" autocomplete="off">
          <div class="auth-field-group" id="auth-name-group" style="display:none;">
            <label class="auth-label" for="auth-name-input">Full Name</label>
            <input class="auth-input" id="auth-name-input" type="text" placeholder="Your full name" />
          </div>
          <div class="auth-field-group">
            <label class="auth-label" for="auth-email-input">Email Address</label>
            <input class="auth-input" id="auth-email-input" type="email" placeholder="your@email.com" autocomplete="email" />
          </div>
          <div class="auth-field-group">
            <label class="auth-label" for="auth-password-input">Password</label>
            <input class="auth-input" id="auth-password-input" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <button class="auth-submit-btn" id="auth-submit-btn" type="submit">Sign In</button>
        </form>

        <div class="auth-switch-link">
          Don't have an account? <a id="auth-switch-signup-link">Sign up</a>
        </div>

        <div class="auth-demo-notice">
          <strong>Demo accounts:</strong><br/>
          Teacher: teacher@bioverse.edu / teach123<br/>
          Student: student@bioverse.edu / study123
        </div>
      </div>
    `;

    this._bindAuthEvents();
  }

  _bindAuthEvents() {
    document.getElementById('auth-close-btn')?.addEventListener('click', () => this._hideAuth());

    this.authOverlay.addEventListener('click', (e) => {
      if (e.target === this.authOverlay) this._hideAuth();
    });

    
    document.querySelectorAll('.auth-role-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-role-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');
        this.authRole = tab.dataset.role;
      });
    });

    
    let isSignup = false;
    document.getElementById('auth-switch-signup-link')?.addEventListener('click', () => {
      isSignup = !isSignup;
      const nameGroup = document.getElementById('auth-name-group');
      const title = document.getElementById('auth-dialog-title');
      const submitBtn = document.getElementById('auth-submit-btn');
      const switchLink = document.getElementById('auth-switch-signup-link');
      const switchLinkParent = switchLink?.parentElement;

      if (nameGroup) nameGroup.style.display = isSignup ? 'flex' : 'none';
      if (title) title.textContent = isSignup ? 'Create your account' : 'Sign in to your account';
      if (submitBtn) submitBtn.textContent = isSignup ? 'Create Account' : 'Sign In';
      if (switchLink) switchLink.textContent = isSignup ? 'Sign in instead' : 'Sign up';
      if (switchLinkParent) switchLinkParent.firstChild.textContent = isSignup ? 'Already have an account? ' : "Don't have an account? ";
    });

    
    document.getElementById('auth-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email-input')?.value?.trim();
      const password = document.getElementById('auth-password-input')?.value?.trim();
      const name = document.getElementById('auth-name-input')?.value?.trim();
      const isSignupMode = document.getElementById('auth-submit-btn')?.textContent?.includes('Create');

      this._handleAuth(email, password, name, isSignupMode);
    });
  }

  _handleAuth(email, password, name, isSignup) {
    const errEl = document.getElementById('auth-error-msg');
    const clearErr = () => { if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); } };
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); } };

    clearErr();

    const users = SchoolDB.getUsers();

    if (isSignup) {
      if (!name) return showErr('Please enter your full name.');
      if (!email) return showErr('Please enter an email address.');
      if (!password || password.length < 6) return showErr('Password must be at least 6 characters.');
      if (users.find(u => u.email === email)) return showErr('An account with this email already exists.');

      const newUser = {
        id: 'u' + Date.now(),
        role: this.authRole,
        name,
        email,
        password,
        classIds: [],
        progress: this.authRole === 'student' ? {
          skeletal: 0, muscular: 0, nervous: 0,
          circulatory: 0, digestive: 0, respiratory: 0
        } : undefined,
        quizHistory: this.authRole === 'student' ? [] : undefined,
        achievements: [],
        xp: 0
      };

      users.push(newUser);
      SchoolDB.saveUsers(users);
      this.currentUser = newUser;
    } else {
      if (!email || !password) return showErr('Please fill in all fields.');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return showErr('Invalid email or password.');
      this.currentUser = user;
    }

    SchoolDB.saveSession({ userId: this.currentUser.id });
    this._hideAuth();
    this._showDashboard();
    this._showDashToast(`Welcome back, ${this.currentUser.name.split(' ')[0]}! 👋`);
  }

  _showAuth() {
    if (this.authOverlay) this.authOverlay.classList.add('visible');
  }

  _hideAuth() {
    if (this.authOverlay) this.authOverlay.classList.remove('visible');
  }

  


  _buildDashOverlay() {
    if (!this.dashOverlay) return;
    
  }

  _showDashboard() {
    if (!this.currentUser || !this.dashOverlay) return;
    this.dashOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';

    if (this.currentUser.role === 'teacher') {
      this._renderTeacherDashboard();
    } else {
      this._renderStudentDashboard();
    }
  }

  _hideDashboard() {
    if (this.dashOverlay) this.dashOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  


  _renderTeacherDashboard() {
    const classes = SchoolDB.getClasses().filter(c => c.teacherId === this.currentUser.id);
    const assignments = SchoolDB.getAssignments().filter(a => a.teacherId === this.currentUser.id);
    const allUsers = SchoolDB.getUsers();
    const students = allUsers.filter(u => u.role === 'student');

    
    const totalStudents = [...new Set(classes.flatMap(c => c.studentIds))].length;
    const completedAssignments = assignments.reduce((sum, a) => sum + Object.values(a.completions || {}).filter(Boolean).length, 0);
    const totalPossibleCompletions = assignments.reduce((sum, a) => {
      const cls = classes.find(c => c.id === a.classId);
      return sum + (cls?.studentIds?.length || 0);
    }, 0);
    const avgCompletion = totalPossibleCompletions > 0
      ? Math.round((completedAssignments / totalPossibleCompletions) * 100) : 0;

    this.dashOverlay.innerHTML = `
      <div class="dash-topbar">
        <div class="dash-logo">🧬 BioVerse <span>X</span></div>
        <div class="dash-topbar-divider"></div>
        <span class="dash-role-badge teacher">Teacher</span>
        <div class="dash-topbar-spacer"></div>
        <div class="dash-user-info">
          <div class="dash-avatar teacher-av">${this._initials(this.currentUser.name)}</div>
          <span class="dash-username">${this.currentUser.name}</span>
        </div>
        <button class="dash-back-btn" id="dash-back-to-app">← Back to App</button>
        <button class="dash-logout-btn" id="dash-logout-btn">Sign Out</button>
      </div>

      <div class="dash-body">
        <!-- Sidebar -->
        <nav class="dash-sidebar" aria-label="Dashboard navigation">
          <div class="dash-sidebar-section">Overview</div>
          <div class="dash-nav-item active" data-tab="overview" id="tnav-overview">
            <span class="dash-nav-icon">📊</span><span>Dashboard</span>
          </div>
          <div class="dash-nav-item" data-tab="classes" id="tnav-classes">
            <span class="dash-nav-icon">🏫</span><span>My Classes</span>
          </div>

          <div class="dash-sidebar-section">Teaching</div>
          <div class="dash-nav-item" data-tab="assignments" id="tnav-assignments">
            <span class="dash-nav-icon">📝</span><span>Assignments</span>
          </div>
          <div class="dash-nav-item" data-tab="students" id="tnav-students">
            <span class="dash-nav-icon">👥</span><span>Students</span>
          </div>
          <div class="dash-nav-item" data-tab="reports" id="tnav-reports">
            <span class="dash-nav-icon">📈</span><span>Reports</span>
          </div>
          <div class="dash-nav-item" data-tab="quizzes" id="tnav-quizzes">
            <span class="dash-nav-icon">🧩</span><span>Quiz Tracking</span>
          </div>
        </nav>

        <!-- Main -->
        <main class="dash-main" id="teacher-main">

          <!-- OVERVIEW TAB -->
          <div class="dash-tab-panel active" id="tab-overview">
            <div class="dash-page-header" style="display:flex;align-items:flex-end;justify-content:space-between;">
              <div>
                <div class="dash-page-title">Good morning, ${this.currentUser.name.split(' ')[0]}! 👋</div>
                <div class="dash-page-subtitle">Here's what's happening across your classes today.</div>
              </div>
            </div>

            <div class="dash-stats-row">
              <div class="dash-stat-card">
                <div class="dash-stat-label">Total Classes</div>
                <div class="dash-stat-value">${classes.length}</div>
                <div class="dash-stat-change">↑ Active this semester</div>
              </div>
              <div class="dash-stat-card">
                <div class="dash-stat-label">Total Students</div>
                <div class="dash-stat-value">${totalStudents}</div>
                <div class="dash-stat-change">↑ Enrolled</div>
              </div>
              <div class="dash-stat-card">
                <div class="dash-stat-label">Assignments</div>
                <div class="dash-stat-value">${assignments.length}</div>
                <div class="dash-stat-change">↑ ${assignments.filter(a=>a.status==='active').length} active</div>
              </div>
              <div class="dash-stat-card">
                <div class="dash-stat-label">Avg Completion</div>
                <div class="dash-stat-value">${avgCompletion}%</div>
                <div class="dash-stat-change ${avgCompletion >= 60 ? '' : 'down'}">
                  ${avgCompletion >= 60 ? '↑ On track' : '↓ Needs attention'}
                </div>
              </div>
            </div>

            <div class="dash-grid-2">
              <div class="dash-card">
                <div class="dash-card-title">🏫 Recent Classes</div>
                <div class="class-list">
                  ${classes.slice(0, 3).map(cls => `
                    <div class="class-item">
                      <div class="class-icon ${cls.iconClass}">${cls.icon}</div>
                      <div class="class-info">
                        <div class="class-name">${cls.name}</div>
                        <div class="class-meta">${cls.studentIds.length} students · ${cls.schedule}</div>
                      </div>
                      <span class="class-badge">${cls.subject}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="dash-card">
                <div class="dash-card-title">📝 Recent Assignments</div>
                <div class="assignment-list">
                  ${assignments.slice(0, 4).map(a => {
                    const cls = classes.find(c => c.id === a.classId);
                    const done = Object.values(a.completions || {}).filter(Boolean).length;
                    const total = cls?.studentIds?.length || 0;
                    return `
                      <div class="assignment-item">
                        <div class="assignment-dot ${a.status}"></div>
                        <div class="assignment-title">${a.title}</div>
                        <div class="assignment-due">${done}/${total}</div>
                        <span class="assignment-status ${a.status}">${a.status}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Class progress breakdown -->
            <div class="dash-section-title">📊 Class System Coverage</div>
            <div class="dash-card">
              <div class="progress-row">
                ${Object.entries(SYSTEM_NAMES).map(([key, name]) => {
                  const pct = this._avgSystemProgress(students, key);
                  return `
                    <div class="progress-item">
                      <div class="progress-label-row">
                        <span class="progress-label">${name}</span>
                        <span class="progress-pct">${pct}%</span>
                      </div>
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width:${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- CLASSES TAB -->
          <div class="dash-tab-panel" id="tab-classes">
            <div class="dash-page-header" style="display:flex;align-items:flex-end;justify-content:space-between;">
              <div>
                <div class="dash-page-title">My Classes</div>
                <div class="dash-page-subtitle">Manage your class roster and schedules.</div>
              </div>
              <div class="dash-header-actions">
                <button class="dash-btn-primary" id="create-class-btn">+ New Class</button>
              </div>
            </div>
            <div class="class-list" id="full-class-list">
              ${classes.map(cls => {
                const clsStudents = allUsers.filter(u => cls.studentIds.includes(u.id));
                return `
                  <div class="class-item">
                    <div class="class-icon ${cls.iconClass}">${cls.icon}</div>
                    <div class="class-info">
                      <div class="class-name">${cls.name}</div>
                      <div class="class-meta">${cls.studentIds.length} students · ${cls.schedule} · ${cls.subject}</div>
                    </div>
                    <div class="class-actions">
                      <span class="class-badge">${cls.subject}</span>
                      <button class="dash-btn-ghost" onclick="window.bioSchool._viewClass('${cls.id}')">View →</button>
                    </div>
                  </div>
                `;
              }).join('')}
              ${classes.length === 0 ? '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:2rem;">No classes yet. Create one!</div>' : ''}
            </div>
          </div>

          <!-- ASSIGNMENTS TAB -->
          <div class="dash-tab-panel" id="tab-assignments">
            <div class="dash-page-header" style="display:flex;align-items:flex-end;justify-content:space-between;">
              <div>
                <div class="dash-page-title">Assignments</div>
                <div class="dash-page-subtitle">Create and track student assignments.</div>
              </div>
              <div class="dash-header-actions">
                <button class="dash-btn-primary" id="create-assignment-btn">+ New Assignment</button>
              </div>
            </div>
            <div class="dash-card">
              <div class="assignment-list">
                ${assignments.map(a => {
                  const cls = classes.find(c => c.id === a.classId);
                  const done = Object.values(a.completions || {}).filter(Boolean).length;
                  const total = cls?.studentIds?.length || 0;
                  return `
                    <div class="assignment-item">
                      <div class="assignment-dot ${a.status}"></div>
                      <div style="display:flex;flex-direction:column;gap:0.15rem;flex:1;">
                        <div class="assignment-title">${a.title}</div>
                        <div style="font-size:0.75rem;color:rgba(255,255,255,0.3);">${cls?.name || ''} · Due: ${a.due}</div>
                      </div>
                      <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);">
                        ${done}/${total} completed
                      </div>
                      <span class="assignment-status ${a.status}">${a.status}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- STUDENTS TAB -->
          <div class="dash-tab-panel" id="tab-students">
            <div class="dash-page-header">
              <div class="dash-page-title">Students</div>
              <div class="dash-page-subtitle">Track individual student progress and engagement.</div>
            </div>
            <div class="dash-card" style="overflow-x:auto;">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Avg Progress</th>
                    <th>Quizzes</th>
                    <th>Top System</th>
                    <th>XP</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => {
                    const avgProg = this._studentAvgProgress(s);
                    const quizCount = (s.quizHistory || []).length;
                    const topSystem = this._topSystem(s);
                    const avgScore = this._studentAvgQuizScore(s);
                    const scoreClass = avgScore >= 80 ? 'high' : avgScore >= 60 ? 'mid' : 'low';
                    const cls = classes.find(c => c.studentIds.includes(s.id));
                    return `
                      <tr>
                        <td>
                          <div class="student-name-cell">
                            <div class="student-mini-avatar">${this._initials(s.name)}</div>
                            ${s.name}
                          </div>
                        </td>
                        <td>${cls?.name || '—'}</td>
                        <td>
                          <div style="display:flex;align-items:center;gap:0.5rem;">
                            <div style="flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:999px;min-width:60px;">
                              <div style="width:${avgProg}%;height:100%;background:linear-gradient(90deg,#00d4ff,#7b2fff);border-radius:999px;"></div>
                            </div>
                            <span style="font-size:0.75rem;color:rgba(255,255,255,0.45);">${avgProg}%</span>
                          </div>
                        </td>
                        <td>${quizCount}</td>
                        <td style="color:rgba(255,255,255,0.55);">${topSystem}</td>
                        <td style="color:#a47bff;font-weight:600;">${(s.xp || 0).toLocaleString()}</td>
                        <td><span class="score-pill ${scoreClass}">${avgScore}%</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- REPORTS TAB -->
          <div class="dash-tab-panel" id="tab-reports">
            <div class="dash-page-header">
              <div class="dash-page-title">Progress Reports</div>
              <div class="dash-page-subtitle">Detailed system-by-system class performance.</div>
            </div>
            <div class="dash-grid-2">
              ${classes.map(cls => {
                const clsStudents = allUsers.filter(u => cls.studentIds.includes(u.id));
                const avgProg = clsStudents.length > 0
                  ? Math.round(clsStudents.reduce((s, u) => s + this._studentAvgProgress(u), 0) / clsStudents.length)
                  : 0;
                return `
                  <div class="dash-card">
                    <div class="dash-card-title">${cls.icon} ${cls.name}</div>
                    <div style="margin-bottom:0.75rem;font-size:0.8rem;color:rgba(255,255,255,0.35);">
                      ${clsStudents.length} students · Avg overall: ${avgProg}%
                    </div>
                    <div class="progress-row">
                      ${Object.entries(SYSTEM_NAMES).map(([key, name]) => {
                        const pct = this._avgSystemProgress(clsStudents, key);
                        return `
                          <div class="progress-item">
                            <div class="progress-label-row">
                              <span class="progress-label">${name}</span>
                              <span class="progress-pct">${pct}%</span>
                            </div>
                            <div class="progress-bar-track">
                              <div class="progress-bar-fill" style="width:${pct}%"></div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- QUIZ TRACKING TAB -->
          <div class="dash-tab-panel" id="tab-quizzes">
            <div class="dash-page-header">
              <div class="dash-page-title">Quiz Tracking</div>
              <div class="dash-page-subtitle">Monitor quiz attempts and scores across all students.</div>
            </div>
            <div class="dash-card">
              <div class="quiz-track-row">
                ${students.flatMap(s =>
                  (s.quizHistory || []).map(q => ({...q, studentName: s.name}))
                ).sort((a, b) => new Date(b.date) - new Date(a.date)).map(q => {
                  const pct = Math.round((q.score / q.total) * 100);
                  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '📚';
                  return `
                    <div class="quiz-track-item">
                      <div class="quiz-track-icon">${emoji}</div>
                      <div class="quiz-track-info">
                        <div class="quiz-track-title">${SYSTEM_NAMES[q.system] || q.system}</div>
                        <div class="quiz-track-sub">${q.studentName} · ${q.date}</div>
                      </div>
                      <div class="quiz-track-score" style="color:${pct>=80?'#00ffa3':pct>=60?'#ffd700':'#ff6b6b'}">
                        ${q.score}/${q.total}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

        </main>
      </div>

      <!-- Modals -->
      ${this._createClassModalHTML()}
      ${this._createAssignmentModalHTML(classes)}
      <div class="dash-toast" id="dash-toast"></div>
    `;

    this._bindTeacherEvents(classes);
  }

  _bindTeacherEvents(classes) {
    
    document.querySelectorAll('.dash-nav-item[data-tab]').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        document.querySelectorAll('.dash-nav-item[data-tab]').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.dash-tab-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(`tab-${tab}`)?.classList.add('active');
      });
    });

    
    document.getElementById('dash-logout-btn')?.addEventListener('click', () => {
      SchoolDB.clearSession();
      this.currentUser = null;
      this._hideDashboard();
      this._showDashToast('Signed out successfully.');
    });

    
    document.getElementById('dash-back-to-app')?.addEventListener('click', () => {
      this._hideDashboard();
    });

    
    document.getElementById('create-class-btn')?.addEventListener('click', () => {
      document.getElementById('create-class-modal')?.classList.add('visible');
    });

    document.getElementById('cancel-class-btn')?.addEventListener('click', () => {
      document.getElementById('create-class-modal')?.classList.remove('visible');
    });

    document.getElementById('create-class-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'create-class-modal') e.target.classList.remove('visible');
    });

    document.getElementById('save-class-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-class-name')?.value?.trim();
      const subject = document.getElementById('new-class-subject')?.value?.trim();
      const schedule = document.getElementById('new-class-schedule')?.value?.trim();

      if (!name || !subject) return;

      const icons = { Biology: '🧬', Anatomy: '🫀', Science: '🌿', Physics: '⚡', default: '📚' };
      const iconClasses = { Biology: 'bio', Anatomy: 'med', Science: 'sci', Physics: 'phy', default: 'bio' };
      const matchedSubject = Object.keys(icons).find(k => subject.toLowerCase().includes(k.toLowerCase())) || 'default';

      const newClass = {
        id: 'c' + Date.now(),
        name, teacherId: this.currentUser.id,
        icon: icons[matchedSubject],
        iconClass: iconClasses[matchedSubject],
        studentIds: [],
        subject,
        schedule: schedule || 'TBD'
      };

      const cls = SchoolDB.getClasses();
      cls.push(newClass);
      SchoolDB.saveClasses(cls);

      document.getElementById('create-class-modal')?.classList.remove('visible');
      this._showDashToast(`Class "${name}" created! 🎉`);
      setTimeout(() => this._renderTeacherDashboard(), 400);
    });

    
    document.getElementById('create-assignment-btn')?.addEventListener('click', () => {
      document.getElementById('create-assignment-modal')?.classList.add('visible');
    });

    document.getElementById('cancel-assignment-btn')?.addEventListener('click', () => {
      document.getElementById('create-assignment-modal')?.classList.remove('visible');
    });

    document.getElementById('create-assignment-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'create-assignment-modal') e.target.classList.remove('visible');
    });

    document.getElementById('save-assignment-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('new-assign-title')?.value?.trim();
      const classId = document.getElementById('new-assign-class')?.value;
      const system = document.getElementById('new-assign-system')?.value;
      const due = document.getElementById('new-assign-due')?.value;
      const type = document.getElementById('new-assign-type')?.value;

      if (!title || !classId || !due) return;

      const cls = SchoolDB.getClasses().find(c => c.id === classId);
      const completions = {};
      (cls?.studentIds || []).forEach(id => { completions[id] = false; });

      const newAssign = {
        id: 'a' + Date.now(),
        classId, teacherId: this.currentUser.id,
        title, system, type, due,
        status: 'active',
        completions
      };

      const assigns = SchoolDB.getAssignments();
      assigns.push(newAssign);
      SchoolDB.saveAssignments(assigns);

      document.getElementById('create-assignment-modal')?.classList.remove('visible');
      this._showDashToast(`Assignment "${title}" created! 📝`);
      setTimeout(() => this._renderTeacherDashboard(), 400);
    });
  }

  _viewClass(classId) {
    this._showDashToast('Class detail view — coming soon!');
  }

  


  _renderStudentDashboard() {
    const u = this.currentUser;
    const progress = u.progress || {};
    const quizHistory = u.quizHistory || [];
    const assignments = SchoolDB.getAssignments().filter(a => {
      const cls = SchoolDB.getClasses().find(c => c.id === a.classId);
      return cls?.studentIds?.includes(u.id);
    });

    const avgProg = this._studentAvgProgress(u);
    const completedQuizzes = quizHistory.length;
    const xp = u.xp || 0;
    const achievements = u.achievements || [];

    this.dashOverlay.innerHTML = `
      <div class="dash-topbar">
        <div class="dash-logo">🧬 BioVerse <span>X</span></div>
        <div class="dash-topbar-divider"></div>
        <span class="dash-role-badge student">Student</span>
        <div class="dash-topbar-spacer"></div>
        <div class="dash-user-info">
          <div class="dash-avatar student-av">${this._initials(u.name)}</div>
          <span class="dash-username">${u.name}</span>
        </div>
        <button class="dash-back-btn" id="dash-back-to-app">← Back to App</button>
        <button class="dash-logout-btn" id="dash-logout-btn">Sign Out</button>
      </div>

      <div class="dash-body">
        <nav class="dash-sidebar" aria-label="Dashboard navigation">
          <div class="dash-sidebar-section">Learning</div>
          <div class="dash-nav-item active" data-tab="overview">
            <span class="dash-nav-icon">🏠</span><span>Overview</span>
          </div>
          <div class="dash-nav-item" data-tab="progress">
            <span class="dash-nav-icon">📊</span><span>My Progress</span>
          </div>
          <div class="dash-nav-item" data-tab="assignments">
            <span class="dash-nav-icon">📝</span><span>Assignments</span>
          </div>
          <div class="dash-nav-item" data-tab="quizzes">
            <span class="dash-nav-icon">🧩</span><span>Quiz Results</span>
          </div>
          <div class="dash-nav-item" data-tab="achievements">
            <span class="dash-nav-icon">🏆</span><span>Achievements</span>
          </div>
        </nav>

        <main class="dash-main" id="student-main">

          <!-- OVERVIEW -->
          <div class="dash-tab-panel active" id="tab-overview">
            <div class="dash-page-header">
              <div class="dash-page-title">Welcome back, ${u.name.split(' ')[0]}! 🎓</div>
              <div class="dash-page-subtitle">Keep exploring the human body and level up your knowledge.</div>
            </div>

            <div class="explore-prompt-card">
              <div class="explore-prompt-icon">🧬</div>
              <div>
                <div class="explore-prompt-title">Continue Exploring the Human Body</div>
                <div class="explore-prompt-sub">Your 3D anatomy explorer is ready. Dive into any system.</div>
              </div>
              <button class="dash-btn-primary" id="student-explore-btn" style="margin-left:auto;flex-shrink:0;">
                Open Explorer →
              </button>
            </div>

            <div class="dash-stats-row">
              <div class="dash-stat-card">
                <div class="dash-stat-label">Overall Progress</div>
                <div class="dash-stat-value">${avgProg}%</div>
                <div class="dash-stat-change">↑ Across all systems</div>
              </div>
              <div class="dash-stat-card">
                <div class="dash-stat-label">Quizzes Taken</div>
                <div class="dash-stat-value">${completedQuizzes}</div>
                <div class="dash-stat-change">↑ Keep going!</div>
              </div>
              <div class="dash-stat-card">
                <div class="dash-stat-label">Total XP</div>
                <div class="dash-stat-value">${xp.toLocaleString()}</div>
                <div class="dash-stat-change">↑ ${achievements.length} achievements</div>
              </div>
              <div class="dash-stat-card">
                <div class="dash-stat-label">Avg Quiz Score</div>
                <div class="dash-stat-value">${this._studentAvgQuizScore(u)}%</div>
                <div class="dash-stat-change">↑ Great performance!</div>
              </div>
            </div>

            <div class="dash-section-title">📚 System Progress</div>
            <div class="dash-card" style="margin-bottom:2rem;">
              <div class="progress-row">
                ${Object.entries(SYSTEM_NAMES).map(([key, name]) => {
                  const pct = progress[key] || 0;
                  return `
                    <div class="progress-item">
                      <div class="progress-label-row">
                        <span class="progress-label">${name}</span>
                        <span class="progress-pct">${pct}%</span>
                      </div>
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width:${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- PROGRESS TAB -->
          <div class="dash-tab-panel" id="tab-progress">
            <div class="dash-page-header">
              <div class="dash-page-title">My Learning Progress</div>
              <div class="dash-page-subtitle">System-by-system breakdown of your anatomy mastery.</div>
            </div>
            <div class="dash-grid-3">
              ${Object.entries(SYSTEM_NAMES).map(([key, name]) => {
                const pct = progress[key] || 0;
                const color = pct >= 80 ? '#00ffa3' : pct >= 50 ? '#00d4ff' : '#7b2fff';
                const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '📈' : '📚';
                return `
                  <div class="dash-card" style="text-align:center;">
                    <div style="font-size:1.5rem;margin-bottom:0.5rem;">${emoji}</div>
                    <div style="font-size:0.85rem;font-weight:600;color:rgba(255,255,255,0.75);margin-bottom:0.75rem;">${name}</div>
                    <div style="font-family:'Outfit',sans-serif;font-size:2rem;font-weight:700;color:${color};margin-bottom:0.5rem;">${pct}%</div>
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,${color},${color}88);"></div>
                    </div>
                    <button class="dash-btn-ghost" style="margin-top:0.75rem;width:100%;font-size:0.75rem;" onclick="window.bioSchool._exploreSystem('${key}')">
                      Explore →
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- ASSIGNMENTS TAB -->
          <div class="dash-tab-panel" id="tab-assignments">
            <div class="dash-page-header">
              <div class="dash-page-title">My Assignments</div>
              <div class="dash-page-subtitle">Tasks assigned by your teacher.</div>
            </div>
            <div class="dash-card">
              <div class="assignment-list">
                ${assignments.map(a => {
                  const done = a.completions?.[u.id] ? true : false;
                  const status = done ? 'complete' : a.status === 'overdue' ? 'overdue' : 'pending';
                  return `
                    <div class="assignment-item">
                      <div class="assignment-dot ${status}"></div>
                      <div style="display:flex;flex-direction:column;gap:0.15rem;flex:1;">
                        <div class="assignment-title">${a.title}</div>
                        <div style="font-size:0.75rem;color:rgba(255,255,255,0.3);">${SYSTEM_NAMES[a.system] || ''} · Due: ${a.due}</div>
                      </div>
                      <span class="assignment-status ${status}">${done ? 'complete' : status}</span>
                      ${!done ? `<button class="dash-btn-ghost" style="font-size:0.75rem;" onclick="window.bioSchool._startAssignment('${a.id}')">Start</button>` : ''}
                    </div>
                  `;
                }).join('')}
                ${assignments.length === 0 ? '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:1.5rem;">No assignments yet!</div>' : ''}
              </div>
            </div>
          </div>

          <!-- QUIZ RESULTS TAB -->
          <div class="dash-tab-panel" id="tab-quizzes">
            <div class="dash-page-header">
              <div class="dash-page-title">Quiz Results</div>
              <div class="dash-page-subtitle">All your completed quiz attempts and scores.</div>
            </div>
            <div class="dash-card">
              <div class="quiz-track-row">
                ${quizHistory.length > 0 ? quizHistory.map(q => {
                  const pct = Math.round((q.score / q.total) * 100);
                  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '📚';
                  return `
                    <div class="quiz-track-item">
                      <div class="quiz-track-icon">${emoji}</div>
                      <div class="quiz-track-info">
                        <div class="quiz-track-title">${SYSTEM_NAMES[q.system] || q.system}</div>
                        <div class="quiz-track-sub">${q.date}</div>
                      </div>
                      <div class="quiz-track-score" style="color:${pct>=80?'#00ffa3':pct>=60?'#ffd700':'#ff6b6b'}">
                        ${q.score}/${q.total} · ${pct}%
                      </div>
                    </div>
                  `;
                }).join('') : '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:1.5rem;">No quizzes completed yet. Try one!</div>'}
              </div>
            </div>
          </div>

          <!-- ACHIEVEMENTS TAB -->
          <div class="dash-tab-panel" id="tab-achievements">
            <div class="dash-page-header">
              <div class="dash-page-title">Achievements</div>
              <div class="dash-page-subtitle">Badges earned through your anatomy learning journey.</div>
            </div>
            <div class="dash-section-title">🏅 Your Badges</div>
            <div class="achievements-grid">
              ${ACHIEVEMENTS.map(ach => {
                const earned = achievements.includes(ach.id);
                return `
                  <div class="achievement-badge ${earned ? 'earned' : 'locked'}" title="${ach.name}">
                    <div class="achievement-badge-icon">${ach.icon}</div>
                    <div class="achievement-badge-name">${ach.name}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="dash-section-title" style="margin-top:2rem;">⚡ XP Progress</div>
            <div class="dash-card">
              <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1rem;">
                <div style="font-family:'Outfit',sans-serif;font-size:2.5rem;font-weight:700;color:#a47bff;">${xp.toLocaleString()}</div>
                <div>
                  <div style="font-size:0.9rem;font-weight:600;color:rgba(255,255,255,0.7);">Total Experience Points</div>
                  <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);">Keep exploring and taking quizzes to earn more!</div>
                </div>
              </div>
              <div class="progress-bar-track" style="height:8px;">
                <div class="progress-bar-fill" style="width:${Math.min((xp/2000)*100, 100)}%;background:linear-gradient(90deg,#7b2fff,#a47bff);"></div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:0.4rem;font-size:0.75rem;color:rgba(255,255,255,0.3);">
                <span>${xp} XP</span><span>2000 XP (Next Level)</span>
              </div>
            </div>
          </div>

        </main>
      </div>

      <div class="dash-toast" id="dash-toast"></div>
    `;

    this._bindStudentEvents();
  }

  _bindStudentEvents() {
    document.querySelectorAll('.dash-nav-item[data-tab]').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        document.querySelectorAll('.dash-nav-item[data-tab]').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.dash-tab-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(`tab-${tab}`)?.classList.add('active');
      });
    });

    document.getElementById('dash-logout-btn')?.addEventListener('click', () => {
      SchoolDB.clearSession();
      this.currentUser = null;
      this._hideDashboard();
      this._showDashToast('Signed out successfully.');
    });

    document.getElementById('dash-back-to-app')?.addEventListener('click', () => {
      this._hideDashboard();
    });

    document.getElementById('student-explore-btn')?.addEventListener('click', () => {
      this._hideDashboard();
      
      document.getElementById('explore-btn')?.click();
    });
  }

  _startAssignment(assignId) {
    const assign = SchoolDB.getAssignments().find(a => a.id === assignId);
    if (!assign) return;

    
    const assigns = SchoolDB.getAssignments();
    const a = assigns.find(x => x.id === assignId);
    if (a && this.currentUser) {
      a.completions = a.completions || {};
      a.completions[this.currentUser.id] = true;
      SchoolDB.saveAssignments(assigns);

      
      const users = SchoolDB.getUsers();
      const u = users.find(x => x.id === this.currentUser.id);
      if (u) {
        u.xp = (u.xp || 0) + 50;
        SchoolDB.saveUsers(users);
        this.currentUser = u;
      }
    }

    this._hideDashboard();
    
    if (assign.type === 'quiz' && window.bioQuiz) {
      window.bioQuiz.start(assign.system);
    } else if (window.bioCinematic) {
      window.bioCinematic.focusSystem(assign.system);
    }
  }

  _exploreSystem(systemKey) {
    this._hideDashboard();
    if (window._activeBioSystem !== undefined) {
      window._activeBioSystem = systemKey;
    }
    document.getElementById('explore-btn')?.click();
    setTimeout(() => {
      if (window.bioCinematic) window.bioCinematic.focusSystem?.(systemKey);
    }, 600);
  }

  


  _createClassModalHTML() {
    return `
      <div class="dash-modal-overlay" id="create-class-modal">
        <div class="dash-modal">
          <div class="dash-modal-title">Create New Class</div>
          <form class="dash-modal-form" id="save-class-form">
            <div class="auth-field-group">
              <label class="auth-label" for="new-class-name">Class Name</label>
              <input class="auth-input" id="new-class-name" type="text" placeholder="e.g. Grade 10 Biology" required />
            </div>
            <div class="auth-field-group">
              <label class="auth-label" for="new-class-subject">Subject</label>
              <input class="auth-input" id="new-class-subject" type="text" placeholder="e.g. Biology, Anatomy" required />
            </div>
            <div class="auth-field-group">
              <label class="auth-label" for="new-class-schedule">Schedule</label>
              <input class="auth-input" id="new-class-schedule" type="text" placeholder="e.g. Mon/Wed 9:00 AM" />
            </div>
            <div class="dash-modal-actions">
              <button type="button" class="dash-btn-ghost" id="cancel-class-btn">Cancel</button>
              <button type="submit" class="dash-btn-primary">Create Class</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  _createAssignmentModalHTML(classes) {
    return `
      <div class="dash-modal-overlay" id="create-assignment-modal">
        <div class="dash-modal">
          <div class="dash-modal-title">Create Assignment</div>
          <form class="dash-modal-form" id="save-assignment-form">
            <div class="auth-field-group">
              <label class="auth-label" for="new-assign-title">Assignment Title</label>
              <input class="auth-input" id="new-assign-title" type="text" placeholder="e.g. Skeletal System Quiz" required />
            </div>
            <div class="auth-field-group">
              <label class="auth-label" for="new-assign-class">Class</label>
              <select class="auth-input" id="new-assign-class" required>
                <option value="">Select class...</option>
                ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="auth-field-group">
              <label class="auth-label" for="new-assign-system">Anatomy System</label>
              <select class="auth-input" id="new-assign-system">
                ${Object.entries(SYSTEM_NAMES).map(([k,n]) => `<option value="${k}">${n}</option>`).join('')}
              </select>
            </div>
            <div class="auth-field-group">
              <label class="auth-label" for="new-assign-type">Type</label>
              <select class="auth-input" id="new-assign-type">
                <option value="quiz">Quiz</option>
                <option value="explore">Exploration</option>
              </select>
            </div>
            <div class="auth-field-group">
              <label class="auth-label" for="new-assign-due">Due Date</label>
              <input class="auth-input" id="new-assign-due" type="date" required />
            </div>
            <div class="dash-modal-actions">
              <button type="button" class="dash-btn-ghost" id="cancel-assignment-btn">Cancel</button>
              <button type="submit" class="dash-btn-primary">Create Assignment</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  


  _initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  _studentAvgProgress(user) {
    const prog = user?.progress;
    if (!prog) return 0;
    const vals = Object.values(prog);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  _avgSystemProgress(students, systemKey) {
    if (!students.length) return 0;
    const vals = students.map(s => (s.progress?.[systemKey] || 0));
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  _topSystem(user) {
    const prog = user?.progress;
    if (!prog) return '—';
    const best = Object.entries(prog).sort((a, b) => b[1] - a[1])[0];
    return best ? SYSTEM_NAMES[best[0]] || best[0] : '—';
  }

  _studentAvgQuizScore(user) {
    const history = user?.quizHistory;
    if (!history?.length) return 0;
    const avg = history.reduce((s, q) => s + (q.score / q.total) * 100, 0) / history.length;
    return Math.round(avg);
  }

  _showDashToast(msg) {
    let toast = document.getElementById('dash-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dash-toast';
      toast.className = 'dash-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  



  recordQuizResult(systemKey, score, total) {
    if (!this.currentUser || this.currentUser.role !== 'student') return;

    const users = SchoolDB.getUsers();
    const user = users.find(u => u.id === this.currentUser.id);
    if (!user) return;

    user.quizHistory = user.quizHistory || [];
    user.quizHistory.push({
      system: systemKey,
      score,
      total,
      date: new Date().toISOString().split('T')[0]
    });

    
    user.progress = user.progress || {};
    const pct = Math.round((score / total) * 100);
    user.progress[systemKey] = Math.max(user.progress[systemKey] || 0, pct);

    
    user.xp = (user.xp || 0) + Math.round((score / total) * 100);

    
    if (!user.achievements.includes('first_quiz')) {
      user.achievements.push('first_quiz');
    }
    if (pct === 100 && !user.achievements.includes('perfect_score')) {
      user.achievements.push('perfect_score');
    }

    SchoolDB.saveUsers(users);
    this.currentUser = user;
  }
}

window.SchoolPlatform = SchoolPlatform;
