# DisolveWorks 웹 업로드 기능 설정

## 1) GitHub에 이 폴더 전체 업로드
기존 저장소의 루트에 이 ZIP의 내용물을 그대로 넣고 Commit / Push 하세요.
`package.json`, `netlify.toml`, `netlify/functions/`, `admin/` 폴더가 반드시 함께 올라가야 합니다.

## 2) Netlify 관리자 비밀번호 환경변수 설정
Netlify 프로젝트에서:
Project configuration → Environment variables → Add a variable

- Key: `DISOLVE_ADMIN_PASSWORD`
- Value: 원하는 관리자 비밀번호

저장 후 새 Deploy를 실행하세요.

## 3) 관리자 페이지 접속
`https://내주소.netlify.app/admin/`

로그인 후:
- 프로젝트: 피라밋
- 부: 1~12부
- 씬
- 화면 이름
- 파일

을 선택해 업로드하면 됩니다.

## 4) 저장 위치
웹에서 업로드한 파일은 GitHub가 아니라 Netlify Blobs의
`disolveworks-uploads` store에 저장됩니다.
새로 배포해도 유지됩니다.

## 5) 현재 업로드 제한
Netlify Functions의 buffered payload 제한 때문에 이 버전은 안전하게 파일당 4MB로 제한했습니다.
HTML, PNG/JPG/WEBP/GIF, PDF, PPTX, XLSX, DOCX, TXT, ZIP을 받을 수 있습니다.
HTML/이미지/PDF는 브라우저에서 바로 열리고, Office/ZIP 파일은 다운로드됩니다.

## 6) 기존 정적 파일
현재 있던:
- 피라밋 → 1부 → 46씬 → 진술서
- 피라밋 → 4부 → 23씬 → 고객상담 CRM
은 그대로 유지됩니다.

웹에서 새로 올린 파일은 해당 `N부` 페이지의 "웹에서 업로드한 페이지" 영역에 자동 표시됩니다.
