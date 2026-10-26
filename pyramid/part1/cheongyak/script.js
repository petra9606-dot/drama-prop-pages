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
  const helpModal = document.getElementById('service-help');
  let dialogOrigin = null;

  function showDialog(modal, focusTarget) {
    dialogOrigin = document.activeElement;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modal.tabIndex = -1;
    (focusTarget || modal).focus();
  }

  function hideDialog(modal) {
    modal.classList.add('hidden');
    if (!document.querySelector('.modal-backdrop:not(.hidden)')) document.body.style.overflow = '';
    if (dialogOrigin?.isConnected) dialogOrigin.focus();
  }

  document.querySelectorAll('[data-help]').forEach(button => {
    button.addEventListener('click', () => showDialog(helpModal, document.getElementById('help-close')));
  });
  document.getElementById('help-close').addEventListener('click', () => hideDialog(helpModal));
  [helpModal, inputModal].forEach(modal => modal.addEventListener('click', event => {
    if (event.target === modal) hideDialog(modal);
  }));
  document.addEventListener('keydown', event => {
    const modal = document.querySelector('.modal-backdrop:not(.hidden)');
    if (!modal) return;
    if (event.key === 'Escape' && modal !== loadingModal) { hideDialog(modal); return; }
    if (event.key !== 'Tab') return;
    const targets = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')].filter(el => el.getClientRects().length);
    if (!targets.length) { event.preventDefault(); modal.focus(); return; }
    const first = targets[0], last = targets[targets.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modal)) { event.preventDefault(); first.focus(); }
  });

  tabInternet?.addEventListener('click', () => {
    tabInternet.classList.add('active');
    tabBank.classList.remove('active');
    tabInternet.setAttribute('aria-pressed', 'true');
    tabBank.setAttribute('aria-pressed', 'false');
  });

  tabBank?.addEventListener('click', () => {
    tabBank.classList.add('active');
    tabInternet.classList.remove('active');
    tabBank.setAttribute('aria-pressed', 'true');
    tabInternet.setAttribute('aria-pressed', 'false');
  });

  // Modal Open / Close Handlers
  const openInputModal = () => {
    showDialog(inputModal, inputWinFirst);
  };

  const closeInputModal = () => {
    hideDialog(inputModal);
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
    showDialog(loadingModal);

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
    [step1, step2, step3].forEach((step, index) => { step.querySelector('.step-dot').textContent = String(index + 1); });
    progressFill.parentElement.setAttribute('aria-valuenow', '0');

    const timer = setInterval(() => {
      elapsedTime += intervalTime;
      const progress = Math.min(100, Math.floor((elapsedTime / totalDuration) * 100));
      const remainingSec = Math.max(0, ((totalDuration - elapsedTime) / 1000)).toFixed(1);

      progressFill.style.width = `${progress}%`;
      progressPercent.textContent = `${progress}%`;
      timerSecText.textContent = remainingSec;
      progressFill.parentElement.setAttribute('aria-valuenow', String(progress));

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
          hideDialog(loadingModal);
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

    // 조회 결과로 이동하되 과장된 축하 효과는 사용하지 않는다.
    winnerCard.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
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

});
