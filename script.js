/**
 * 13년 차 올인원 영상 디렉터 포트폴리오 스크립트
 * - 부드러운 섹션 스크롤 이동 (Smooth Scroll)
 * - 스크롤 위치 기반 상단 내비게이션 활성화 표시
 * - 모바일 반응형 메뉴 토글
 * - 프로필 사진 영역 클릭·확대 완전 차단
 * - 포트폴리오 아카이브 카테고리별 실시간 필터링
 * - 정적 문의 안내 피드백 (백엔드/DB 저장 없음, 연락처 '추후 안내' 고지)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 프로필 사진 영역 클릭·우클릭·드래그·확대 완전 차단
  const profileBox = document.getElementById('director-profile-box');
  if (profileBox) {
    ['click', 'dblclick', 'contextmenu', 'dragstart', 'mousedown', 'touchstart'].forEach(evtType => {
      profileBox.addEventListener(evtType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, { passive: false });
    });
  }

  // 2. 모바일 내비게이션 메뉴 토글
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuPanel = document.getElementById('mobile-menu-panel');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');

  function closeMobileMenu() {
    if (mobileMenuPanel && !mobileMenuPanel.classList.contains('hidden')) {
      mobileMenuPanel.classList.add('hidden');
      if (mobileMenuIcon) mobileMenuIcon.textContent = 'menu';
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (mobileMenuBtn && mobileMenuPanel) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenuPanel.classList.contains('hidden');
      if (isHidden) {
        mobileMenuPanel.classList.remove('hidden');
        if (mobileMenuIcon) mobileMenuIcon.textContent = 'close';
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      } else {
        closeMobileMenu();
      }
    });
  }

  // 3. 내비게이션 메뉴 및 앵커 버튼 부드러운 스크롤 이동 (Smooth Scroll)
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        closeMobileMenu();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 4. 현재 보이는 섹션에 따른 상단 내비게이션 활성화 표시
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 140;
    let currentSectionId = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        link.classList.add('active', 'text-primary', 'font-semibold');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.classList.remove('active', 'text-primary', 'font-semibold');
        link.classList.add('text-on-surface-variant');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // 5. 포트폴리오 아카이브 카테고리 필터링
  const filterButtons = document.querySelectorAll('.filter-btn');
  const archiveCards = document.querySelectorAll('.archive-card');
  const archiveCountEl = document.getElementById('archive-count');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 모든 필터 버튼 비활성화 스타일 초기화
      filterButtons.forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
        b.classList.add('text-on-surface-variant');
        b.setAttribute('aria-pressed', 'false');
      });

      // 선택된 필터 버튼 활성화 스타일 적용
      btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
      btn.classList.remove('text-on-surface-variant');
      btn.setAttribute('aria-pressed', 'true');

      const selectedCategory = btn.getAttribute('data-category');
      let visibleCount = 0;

      archiveCards.forEach(card => {
        const itemCategory = card.getAttribute('data-cat');
        if (selectedCategory === 'all' || itemCategory === selectedCategory) {
          card.classList.remove('is-hidden');
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.classList.add('is-hidden');
          card.style.display = 'none';
        }
      });

      if (archiveCountEl) {
        archiveCountEl.textContent = `${visibleCount}건의 작업물`;
      }
    });
  });

  // 6. 포트폴리오 카드 클릭 시 외부 링크(유튜브 영상 / 고화질 원본 사진) 새 창 연결
  archiveCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // 내부의 a 태그를 직접 클릭한 경우에는 기본 새 창 이동 동작 수행
      if (e.target.closest('a')) return;

      const externalUrl = card.getAttribute('data-external-url');
      if (externalUrl) {
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
      }
    });

    // 키보드 접근성 (Enter / Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a')) return;
        e.preventDefault();
        const externalUrl = card.getAttribute('data-external-url');
        if (externalUrl) {
          window.open(externalUrl, '_blank', 'noopener,noreferrer');
        }
      }
    });
  });

  // 7. 정적 문의 양식 안내 피드백 (서버/DB 저장 없이 '추후 안내' 상태 고지)
  const contactForm = document.getElementById('contact-form');
  const submitFeedback = document.getElementById('submit-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitFeedback) {
        submitFeedback.classList.remove('hidden');
        submitFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
});
