// 광고 클릭, 새로고침 횟수, 체류 시간을 추적하는 코드 - 전면 팝업 버전
(function() {
  // 페이지가 로드될 때 실행
  document.addEventListener('DOMContentLoaded', function() {
    // 관리자 모드 확인 (티스토리 관리자 모드에서는 실행하지 않음)
    if (document.querySelector('.admin_menu') || 
        document.querySelector('.td_admin') || 
        window.location.href.includes('/manage/') || 
        window.location.href.includes('/admin/') ||
        document.querySelector('.btn-admin-mode') ||
        document.querySelector('#tt-body-page.tistory_admin_on')) {
      return; // 관리자 모드일 경우 실행 중단
    }
    
    // 본문 페이지인지 확인 (entry, post가 URL에 포함되어 있는지 확인)
    if (!window.location.href.includes('/entry/') && 
        !window.location.href.includes('/post/') && 
        !document.querySelector('.entry, .article, .post-content, .entry-content')) {
      return; // 본문 페이지가 아닐 경우 실행 중단
    }
    
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
    
    // CSS 스타일 주입 (티스토리 호환성 향상)
    const injectStyles = function() {
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        .custom-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .custom-popup-container {
          width: 90%;
          max-width: 500px;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        .custom-popup-header {
          padding: 15px;
          color: #fff;
          font-weight: bold;
          font-size: 18px;
          text-align: center;
        }
        .custom-popup-header.info {
          background: #4CAF50;
        }
        .custom-popup-header.warning {
          background: #ff6b6b;
        }
        .custom-popup-message {
          padding: 20px;
          font-size: 16px;
          line-height: 1.5;
          text-align: center;
        }
        .custom-popup-buttons {
          display: flex;
          padding: 0 20px 20px;
          justify-content: center;
          gap: 10px;
        }
        .custom-popup-button {
          flex: 1;
          max-width: 150px;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        }
        .custom-popup-button.primary-info {
          background: #4CAF50;
          color: white;
        }
        .custom-popup-button.primary-warning {
          background: #ff6b6b;
          color: white;
        }
        .custom-popup-button.secondary {
          background: #f1f1f1;
          color: #333;
        }
      `;
      document.head.appendChild(styleEl);
    };
    
    // 스타일 주입 실행
    injectStyles();
    
    // 전면 팝업 생성 함수 - 티스토리 호환성 향상 버전
    function createCustomPopup(message, type) {
      // 이미 팝업이 있으면 제거
      const existingPopup = document.getElementById('custom-popup');
      if (existingPopup) {
        existingPopup.remove();
      }
      
      // DOM 조작을 최소화한 팝업 생성 - innerHTML 사용
      const popupElement = document.createElement('div');
      popupElement.id = 'custom-popup';
      popupElement.className = 'custom-popup-overlay';
      
      const headerText = type === 'warning' ? '⚠️ 주의' : '💡 알림';
      const buttonText1 = type === 'warning' ? '계속 이용하기' : '지금 확인하기';
      const buttonText2 = type === 'warning' ? '다른 곳으로 이동' : '나중에 볼게요';
      const primaryClass = type === 'warning' ? 'primary-warning' : 'primary-info';
      
      popupElement.innerHTML = `
        <div class="custom-popup-container">
          <div class="custom-popup-header ${type}">${headerText}</div>
          <div class="custom-popup-message">${message}</div>
          <div class="custom-popup-buttons">
            <button id="popup-button-1" class="custom-popup-button ${type === 'warning' ? 'secondary' : primaryClass}">${buttonText1}</button>
            <button id="popup-button-2" class="custom-popup-button ${type === 'warning' ? primaryClass : 'secondary'}">${buttonText2}</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(popupElement);
      
      // 버튼 이벤트 할당 - 티스토리 호환 방식
      const button1 = document.getElementById('popup-button-1');
      const button2 = document.getElementById('popup-button-2');
      
      if (type === 'warning') {
        // 경고 타입: 버튼1 = 계속 이용, 버튼2 = 리다이렉트
        button1.onclick = function() {
          popupElement.remove();
          localStorage.removeItem('popupVisible');
        };
        
        button2.onclick = function() {
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        };
      } else {
        // 일반 알림 타입: 버튼1 = 리다이렉트, 버튼2 = 계속 이용
        button1.onclick = function() {
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        };
        
        button2.onclick = function() {
          popupElement.remove();
          localStorage.removeItem('popupVisible');
        };
      }
      
      // 팝업 상태 저장 - 새로고침 대응
      localStorage.setItem('popupVisible', 'true');
      localStorage.setItem('popupType', type);
      localStorage.setItem('popupMessage', message);
    }
    
    // 마지막 새로고침으로부터 10초 이내면 연속 새로고침으로 간주
    if (currentTime - lastRefreshTime < 10000) {
      refreshCount++;
    } else {
      refreshCount = 1; // 10초 이상 지났으면 카운터 초기화
    }
    
    // 새로고침 시간 및 카운트 저장
    sessionStorage.setItem('lastRefreshTime', currentTime);
    sessionStorage.setItem('refreshCount', refreshCount);
    
    // 새로고침 감지 시 팝업 복원
    const popupVisible = localStorage.getItem('popupVisible') === 'true';
    if (popupVisible) {
      const popupType = localStorage.getItem('popupType');
      const popupMessage = localStorage.getItem('popupMessage');
      createCustomPopup(popupMessage, popupType);
    }
    
    // 5번 이상 연속 새로고침 시 팝업 표시
    if (refreshCount >= 5) {
      createCustomPopup('알림: 빠른 페이지 새로고침이 여러 번 감지되었습니다. 이러한 행동은 시스템에 의해 모니터링되고 있습니다. 안전한 방식으로 콘텐츠를 이용하시겠습니까?', 'warning');
      // 새로고침 카운터 초기화
      sessionStorage.setItem('refreshCount', 0);
    }
    
    // 5초 후 첫 번째 알림 팝업 표시 (한 세션에 한 번만)
    if (!stayPromptShown1) {
      stayTimer1 = setTimeout(function() {
        createCustomPopup('더 가치 있는 정보를 발견했습니다! 당신에게 도움이 될 특별한 콘텐츠가 있습니다. 지금 확인해 보시겠습니까?', 'info');
        // 프롬프트가 표시되었음을 저장
        sessionStorage.setItem('stayPromptShown1', 'true');
      }, 5000); // 5초
    }
    
    // 15초 후 두 번째 알림 팝업 표시 (한 세션에 한 번만)
    if (!stayPromptShown2) {
      stayTimer2 = setTimeout(function() {
        createCustomPopup('더 가치 있는 정보를 발견했습니다! 당신에게 도움이 될 특별한 콘텐츠가 있습니다. 지금 확인해 보시겠습니까?', 'info');
        // 프롬프트가 표시되었음을 저장
        sessionStorage.setItem('stayPromptShown2', 'true');
      }, 15000); // 15초
    }
    
    // 페이지를 떠날 때 타이머 제거 및 팝업 상태 초기화
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
