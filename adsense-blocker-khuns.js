// 광고 클릭, 새로고침 횟수, 체류 시간을 추적하는 코드
(function() {
  // 페이지가 로드될 때 실행
  document.addEventListener('DOMContentLoaded', function() {
    // 커스텀 모달 생성
    function createModal(message, onConfirm, onCancel) {
      // 이미 모달이 있으면 제거
      const existingModal = document.getElementById('custom-modal');
      if (existingModal) {
        existingModal.remove();
      }
      
      // 모달 요소 생성
      const modal = document.createElement('div');
      modal.id = 'custom-modal';
      modal.style.position = 'fixed';
      modal.style.left = '0';
      modal.style.top = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '9999';
      
      // 모달 내용
      const modalContent = document.createElement('div');
      modalContent.style.backgroundColor = 'white';
      modalContent.style.padding = '20px';
      modalContent.style.borderRadius = '5px';
      modalContent.style.textAlign = 'center';
      modalContent.style.maxWidth = '80%';
      
      // 메시지
      const messageElement = document.createElement('p');
      messageElement.textContent = message;
      
      // 버튼 컨테이너
      const buttonContainer = document.createElement('div');
      buttonContainer.style.marginTop = '20px';
      
      // 확인 버튼
      const confirmButton = document.createElement('button');
      confirmButton.textContent = '확인';
      confirmButton.style.marginRight = '10px';
      confirmButton.style.padding = '5px 10px';
      confirmButton.style.backgroundColor = '#4CAF50';
      confirmButton.style.color = 'white';
      confirmButton.style.border = 'none';
      confirmButton.style.borderRadius = '3px';
      confirmButton.style.cursor = 'pointer';
      
      confirmButton.addEventListener('click', function() {
        modal.remove();
        if (onConfirm) onConfirm();
      });
      
      // 취소 버튼
      const cancelButton = document.createElement('button');
      cancelButton.textContent = '취소';
      cancelButton.style.padding = '5px 10px';
      cancelButton.style.backgroundColor = '#f44336';
      cancelButton.style.color = 'white';
      cancelButton.style.border = 'none';
      cancelButton.style.borderRadius = '3px';
      cancelButton.style.cursor = 'pointer';
      
      cancelButton.addEventListener('click', function() {
        modal.remove();
        if (onCancel) onCancel();
      });
      
      // 요소 조립
      buttonContainer.appendChild(confirmButton);
      buttonContainer.appendChild(cancelButton);
      modalContent.appendChild(messageElement);
      modalContent.appendChild(buttonContainer);
      modal.appendChild(modalContent);
      
      // 모달을 페이지에 추가
      document.body.appendChild(modal);
      
      // 새로고침을 방지하기 위한 상태 저장
      localStorage.setItem('modalOpen', 'true');
      localStorage.setItem('modalMessage', message);
    }
    
    // 광고 요소 선택
    const adElements = document.querySelectorAll('.revenue_unit_item, .adsense, iframe[src*="googleads"], ins.adsbygoogle');
    
    // 현재 광고 클릭 수 가져오기
    let adClickCount = parseInt(localStorage.getItem('adClickCount') || 0);
    
    // 새로고침 횟수 추적
    let refreshCount = parseInt(sessionStorage.getItem('refreshCount') || 0);
    let lastRefreshTime = parseInt(sessionStorage.getItem('lastRefreshTime') || 0);
    let currentTime = new Date().getTime();
    
    // 마지막 새로고침으로부터 10초 이내면 연속 새로고침으로 간주
    if (currentTime - lastRefreshTime < 10000) {
      refreshCount++;
    } else {
      refreshCount = 1; // 10초 이상 지났으면 카운터 초기화
    }
    
    // 새로고침 시간 및 카운트 저장
    sessionStorage.setItem('lastRefreshTime', currentTime);
    sessionStorage.setItem('refreshCount', refreshCount);
    
    // 모달이 열려 있었는지 확인
    if (localStorage.getItem('modalOpen') === 'true') {
      const message = localStorage.getItem('modalMessage');
      createModal(message, function() {
        // 확인 버튼 클릭 시
        window.location.href = window.redirectTarget || 'https://www.tistory.com/';
      }, function() {
        // 취소 버튼 클릭 시
        localStorage.removeItem('modalOpen');
        localStorage.removeItem('modalMessage');
      });
    }
    
    // 5번 이상 연속 새로고침 시 알림창 표시
    if (refreshCount >= 5 && localStorage.getItem('modalOpen') !== 'true') {
      createModal('페이지를 너무 자주 새로고침하고 있습니다. 계속 이 사이트에 머무르시겠습니까?', null, function() {
        // 취소를 누른 경우 리다이렉트
        window.location.href = window.redirectTarget || 'https://www.tistory.com/';
      });
      // 새로고침 카운터 초기화
      sessionStorage.setItem('refreshCount', 0);
    }
    
    // 체류 시간 타이머 시작
    let stayTimer;
    let stayPromptShown = sessionStorage.getItem('stayPromptShown') === 'true';
    
    // 10초 후 알림창 표시 (한 세션에 한 번만)
    if (!stayPromptShown && localStorage.getItem('modalOpen') !== 'true') {
      stayTimer = setTimeout(function() {
        createModal('더 좋은 정보를 보러 가시겠습니까?', function() {
          // 확인을 누른 경우 리다이렉트
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        }, null);
        // 프롬프트가 표시되었음을 저장
        sessionStorage.setItem('stayPromptShown', 'true');
      }, 10000); // 10초
    }
    
    // 페이지를 떠날 때 타이머 제거
    window.addEventListener('beforeunload', function() {
      clearTimeout(stayTimer);
    });
    
    // 각 광고 요소에 클릭 이벤트 리스너 추가
    adElements.forEach(ad => {
      ad.addEventListener('click', function() {
        // 클릭할 때마다 카운터 증가
        adClickCount++;
        localStorage.setItem('adClickCount', adClickCount);
        
        // 3번째 클릭 시 알림창 표시
        if (adClickCount === 3 && localStorage.getItem('modalOpen') !== 'true') {
          createModal('이 사이트에 계속 머무르시겠습니까?', null, function() {
            // 취소를 누른 경우 리다이렉트
            window.location.href = window.redirectTarget || 'https://www.tistory.com/';
          });
          // 카운터 초기화
          localStorage.setItem('adClickCount', 0);
        }
      });
    });
  });
})();
