// 광고 클릭, 새로고침 횟수, 체류 시간을 추적하는 코드 - v2
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
    
    // 5번 이상 연속 새로고침 시 알림창 표시
    if (refreshCount >= 5) {
      if (!confirm('알림: 빠른 페이지 새로고침이 여러 번 감지되었습니다. 이러한 행동은 시스템에 의해 모니터링되고 있습니다. 안전한 방식으로 콘텐츠를 이용하시겠습니까?')) {
        // '취소'를 누른 경우 리다이렉트
        window.location.href = window.redirectTarget || 'https://www.tistory.com/';
      }
      // 새로고침 카운터 초기화
      sessionStorage.setItem('refreshCount', 0);
    }
    
    // 10초 후 첫 번째 알림 표시 (한 세션에 한 번만)
    if (!stayPromptShown1) {
      stayTimer1 = setTimeout(function() {
        if (confirm('더 가치 있는 정보를 발견했습니다! 당신에게 도움이 될 특별한 콘텐츠가 있습니다. 지금 확인해 보시겠습니까?')) {
          // '확인'을 누른 경우 리다이렉트
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        }
        // 프롬프트가 표시되었음을 저장
        sessionStorage.setItem('stayPromptShown1', 'true');
      }, 10000); // 10초
    }
    
    // 30초 후 두 번째 알림 표시 (한 세션에 한 번만)
    if (!stayPromptShown2) {
      stayTimer2 = setTimeout(function() {
        if (confirm('더 가치 있는 정보를 발견했습니다! 당신에게 도움이 될 특별한 콘텐츠가 있습니다. 지금 확인해 보시겠습니까?')) {
          // '확인'을 누른 경우 리다이렉트
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        }
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
        
        // 3번째 클릭 시 알림창 표시
        if (adClickCount === 3) {
          // 알림창 표시
          if (!confirm('알림: 연속된 광고 클릭은 AdSense 정책에 위배됩니다. 이 행동은 모니터링되고 있습니다. 안전한 방식으로 콘텐츠를 이용하시겠습니까?')) {
            // '취소'를 누른 경우 리다이렉트
            window.location.href = window.redirectTarget || 'https://www.tistory.com/';
          }
          // 카운터 초기화
          localStorage.setItem('adClickCount', 0);
        }
      });
    });
  });
})();
