// 광고 클릭, 새로고침 횟수, 체류 시간을 추적하는 코드
(function() {
  // 페이지가 로드될 때 실행
  document.addEventListener('DOMContentLoaded', function() {
    // 광고 요소 선택
    const adElements = document.querySelectorAll('.revenue_unit_item, .adsense, iframe[src*="googleads"], ins.adsbygoogle');
    
    // 현재 광고 클릭 수 가져오기
    let adClickCount = parseInt(localStorage.getItem('adClickCount') || 0);
    
    // 새로고침 횟수 추적
    let refreshCount = parseInt(sessionStorage.getItem('refreshCount') || 0);
    let lastRefreshTime = parseInt(sessionStorage.getItem('lastRefreshTime') || 0);
    let currentTime = new Date().getTime();
    
    // 체류 시간 타이머 시작
    let stayTimer1, stayTimer2;
    let stayPromptShown1 = sessionStorage.getItem('stayPromptShown1') === 'true';
    let stayPromptShown2 = sessionStorage.getItem('stayPromptShown2') === 'true';
    
    // 마지막 새로고침으로부터 10초 이내면 연속 새로고침으로 간주
    if (currentTime - lastRefreshTime < 10000) {
      refreshCount++;
    } else {
      refreshCount = 1; // 10초 이상 지났으면 카운터 초기화
    }
    
    // 새로고침 시간 및 카운트 저장
    sessionStorage.setItem('lastRefreshTime', currentTime);
    sessionStorage.setItem('refreshCount', refreshCount);
    
    // 커스텀 팝업 생성 함수
    function createCustomPopup(message, type) {
      // 이미 팝업이 있으면 제거
      const existingPopup = document.getElementById('custom-popup');
      if (existingPopup) {
        existingPopup.remove();
      }
      
      // 팝업 컨테이너 생성
      const popup = document.createElement('div');
      popup.id = 'custom-popup';
      popup.style.position = 'fixed';
      popup.style.left = '0';
      popup.style.top = '0';
      popup.style.width = '100%';
      popup.style.height = '100%';
      popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      popup.style.zIndex = '9999999';
      popup.style.display = 'flex';
      popup.style.justifyContent = 'center';
      popup.style.alignItems = 'center';
      
      // 팝업 내용 컨테이너
      const popupContent = document.createElement('div');
      popupContent.style.width = '80%';
      popupContent.style.maxWidth = '500px';
      popupContent.style.backgroundColor = '#fff';
      popupContent.style.borderRadius = '8px';
      popupContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
      popupContent.style.overflow = 'hidden';
      
      // 헤더 부분
      const header = document.createElement('div');
      header.style.padding = '15px';
      header.style.backgroundColor = type === 'warning' ? '#ff6b6b' : '#4CAF50';
      header.style.color = '#fff';
      header.style.fontWeight = 'bold';
      header.style.fontSize = '18px';
      header.style.textAlign = 'center';
      header.textContent = type === 'warning' ? '⚠️ 주의' : '💡 알림';
      
      // 메시지 부분
      const messageElement = document.createElement('div');
      messageElement.style.padding = '20px';
      messageElement.style.fontSize = '16px';
      messageElement.style.lineHeight = '1.5';
      messageElement.style.textAlign = 'center';
      messageElement.textContent = message;
      
      // 버튼 컨테이너
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.padding = '0 20px 20px';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.gap = '10px';
      
      // 버튼 스타일 함수
      function styleButton(button, isPrimary) {
        button.style.padding = '10px 20px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.3s';
        button.style.flex = '1';
        button.style.maxWidth = '150px';
        
        if (isPrimary) {
          button.style.backgroundColor = type === 'warning' ? '#ff6b6b' : '#4CAF50';
          button.style.color = 'white';
        } else {
          button.style.backgroundColor = '#f1f1f1';
          button.style.color = '#333';
        }
      }
      
      // 버튼 생성
      const confirmButton = document.createElement('button');
      confirmButton.textContent = type === 'warning' ? '계속 이용하기' : '지금 확인하기';
      styleButton(confirmButton, type !== 'warning');
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = type === 'warning' ? '다른 곳으로 이동' : '나중에 볼게요';
      styleButton(cancelButton, type === 'warning');
      
      // 버튼 이벤트 설정
      if (type === 'warning') {
        // 경고 타입: 확인 = 계속 이용, 취소 = 리다이렉트
        confirmButton.addEventListener('click', function() {
          popup.remove();
        });
        
        cancelButton.addEventListener('click', function() {
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        });
      } else {
        // 일반 알림 타입: 확인 = 리다이렉트, 취소 = 계속 이용
        confirmButton.addEventListener('click', function() {
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        });
        
        cancelButton.addEventListener('click', function() {
          popup.remove();
        });
      }
      
      // 요소 조립
      buttonContainer.appendChild(confirmButton);
      buttonContainer.appendChild(cancelButton);
      
      popupContent.appendChild(header);
      popupContent.appendChild(messageElement);
      popupContent.appendChild(buttonContainer);
      
      popup.appendChild(popupContent);
      document.body.appendChild(popup);
    }
    
    // 5번 이상 연속 새로고침 시 팝업 표시
    if (refreshCount >= 5) {
      createCustomPopup('알림: 빠른 페이지 새로고침이 여러 번 감지되었습니다. 이러한 행동은 시스템에 의해 모니터링되고 있습니다. 안전한 방식으로 콘텐츠를 이용하시겠습니까?', 'warning');
      // 새로고침 카운터 초기화
      sessionStorage.setItem('refreshCount', 0);
    }
    
    // 10초 후 첫 번째 알림 팝업 표시 (한 세션에 한 번만)
    if (!stayPromptShown1) {
      stayTimer1 = setTimeout(function() {
        createCustomPopup('더 가치 있는 정보를 발견했습니다! 당신에게 도움이 될 특별한 콘텐츠가 있습니다. 지금 확인해 보시겠습니까?', 'info');
        // 프롬프트가 표시되었음을 저장
        sessionStorage.setItem('stayPromptShown1', 'true');
      }, 10000); // 10초
    }
    
    // 30초 후 두 번째 알림 팝업 표시 (한 세션에 한 번만)
    if (!stayPromptShown2) {
      stayTimer2 = setTimeout(function() {
        createCustomPopup('더 가치 있는 정보를 발견했습니다! 당신에게 도움이 될 특별한 콘텐츠가 있습니다. 지금 확인해 보시겠습니까?', 'info');
        // 프롬프트가 표시되었음을 저장
        sessionStorage.setItem('stayPromptShown2', 'true');
      }, 30000); // 30초
    }
    
    // 페이지를 떠날 때 타이머 제거
    window.addEventListener('beforeunload', function() {
      clearTimeout(stayTimer1);
      clearTimeout(stayTimer2);
    });
    
    // 각 광고 요소에 클릭 이벤트 리스너 추가
    adElements.forEach(ad => {
      ad.addEventListener('click', function() {
        // 클릭할 때마다 카운터 증가
        adClickCount++;
        localStorage.setItem('adClickCount', adClickCount);
        
        // 3번째 클릭 시 팝업 표시
        if (adClickCount === 3) {
          createCustomPopup('알림: 연속된 광고 클릭은 AdSense 정책에 위배됩니다. 이 행동은 모니터링되고 있습니다. 안전한 방식으로 콘텐츠를 이용하시겠습니까?', 'warning');
          // 카운터 초기화
          localStorage.setItem('adClickCount', 0);
        }
      });
    });
  });
})();
