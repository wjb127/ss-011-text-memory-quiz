# PRD: 텍스트 메모리 퀴즈 (Text Memory Quiz)

## 1. 제품 개요

텍스트나 이미지 등 학습 자료를 입력하면, 텍스트로 변환 후 핵심 단어를 랜덤으로 빈칸 처리하여 **빈칸 채우기 퀴즈**를 자동 생성하는 학습용 웹앱.

**핵심 가치**: 어떤 자료든 넣으면 즉시 암기 퀴즈가 된다.

## 2. 타겟 사용자

- 1차: 본인 도그푸딩 (개인 학습용)
- 2차: 시험 준비생, 자격증 수험생, 학생 (B2C)

## 3. 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| DB | Neon (Serverless PostgreSQL) |
| ORM | Drizzle ORM |
| 인증 | NextAuth.js v5 (Google OAuth) |
| AI/OCR | Claude API (텍스트 추출 + 핵심 단어 선별) |
| 배포 | Vercel |
| 패키지 매니저 | pnpm |

## 4. 핵심 기능 (MVP)

### 4.1. 자료 입력

| 입력 방식 | 설명 |
|-----------|------|
| 텍스트 직접 입력 | 텍스트 에디터에 직접 붙여넣기/타이핑 |
| 이미지 업로드 | 사진/스크린샷 → Claude Vision으로 텍스트 추출 |
| PDF 업로드 | PDF → 텍스트 추출 (추후 확장) |

### 4.2. 빈칸 퀴즈 생성

1. 입력된 텍스트에서 **핵심 키워드/용어**를 AI가 자동 선별
2. 선별된 단어 중 랜덤으로 N개를 빈칸(`____`)으로 치환
3. 빈칸 개수/난이도 조절 가능:
   - **쉬움**: 전체 키워드의 ~20% 빈칸
   - **보통**: ~40% 빈칸
   - **어려움**: ~60% 빈칸
4. 같은 텍스트로 **재생성** 시 다른 단어가 빈칸이 됨 (랜덤성)

### 4.3. 퀴즈 풀기

- 빈칸을 클릭하면 입력 필드 활성화
- 정답 입력 후 즉시 피드백 (맞으면 초록, 틀리면 빨강 + 정답 표시)
- 전체 완료 시 점수 표시 (맞은 개수 / 전체 빈칸 수)
- **힌트 기능**: 첫 글자 보기, 글자 수 표시

### 4.4. 자료 관리

- 입력한 자료를 **저장** (제목 + 원본 텍스트 + 생성된 키워드 목록)
- 저장된 자료 **목록** 조회
- 자료별 **학습 기록** (최근 점수, 풀이 횟수)
- 자료 **삭제**

## 5. 사용자 플로우

```
[로그인] → [대시보드]
              ├── [새 퀴즈 만들기]
              │     ├── 텍스트 입력 or 이미지 업로드
              │     ├── AI가 텍스트 추출 + 키워드 선별
              │     ├── 난이도 선택
              │     └── 퀴즈 생성 → [퀴즈 풀기 화면]
              │
              └── [내 자료 목록]
                    ├── 자료 선택 → [퀴즈 풀기 화면]
                    └── 자료 삭제
```

## 6. 데이터 모델

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| email | varchar | 이메일 |
| name | varchar | 이름 |
| image | varchar | 프로필 이미지 |
| created_at | timestamp | 가입일 |

### documents
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| title | varchar | 자료 제목 |
| original_text | text | 원본 텍스트 |
| keywords | jsonb | AI가 추출한 키워드 목록 `[{word, position, importance}]` |
| source_type | varchar | 입력 방식 (text, image, pdf) |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

### quiz_attempts
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| document_id | uuid | FK → documents |
| user_id | uuid | FK → users |
| difficulty | varchar | easy, medium, hard |
| total_blanks | int | 전체 빈칸 수 |
| correct_count | int | 맞은 개수 |
| answers | jsonb | 각 빈칸별 응답 `[{keyword, userAnswer, isCorrect}]` |
| completed_at | timestamp | 완료 시각 |

## 7. API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/documents | 자료 생성 (텍스트 입력) |
| POST | /api/documents/extract | 이미지 → 텍스트 추출 |
| GET | /api/documents | 내 자료 목록 |
| GET | /api/documents/[id] | 자료 상세 |
| DELETE | /api/documents/[id] | 자료 삭제 |
| POST | /api/quiz/generate | 퀴즈 생성 (빈칸 처리) |
| POST | /api/quiz/submit | 퀴즈 결과 제출 |
| GET | /api/quiz/history/[documentId] | 자료별 학습 기록 |

## 8. 페이지 구조

```
/                    → 랜딩 (비로그인 시) / 대시보드 (로그인 시)
/login               → 로그인
/documents           → 내 자료 목록
/documents/new       → 새 자료 입력
/documents/[id]      → 자료 상세 + 퀴즈 시작
/quiz/[documentId]   → 퀴즈 풀기 화면
/quiz/result/[attemptId] → 퀴즈 결과
```

## 9. UI/UX 요구사항

- **모바일 퍼스트** 반응형 (기본 모바일 → md: 태블릿 → lg: 데스크탑)
- 다크/라이트 모드 지원
- 퀴즈 풀기 화면: 빈칸은 밑줄 + 클릭 시 인라인 입력
- 이미지 업로드: 드래그앤드롭 + 클릭 업로드 지원
- 로딩 상태: AI 처리 중 스켈레톤/스피너 표시

## 10. MVP 범위 & 우선순위

### Phase 1 - MVP (도그푸딩)
- [x] 텍스트 직접 입력
- [x] AI 키워드 추출 (Claude API)
- [x] 빈칸 퀴즈 생성 + 풀기
- [x] 결과 확인
- [x] Google 로그인
- [x] 자료 저장/목록/삭제

### Phase 2 - 확장
- [ ] 이미지 OCR (Claude Vision)
- [ ] PDF 업로드
- [ ] 학습 통계 대시보드
- [ ] 오답 노트 (틀린 단어만 모아서 재학습)
- [ ] 자료 공유 (공개 링크)

### Phase 3 - 성장
- [ ] 스페이스드 리피티션 (간격 반복 알고리즘)
- [ ] 폴더/태그 분류
- [ ] 모바일 PWA
- [ ] 구독 과금 (Stripe)

## 11. 비기능 요구사항

- AI 응답 시간: 키워드 추출 5초 이내
- 이미지 크기 제한: 10MB
- 자료당 텍스트 길이 제한: 10,000자 (MVP)
- Rate limiting: 분당 10회 AI 호출 (사용자당)

## 12. 결정 사항

1. **AI 키워드 추출 방식**: Claude API 프롬프트 방식 채택
2. **비로그인 사용**: 허용 (비로그인으로 체험 가능, 저장은 로그인 필요)
3. **빈칸 타입**: 단어 단위
4. **정답 판정**: 완전 일치 (공백/대소문자 무시, 오타 비허용)
