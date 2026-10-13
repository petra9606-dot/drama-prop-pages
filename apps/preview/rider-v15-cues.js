// Generated from native RiderCueData.ts; do not edit by hand.
const RIDER_CUES = {
  "presets": [
    {
      "seconds": 300,
      "label": "5분"
    },
    {
      "seconds": 240,
      "label": "4분"
    },
    {
      "seconds": 180,
      "label": "3분"
    },
    {
      "seconds": 120,
      "label": "2분"
    },
    {
      "seconds": 60,
      "label": "1분"
    },
    {
      "seconds": 30,
      "label": "30초"
    },
    {
      "seconds": 10,
      "label": "10초"
    }
  ],
  "areas": {
    "bonus": {
      "left": 0,
      "top": 72,
      "width": 42,
      "height": 125
    },
    "standard": {
      "left": 0,
      "bottom": 92,
      "width": 62,
      "height": 70
    },
    "special": {
      "right": 0,
      "bottom": 92,
      "width": 62,
      "height": 70
    },
    "timeMenu": {
      "left": 0,
      "top": 208,
      "width": 38,
      "height": 62
    },
    "tenSeconds": {
      "left": 0,
      "top": 276,
      "width": 38,
      "height": 62
    },
    "waiting": {
      "bottom": 0,
      "left": "36%",
      "width": 86,
      "height": 52
    }
  },
  "guide": [
    {
      "id": "logo",
      "number": "1",
      "title": "앱 로고",
      "gesture": "0.8초 길게 누르기",
      "action": "촬영 CONTROL 열기",
      "detail": "화면 맨 위 왼쪽의 달림콜 로고를 길게 누릅니다. 시간 변경, 보너스, 콜과 검은 화면 촬영을 제어할 수 있습니다."
    },
    {
      "id": "bonus",
      "number": "2",
      "title": "왼쪽 가장자리 · 상단",
      "gesture": "0.65초 길게 누르기",
      "action": "도착 보너스 화면 띄우기",
      "detail": "지도 왼쪽 위 가장자리의 빈 영역입니다. 10분 보너스 촬영을 새로 시작하고, 확인을 누르면 타이머 화면으로 넘어갑니다."
    },
    {
      "id": "timeMenu",
      "number": "3",
      "title": "왼쪽 가장자리 · 중앙 위",
      "gesture": "0.65초 길게 누르기",
      "action": "남은 시간 바로 순환 변경",
      "detail": "누를 때마다 5분 → 4분 → 3분 → 2분 → 1분 → 30초 → 10초 → 다시 5분으로 바로 바뀝니다. 선택창이나 확인창 없이 변경된 시간부터 카운트다운이 이어집니다."
    },
    {
      "id": "timeEdit",
      "number": "4",
      "title": "타이머 카드 · LIVE 바로 위 빈칸",
      "gesture": "한 번 누르기",
      "action": "같은 순서로 시간 바로 변경",
      "detail": "타이머 카드 오른쪽 위의 비어 있는 72 × 28 영역입니다. ③과 같은 순서를 공유하므로 두 영역을 번갈아 눌러도 다음 시간으로 바뀝니다. 글씨나 아이콘은 표시되지 않습니다. 타이머가 보이는 화면에서만 사용할 수 있습니다."
    },
    {
      "id": "tenSeconds",
      "number": "5",
      "title": "왼쪽 가장자리 · 중앙 아래",
      "gesture": "0.65초 길게 누르기",
      "action": "10초로 바로 변경",
      "detail": "기존 종료 직전 단축 버튼입니다. 순환 순서와 무관하게 즉시 10초부터 시작합니다. 보너스 실패 장면을 준비할 때 사용할 수 있습니다. 이 버튼을 쓴 뒤 ③ 또는 ④를 누르면 다시 5분이 됩니다."
    },
    {
      "id": "standard",
      "number": "6",
      "title": "왼쪽 가장자리 · 하단",
      "gesture": "0.65초 길게 누르기",
      "action": "표준 배달콜 띄우기",
      "detail": "기본 2,800원 콜입니다. 상호·주소·금액은 촬영 설정을 따릅니다. 대기 상태에서 띄우면 콜을 기다리는 중 배경이 유지됩니다."
    },
    {
      "id": "special",
      "number": "7",
      "title": "오른쪽 가장자리 · 하단",
      "gesture": "0.65초 길게 누르기",
      "action": "특별 배달콜 띄우기",
      "detail": "기본 4,000원 특별 콜입니다. 별도 색상의 상단 표시와 특별 콜 화면이 나옵니다. 상호·주소·금액은 촬영 설정을 따릅니다."
    },
    {
      "id": "waiting",
      "number": "8",
      "title": "화면 맨 아래 · 중앙 빈칸",
      "gesture": "0.65초 길게 누르기",
      "action": "콜 대기 화면으로 이동",
      "detail": "보너스 타이머와 가상 이동을 멈추고 콜을 기다리는 화면으로 돌아갑니다. 다음 촬영을 준비할 때 사용합니다."
    },
    {
      "id": "blackExit",
      "number": "9",
      "title": "검은 화면 맨 아래 · 빈 공간",
      "gesture": "0.8초 길게 누르기",
      "action": "검은 화면 촬영 종료",
      "detail": "검은 화면 팝업 촬영에서만 작동합니다. 팝업이 오기 전 종료하면 남은 팝업 예약도 취소됩니다. 휴대폰 뒤로가기로도 종료할 수 있습니다."
    }
  ]
};
