/**
 * 한빛주택 청약누리 - APT 당첨조회 JavaScript
 * 분할 당첨번호(자유 자릿수) 기반 실시간 조회
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const openModalBtn1 = document.getElementById('open-lookup-modal');
  const openModalBtn2 = document.getElementById('open-lookup-modal-btn2');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const cancelModalBtn = document.getElementById('btn-modal-cancel');
  
  const inputModal = document.getElementById('input-modal');
  const loadingModal = document.getElementById('loading-modal');
  const lookupForm = document.getElementById('lookup-form');

  const inputWinFirst = document.getElementById('input-win-first');
  const inputWinSecond = document.getElementById('input-win-second');

  // Result Elements
  const rowEmpty = document.getElementById('row-empty');
  const rowWinner = document.getElementById('row-winner');
  const winNumberDisplay = document.getElementById('win-number-display');
  
  const winnerCard = document.getElementById('winner-celebration-card');
  const cardWinNumber = document.getElementById('card-win-number');
  const btnRelookup = document.getElementById('btn-relookup');

  // Progress Bar & Timer Elements
  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');
  const timerSecText = document.getElementById('timer-sec');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  // Tab switching effect
  const tabInternet = document.getElementById('tab-internet');
  const tabBank = document.getElementById('tab-bank');

  tabInternet?.addEventListener('click', () => {
    tabInternet.classList.add('active');
    tabBank.classList.remove('active');
  });

  tabBank?.addEventListener('click', () => {
    tabBank.classList.add('active');
    tabInternet.classList.remove('active');
  });

  // Modal Open / Close Handlers
  const openInputModal = () => {
    inputModal.classList.remove('hidden');
    inputWinFirst.focus();
  };

  const closeInputModal = () => {
    inputModal.classList.add('hidden');
  };

  openModalBtn1?.addEventListener('click', openInputModal);
  openModalBtn2?.addEventListener('click', openInputModal);
  closeModalBtn?.addEventListener('click', closeInputModal);
  cancelModalBtn?.addEventListener('click', closeInputModal);

  // 앞 입력칸에서 '-' 기호 입력 시 자연스럽게 뒤 입력칸으로 이동
  inputWinFirst?.addEventListener('keydown', (e) => {
    if (e.key === '-' || e.key === 'Subtract') {
      e.preventDefault();
      inputWinSecond.focus();
    }
  });

  // 뒤 입력칸에서 비어있을 때 Backspace 누르면 앞 입력칸으로 이동
  inputWinSecond?.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && inputWinSecond.value.length === 0) {
      inputWinFirst.focus();
    }
  });

  // Form Submit Handler (조회하기 클릭)
  lookupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstVal = inputWinFirst.value.trim();
    const secondVal = inputWinSecond.value.trim();

    if (!firstVal && !secondVal) {
      alert('당첨번호를 입력해 주세요.');
      inputWinFirst.focus();
      return;
    }

    let fullWinNumber = '';
    if (firstVal && secondVal) {
      fullWinNumber = `${firstVal}-${secondVal}`;
    } else if (firstVal) {
      fullWinNumber = firstVal;
    } else {
      fullWinNumber = secondVal;
    }

    // Step 1: Close input modal & open loading modal
    closeInputModal();
    startLoadingSequence(fullWinNumber);
  });

  // 5.5 Seconds Loading Sequence Handler
  function startLoadingSequence(winNumber) {
    loadingModal.classList.remove('hidden');

    const totalDuration = 5500; // Exact 5.5 seconds
    const intervalTime = 50; // Update every 50ms
    let elapsedTime = 0;

    // Reset Progress State
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    timerSecText.textContent = '5.5';

    step1.className = 'step-item active';
    step2.className = 'step-item';
    step3.className = 'step-item';

    const timer = setInterval(() => {
      elapsedTime += intervalTime;
      const progress = Math.min(100, Math.floor((elapsedTime / totalDuration) * 100));
      const remainingSec = Math.max(0, ((totalDuration - elapsedTime) / 1000)).toFixed(1);

      progressFill.style.width = `${progress}%`;
      progressPercent.textContent = `${progress}%`;
      timerSecText.textContent = remainingSec;

      // Update Step Indicators during the 5.5s timeline
      if (elapsedTime >= 1800 && elapsedTime < 3800) {
        step1.className = 'step-item done';
        step1.querySelector('.step-dot').innerHTML = '<i class="fa-solid fa-check"></i>';
        step2.className = 'step-item active';
      } else if (elapsedTime >= 3800) {
        step2.className = 'step-item done';
        step2.querySelector('.step-dot').innerHTML = '<i class="fa-solid fa-check"></i>';
        step3.className = 'step-item active';
      }

      // Completed (Exactly after 5.5s)
      if (elapsedTime >= totalDuration) {
        clearInterval(timer);
        step3.className = 'step-item done';
        step3.querySelector('.step-dot').innerHTML = '<i class="fa-solid fa-check"></i>';

        setTimeout(() => {
          loadingModal.classList.add('hidden');
          displayWinningResult(winNumber);
        }, 300);
      }
    }, intervalTime);
  }

  // Display Winning Results Screen
  function displayWinningResult(winNumber) {
    // 1. Update Table
    rowEmpty.classList.add('hidden');
    winNumberDisplay.textContent = winNumber;
    rowWinner.classList.remove('hidden');

    // 2. Update Celebration Card
    cardWinNumber.textContent = winNumber;
    winnerCard.classList.remove('hidden');

    // 3. Trigger Confetti Effect
    triggerConfetti();

    // 4. Scroll smoothly to celebration card
    winnerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Reset & Relookup
  btnRelookup?.addEventListener('click', () => {
    winnerCard.classList.add('hidden');
    rowWinner.classList.add('hidden');
    rowEmpty.classList.remove('hidden');
    
    // Clear inputs
    inputWinFirst.value = '';
    inputWinSecond.value = '';

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    openInputModal();
  });

  // Confetti Animation Engine
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#0072ce', '#f8ad1d', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 4 + 3,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      });
    }

    let animationFrame;
    const startTime = Date.now();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (Date.now() - startTime < 4000) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    render();
  }
});
