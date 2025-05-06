// 새로고침 방지 및 강제 모달 코드
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // 기존 상태 확인
    const modalState = localStorage.getItem('modalState');
    
    function createBlockingModal(message) {
      // iframe으로 전체 페이지를 덮는 모달 생성
      const modalFrame = document.createElement('iframe');
      modalFrame.id = 'modal-iframe';
      modalFrame.style.position = 'fixed';
      modalFrame.style.top = '0';
      modalFrame.style.left = '0';
      modalFrame.style.width = '100%';
      modalFrame.style.height = '100%';
      modalFrame.style.border = 'none';
      modalFrame.style.zIndex = '2147483647'; // 최대 z-index 값
      document.body.appendChild(modalFrame);
      
      // iframe 내부에 모달 콘텐츠 추가
      const frameDoc = modalFrame.contentDocument || modalFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: rgba(0,0,0,0.7);
              font-family: Arial, sans-serif;
            }
            .modal-content {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              text-align: center;
              width: 300px;
            }
            button {
              margin: 10px;
              padding: 8px 15px;
              border: none;
              border-radius: 3px;
              cursor: pointer;
              font-weight: bold;
            }
            .confirm-btn {
              background-color: #4CAF50;
              color: white;
            }
            .cancel-btn {
              background-color: #f44336;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="modal-content">
            <p>${message}</p>
            <div>
              <button class="confirm-btn">확인</button>
              <button class="cancel-btn">취소</button>
            </div>
          </div>
          <script>
            document.querySelector('.confirm-btn').addEventListener('click', function() {
              parent.postMessage('confirm', '*');
            });
            document.querySelector('.cancel-btn').addEventListener('click', function() {
              parent.postMessage('cancel', '*');
            });
            // 브라우저의 뒤로가기, 새로고침 등을 방지
            window.onbeforeunload = function() {
              return "정말 페이지를 떠나시겠습니까?";
            };
          </script>
        </body>
        </html>
      `);
      frameDoc.close();
      
      // 모달 상태 저장
      localStorage.setItem('modalState', 'open');
      localStorage.setItem('modalMessage', message);
      
      // iframe의 메시지 수신 처리
      window.addEventListener('message', function messageHandler(e) {
        if (e.data === 'confirm') {
          // 확인 버튼 클릭 처리
          modalFrame.remove();
          window.removeEventListener('message', messageHandler);
          localStorage.removeItem('modalState');
          localStorage.removeItem('modalMessage');
          window.location.href = window.redirectTarget || 'https://www.tistory.com/';
        } else if (e.data === 'cancel') {
          // 취소 버튼 클릭 처리
          modalFrame.remove();
          window.removeEventListener('message', messageHandler);
          localStorage.removeItem('modalState');
          localStorage.removeItem('modalMessage');
        }
      });
      
      // 새로고침 방지 (이 방법은 일부 브라우저에서만 작동)
      window.onbeforeunload = function() {
        return "정말 페이지를 떠나시겠습니까?";
      };
    }
    
    // 모달이 이전에 열려 있었다면 다시 표시
    if (modalState === 'open') {
      const message = localStorage.getItem('modalMessage') || '더 좋은 정보를 보러 가시겠습니까?';
      createBlockingModal(message);
    }
    
    // 10초 후 모달 표시
    setTimeout(function() {
      if (localStorage.getItem('modalState') !== 'open') {
        createBlockingModal('더 좋은 정보를 보러 가시겠습니까?');
      }
    }, 10000);
  });
})();
