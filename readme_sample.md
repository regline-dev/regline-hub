# readme.md 아래 양식처럼 새로운 내용은 추가, 기존 내용은 업데이트
# 아래 처럼 디랙토리 구조를 확실히 보여줘. 
# 아래 형식으로 내용을 변경
# 체인지로그와는 다른 성격임,  새로운 내용 추가, 기존 내요은 업데이트, 삭제 할 내용은 글씨에 가운데줄 긋기 처럼 가능한지 판단

> 환경: 로컬 단독 서버 (AWS 미사용) → Docker 배포
> 폴더 구조 기준: **배포 단위(Docker 이미지 1개 = 폴더 1개)**

---

## 1. 전체 폴더 구조

```
security_platform/
├── services/
│   ├── edge-collector/      # 514+8001+162/2055 (멀티포트) / 상시서버 / 1차 FastAPI, 프로토콜별 동시 리스닝 / 개발
│   ├── stream-aggregator/   # 포트없음 / 상시(내부 컨슈머) / Kafka Streams / 서드파티
│   ├── etl-processor/       # 8002 / 상시서버 / 2차 FastAPI, OCSF 변환 / 개발
│   ├── batch-analyzer/      # 포트없음 / 배치 / Spark·Trino 분석 잡 / 개발+서드파티
│   ├── mlops-trainer/       # 포트없음 / 배치 / MLflow 학습 파이프라인 / 개발+서드파티
│   ├── rag-service/         # 8004 / 상시서버 / Vector DB+RAG API / 개발+서드파티
│   ├── ai-agent/            # 8005 / 상시서버 / LangGraph 서버 (7~8단계) / 개발
│   ├── report-agent/        # 8006 / 상시서버 / Report 생성 그래프 (9단계) / 개발
│   ├── dashboard/           # 8080 / 상시서버 / 프론트엔드+API / 개발
│   └── log-generator/       # 포트없음 / 테스트 스크립트 / 더미 로그 생성 / 개발
│
├── infra/
│   ├── terraform/           # IaC (10단계)
│   ├── docker-compose/      # 로컬 통합 실행 (Kafka, MinIO, OpenSearch, Qdrant, Ollama)
│   └── ci-cd/               # GitLab CI/CD
│
└── README.md
```

**구분 기준**
- `services/` → 우리가 코드를 직접 작성하는 배포 단위
- `infra/` → 기성 오픈소스 소프트웨어 설치/구성 (코드 작성 없음)

---

## 2. 서비스별 상세 (포트 · 역할 · 사용 언어 · 개발/서드파티)

| 서비스 | 포트 | 동작 방식 | 역할 (레이어) | 주 사용 언어/스택 | 구분 |
|---|---|---|---|---|---|
| `edge-collector` | 514(syslog/CEF), 8001(HTTP/gRPC), 162(SNMP), 2055(NetFlow) — 멀티포트 | 상시서버 | 프로토콜별 동시 리스닝 + Fast Path 즉시 차단 (1단계) | Python (FastAPI + 별도 프로토콜 리스너) | 개발 |
| `stream-aggregator` | - | 상시(내부 컨슈머) | Kafka Streams 윈도우 집계 (1단계 후반) | Java/Kotlin (Kafka Streams) 또는 Python (faust) | 서드파티+개발 |
| `etl-processor` | 8002 | 상시서버 | OCSF 변환 + UTC 정규화 + 검증 (3단계) | Python (FastAPI) | 개발 |
| `batch-analyzer` | - | 배치 | Spark/Trino 배치 분석 (3단계) | Python (PySpark) / SQL (Trino) | 개발+서드파티 |
| `mlops-trainer` | - | 배치 | MLflow+Feast 학습 파이프라인 (5단계) | Python (MLflow, Feast, scikit-learn) | 개발+서드파티 |
| `rag-service` | 8004 | 상시서버 | Vector DB 임베딩/검색 (6단계) | Python (LangChain, Qdrant client) | 개발+서드파티 |
| `ai-agent` | 8005 | 상시서버 | Supervisor/Process/Action 추론 (7~8단계) | Python (**LangGraph**, LangChain) | 개발 |
| `report-agent` | 8006 | 상시서버 | 보고서 자동 생성 (9단계) | Python (**LangGraph** 또는 LangChain 단독) | 개발 |
| `dashboard` | 8080 | 상시서버 | SOC UI + 조회 API (9단계) | TypeScript (React) + Python (FastAPI) | 개발 |
| `log-generator` | - | 테스트 스크립트 | 더미 로그 생성/주입 | Python (Faker) | 개발 |

---

## 3. LangGraph / LangChain 적용 범위 (확정)

```
1~4단계 (Edge~DataLake)   → LangGraph/LangChain 사용 안 함 (순수 데이터 파이프라인)
5단계 (MLOps)             → 사용 안 함 (모델 학습/추론 전용)
6단계 (KB/RAG)            → LangChain만 사용 (체이닝 단순, 그래프 불필요)
7~8단계 (AI Agent~SOAR)   → LangGraph 핵심 사용 구간 ★
9단계 (Report)            → LangGraph 사용 (7~8단계와는 별도의 독립 그래프)
10단계 (DevOps)           → 사용 안 함 (인프라 코드, LLM 무관)
```

### 7~8단계 통합 그래프 구조 (확정)

```python
하나의 StateGraph (ai-agent 서비스 안에 위치)
─────────────────────────────────
START
  → supervisor_node      (7단계: 작업 분배)
  → process_node         (7단계: 상황 분석)
  → action_node          (7단계: 도구 호출)
  → risk_check_node      (8단계: 위험도 판단)
      ├─ low/medium → soar_execute_node   (8단계: 자동 실행)
      └─ high       → interrupt()         (8단계: HITL 승인 대기)
  → END
```

- **HITL(Human-in-the-loop)** = LangGraph `interrupt()` 기능으로 구현
- 8단계 SOAR의 "고위험 조치 사람 승인 대기"가 `interrupt()`와 정확히 매칭됨

### 9단계 Report 그래프 (확정)

```
별도의 작은 StateGraph (report-agent 서비스 안에 위치)
─────────────────────────────────
START → collect_data_node → draft_node → format_node → END
```

7~8단계 그래프와 완전히 독립적으로 실행됨 (서로 다른 서비스, 다른 배포 단위)

---

## 4. 레이어 ↔ 서비스 매핑 (텍스트 다이어그램)

```
[1] Edge/Collection
    SIEM(syslog:514) · EDR(HTTP/gRPC:8001) · 방화벽(SNMP:162, NetFlow:2055)
    + 테스트: log-generator (각 프로토콜에 맞춰 분산 전송)
        │ 벤더 식별(classifiers)만 수행, 변환 없이 단순 통과 (가드레일 없음)
        ▼
    edge-collector (멀티포트: 514/8001/162/2055 동시 리스닝)
        │
        ├─ Fast Path (즉시 차단) ─────────────┐
        │   메모리 내 블랙리스트/rate 룰 체크    │
        │   매칭 시 → 방화벽 API 즉시 호출       │
        │   (단순 규칙만, 복잡한 분석 금지)      │
        │                                      ▼
        │                              [방화벽 즉시 차단]
        ▼ (Kafka 전달은 Fast Path와 동시/별개로 항상 진행)
    stream-aggregator (Kafka Streams, 내부 컨슈머)
        │ 폭주 로그 → 집계 단건+샘플
        ▼
[2] Ingestion  (가드레일 없음, 동시 적재)
    ┌─────────────┐     ┌──────────────┐
    │ Kafka(1일)   │     │ MinIO(원본영구)│
    │ 소스종류3개   │     │ 증거 보존      │
    │ (벤더는 메시지│     │              │
    │  필드로 구분) │     │              │
    └─────────────┘     └──────────────┘
        │
        ▼
[3] ETL  (가드레일 시작점)
    etl-processor (FastAPI, 8002)
        │ OCSF 변환 + UTC 정규화
        ▼
    변환 검증 ──실패──▶ DLQ 격리 + 알림
        │ 성공
        ▼
    category 확정 (class_uid 기준)
        │
        ▼
[4] DataLake
    ┌──────────────────┐   ┌────────────────────┐
    │ OpenSearch(Hot7일)│   │ MinIO(category분리) │
    └──────────────────┘   └────────────────────┘
        │
        │ (별도) batch-analyzer 새벽 1회 배치 분석
        │
   ┌────┴────┐
   ▼         ▼
[5] MLOps  [6] KB/RAG
mlops-trainer  rag-service(8004)
(배치)         (상시, LangChain)
   │         │
   │ UEBA점수 │ RAG검색결과
   └────┬────┘
        ▼ (병렬 합류)
[7~8] AI Agent + SOAR  ★ LangGraph 핵심
    ai-agent (8005)
    supervisor → process → action → risk_check
        ├─ low/medium → 자동 실행
        └─ high       → interrupt() HITL 승인 대기
        │
        ▼
[9] ChatOps / Report
    report-agent(8006, LangGraph)  +  dashboard(8080)
    알림/승인 채널, 보고서 자동 생성, SOC UI
        │
        ▼
[10] DevOps/IaC  (전 레이어 인프라, 데이터 흐름과 별개)
    infra/terraform, infra/ci-cd
```

---

## 5. 표준 인터페이스 규약

### 5.1 데이터 포맷 — OCSF (Open Cybersecurity Schema Framework)

3단계(ETL) 이후 모든 로그는 **OCSF 정규화 포맷**을 따른다.

```json
{
  "class_uid": 4002,
  "category_uid": 4,
  "category_name": "authentication",
  "severity_id": 3,
  "time": "2026-06-19T02:31:00Z",
  "src_endpoint": { "ip": "203.0.113.10" },
  "actor": { "user": { "name": "jdoe" } },
  "status_id": 2,
  "raw_data": "{ ...원본 로그 보존... }"
}
```

**필수 필드 (모든 OCSF 이벤트 공통)**

| 필드 | 타입 | 설명 |
|---|---|---|
| `class_uid` | int | OCSF 이벤트 클래스 ID |
| `category_uid` | int | OCSF 카테고리 ID |
| `category_name` | string | 확정된 카테고리명 (예: `network_activity`) |
| `severity_id` | int | 심각도 (1~6) |
| `time` | string (ISO8601, UTC) | 정규화된 타임스탬프 |
| `raw_data` | string | 원본 로그 보존 (증거용) |

**카테고리 매핑 예시 (확정)**

| 소스 | OCSF class_uid | category_name |
|---|---|---|
| 방화벽 로그 | 2001 (Network Activity) | `network_activity` |
| EDR 이벤트 | 5001 (Process Activity) | `process_activity` |
| SIEM 로그 | 3001 (Security Finding) | `security_finding` |
| 인증 로그 | 4002 (Authentication) | `authentication` |

---

### 5.2 모듈 간 통신 방식

| 통신 구간 | 방식 | 포맷 |
|---|---|---|
| 1단계 소스 → `edge-collector` | HTTP/syslog/SNMP 등 (소스별 상이) | 원본 그대로 (포맷 불특정) |
| `edge-collector` → `stream-aggregator`/Kafka | Kafka Producer | 원본 JSON + `vendor` 필드 (변환 없이, 식별만) |
| `stream-aggregator` → Kafka | Kafka Streams (consume→produce) | 원본 또는 집계 JSON |
| Kafka → `etl-processor` | Kafka Consumer | 원본 JSON |
| `etl-processor` → OpenSearch | REST Bulk API | **OCSF JSON** |
| `etl-processor` → MinIO | S3 API (PUT) | **OCSF JSON (Parquet 변환 시 배치)** |
| `etl-processor` → DLQ | Kafka Producer (별도 토픽) | 원본 JSON + 오류 메타데이터 |
| `rag-service` ↔ `ai-agent` | REST API (FastAPI) | JSON (질의/응답) |
| `ai-agent` 내부 (LangGraph 노드 간) | LangGraph `StateGraph` (메모리 내) | Python `TypedDict` (State) |
| `ai-agent` → `report-agent` | REST API 또는 LangGraph 외부 그래프 호출 | JSON |
| `dashboard` ↔ 전체 서비스 | REST API | JSON |

**원칙**
- **레이어 1~2(Edge, Ingestion)는 가드레일 없음** — 원본 그대로 통과
- **레이어 3(ETL)부터 가드레일 시작** — OCSF 검증 실패 시 DLQ 격리 + 알림
- 서비스 간 통신은 기본적으로 **REST(JSON)**, 단 Kafka 경유 구간은 **Producer/Consumer**
- `ai-agent` 내부 노드 간 통신만 예외적으로 **LangGraph State 객체**(프로세스 내부, 직렬화 불필요)

---

### 5.3 환경변수 규약 (`.env`)

각 서비스 폴더는 자신만의 `.env`를 가지며, 공통 키는 다음을 따른다.

```properties
# API 선택: 0=로컬(Ollama), 1=Gemini, 2=OpenAI, 3=Groq
# 확정: 로컬 Ollama는 사용하지 않음 (외부 API로 LLM 연결 — Groq 등). 메모리 부담 적어 다른 프로젝트와 동시 배포 가능.
API_SELECT=3

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

GOOGLE_API_KEY=
GOOGLE_MODEL=gemini-2.5-flash

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# 인프라 연결 정보 (infra/docker-compose 기준)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
MINIO_ENDPOINT=localhost:9000
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

---

## 6. 인프라(서드파티 소프트웨어) 기본 포트

| 인프라 | 포트 | 역할 |
|---|---|---|
| Kafka / Redpanda | 9092 | 메시지 브로커 — 토픽은 소스 종류 3개만(`logs-firewall`/`logs-siem`/`logs-edr`), 벤더는 메시지 내 `vendor` 필드로 구분 |
| MinIO | 9000 (API) / 9001 (콘솔) | S3 호환 저장소 |
| OpenSearch | 9200 | 검색 엔진 |
| MLflow UI | 5000 | 모델 트래킹 (선택적 노출) |
| Qdrant (Vector DB) | 6333 | 임베딩 저장소 |
| Ollama | 11434 | 로컬 LLM 서빙 |

---

## 7. 테스트 데이터 생성 (log-generator) — 확정 시나리오

`services/log-generator/`는 운영 장비 대신 로컬 테스트용 더미 로그를 생성한다.

| 시나리오 | 내용 |
|---|---|
| 1. 타임스탬프 갱신 | 템플릿(SIEM/EDR/방화벽) 3종의 `timestamp`를 현재 UTC로 갱신 |
| 2. 순서 랜덤화 | 3종 로그를 무작위 순서로 셔플 후 전송 |
| 3. 필드값 변조 | `src_ip`, `severity`, `action` 등 의미 있는 필드만 랜덤화 |
| 4. 비정상 끼워넣기 | 5% 확률로 필수 필드 제거 → ETL 검증 실패/DLQ 동작 테스트 |
| 5. 폭주 재현 | 동일 IP로 1000건 `deny` 생성 → `stream-aggregator` 윈도우 집계 테스트 |

> 운영 전환 시 `log-generator`는 제거하고 실제 SIEM/EDR/방화벽 장비로 대체한다.

---

## 7-0. edge-collector 세부 — 벤더 식별(분류)과 Kafka 토픽 구조 (확정)

**멀티포트 구조 (확정)**: edge-collector는 단일 포트(HTTP)가 아니라, 실제 장비가 쓰는 프로토콜별로 여러 포트를 동시에 리스닝한다.

| 소스 | 프로토콜 | 포트(가안) |
|---|---|---|
| SIEM | syslog/CEF | 514 |
| EDR | HTTP/gRPC | 8001 |
| 방화벽 | SNMP trap | 162 |
| 방화벽 | NetFlow | 2055 |

> 실제 표준 포트는 구현 시점에 재확인. 핵심은 "프로토콜마다 자기 고유 포트로 받는다"는 구조이며, 전부 HTTP 하나로 강제 통합하지 않는다.
> 이유: 실제 운영 환경 부합(장비가 원래 쓰는 프로토콜 그대로 수용), 확장성(새 프로토콜 추가 시 포트 하나만 추가, 기존 구조 안 건드림).
> `log-generator`도 이 구조에 맞춰 각 프로토콜/포트로 분산 전송한다 (단일 포트로 보내지 않음).

**중요한 원칙**: 1단계의 "식별기(classifier)"는 **변환이 아니라 분류만** 한다. 벤더 고유 포맷을 OCSF 등 공통 포맷으로 바꾸는 작업은 3단계(ETL)의 역할이며, 1단계에서 미리 수행하지 않는다.

```
services/edge-collector/
├── main.py
└── classifiers/
    ├── __init__.py
    ├── firewall/{paloalto,fortinet,sonicwall,checkpoint,juniper}.py
    ├── siem/{microsoft,google_chronicle,ibm_qradar,splunk,elastic}.py
    └── edr/{crowdstrike,defender,sentinelone,carbonblack,elastic_endpoint}.py
```

각 식별기 파일은 `is_벤더명(raw_log) -> bool` 형태의 **판단 함수 하나만** 가진다. 필드 매핑/변환 코드 금지.

**Kafka 토픽 구조**: 벤더별로 토픽을 나누지 않고(15개 → 과다), **소스 종류 3개로만** 유지한다.

```
logs-firewall   logs-siem   logs-edr
```

벤더 구분은 메시지 안 `vendor` 필드로:

```json
{
  "vendor": "paloalto",
  "raw_log": "<161>Jun 21 00:12:01 pa01 subtype=traffic...",
  "received_at": "2026-06-23T10:00:00Z"
}
```

`raw_log`는 원본 그대로(변환 없이) 보존한다.

> 이유: 토픽 과다 방지, 업계 표준 패턴(데이터 타입 기준 분리 + 벤더는 필드 구분), ETL 컨슈머 구독 단순화(벤더 추가돼도 토픽 구독 설정 변경 불필요).

**구현 순서**: 기본 수신 서버 → 방화벽 5개 벤더 식별기만 먼저 → Kafka 전달 → Fast Path(IP만) → log-generator 연동 테스트. SIEM/EDR 식별기는 방화벽 동작 확인 후 추가 (한 번에 15개 다 만들지 않음).

---

## 7-1. Fast Path (즉시 차단 경로) — 확정

정상 흐름(1~8단계 전부 거쳐 SOAR에서 차단 판단)은 즉각 대응이 필요한 공격에는 너무 느리다.
`edge-collector`는 수신 즉시 별도의 **Fast Path**를 같이 수행한다.

```
edge-collector (멀티포트: 514/8001/162/2055)
    │ 로그 수신 (어느 포트로 들어왔든 동일하게 처리)
    ├─ Fast Path: 메모리 내 블랙리스트/rate 룰 체크 (수 ms 이내)
    │      └─ 매칭 시 → 방화벽 API 즉시 호출 (실제 차단)
    └─ Kafka 전달 (정상 8단계 분석은 Fast Path와 무관하게 항상 진행)
```

**가드레일과의 구분 (혼동 주의)**

| | 가드레일 (3단계, ETL) | Fast Path (1단계, edge-collector) |
|---|---|---|
| 판단 대상 | 데이터 형식이 올바른가 | 내용이 이미 알려진 위협인가 |
| 실패/매칭 시 | DLQ 격리 (보관만, 조치 없음) | 방화벽 즉시 차단 (실제 조치) |
| 속도 요구 | 느려도 무방 | 즉시(ms 단위) |

**설계 원칙**
- Fast Path는 **단순 규칙만** (IP 블랙리스트, rate 임계값). 복잡한 분석/추론은 절대 넣지 않음 — 그건 7~8단계(AI Agent/SOAR)의 역할.
- Fast Path를 별도 서비스로 분리하지 않음 — 분리 시 전달 지연이 생겨 "즉시 차단"의 목적이 깨짐.
- 지금은 `edge-collector` 안에 포함하되, 코드는 `fast_path.py` 등 별도 모듈로 작성하여 추후 분리 가능성을 열어둔다.
- 분리 재검토 시점: 부하 증가, 협업 인원 추가 등 — 1인 개발 단계에서는 통합 유지.

**판단 등급 (3단계, 확정)**

| 등급 | 조건 | 조치 |
|---|---|---|
| 명확한 위협 | 블랙리스트 매칭 (종류는 아래 표) | 즉시 차단 (대상 종류에 따라 다른 시스템 호출) |
| 애매한 패턴 | 블랙리스트엔 없으나 rate 임계값 초과 | 즉시 대시보드 알림 + 타이머 시작 → N분 지속 시 자동 임시 차단(예: 10분) → 사람이 영구 차단/해제 결정 |
| 정상 | 위 두 경우 외 | 그대로 통과 |

> 애매한 패턴을 즉시 영구 차단하지 않는 이유: 오탐(false positive)으로 정상 트래픽을 막는 위험을 피하기 위함.
> 임시 차단 지속 시간(10분 등)과 임계값(rate 기준)은 추후 결정 — 8. 미결정 항목 참고.

**블랙리스트 종류 (설계는 5종 전부 포함, 구현은 단계적)**

| 종류 | 예시 | 출처(로그) | 조치 대상 시스템 | 구현 순서 |
|---|---|---|---|---|
| IP | 악성 IP, C2 서버 | 방화벽 로그 | 방화벽 API | 1차 (최우선) |
| 도메인 | 피싱/C2 도메인 | DNS 쿼리(EDR) | DNS sinkhole / 방화벽 | 2차 |
| 파일 해시 | 악성코드 MD5/SHA256 | EDR 프로세스 이벤트 | EDR (프로세스 종료+격리) | 3차 |
| 사용자 계정 | 탈취 확인된 계정 | SIEM 인증 로그 | IAM (강제 잠금/로그아웃) | 4차 |
| User-Agent | 알려진 봇/스캐너 패턴 | 방화벽/웹 로그 | 방화벽 API | 5차 |

> 종류별로 호출 대상 시스템이 다르므로, Fast Path 내부는 종류별 "차단 핸들러"를 분리해서 작성한다
> (예: `block_ip()`, `block_domain()`, `block_hash()` — 단일 함수로 몰아넣지 않음).
> 지금은 `block_ip()`만 구현하고 나머지는 함수 스텁(미구현 상태)으로 남겨 인터페이스만 확정해둔다.

**폴더 구조 (확정)**

```
services/edge-collector/
├── main.py                    ← 수신 + Kafka 전달만 (가벼움 유지)
└── fast_path/
    ├── blacklist_check.py     ← 매칭 판단 (등급 분류: 명확/애매/정상)
    ├── block_ip.py            ← 1차 구현
    ├── block_domain.py        ← 스텁
    ├── block_hash.py          ← 스텁
    ├── block_account.py       ← 스텁
    └── block_useragent.py     ← 스텁
```

> `main.py`는 차단 로직을 직접 갖지 않고 `fast_path/` 모듈을 호출만 한다.
> 종류가 늘어나도 `fast_path/` 안에서만 늘어나며, `edge-collector`의 "수신 서버" 역할 자체는 비대해지지 않는다.

---

## 8. 미결정 항목 (추후 결정)

- Kafka Streams 윈도우 집계 기준값 (몇 초/몇 회)
- Kafka 파티션 수, 컨슈머 그룹 설계
- `etl-processor` 다중 인스턴스 여부
- category 미매핑 신규 class_uid 처리 방식
- 장애/DLQ 알림 채널 (`dashboard` 또는 별도 Slack 연동)
- 1~3단계 메트릭 수집 방식 (Grafana 연동은 9단계, 수집 자체는 별도 결정)
- `ai-agent`의 디도스 등 "이벤트 버튼" 트리거 설계 (대시보드 연동, 추후 구체화)
- Fast Path 임시 차단 지속 시간 (예: 10분 — 가안)
- Fast Path "애매한 패턴" rate 임계값 (몇 초에 몇 회)
- Fast Path 알림이 가는 채널 (dashboard 단순 표시 vs Slack 등 즉각 알림)
- 도메인/파일해시/계정/User-Agent 블랙리스트 차단 핸들러 구현 시점 (IP 이후 순서대로)
- 블랙리스트 자체의 저장/갱신 방식 (파일, Redis, DB 등 — 출처는 별도 위협 인텔리전스 연동 여부 포함)

---

## 9. GitHub 저장소 구조 (확정)

```
멀티레포 + Organization
github.com/(조직명)/
├── edge-collector       (별도 저장소)
├── stream-aggregator    (별도 저장소)
├── ...                  (11개 서비스 각각 별도 저장소)
└── infra                (별도 저장소)
```

- 11개 서비스 각각 독립 GitHub 저장소 (배포 단위 원칙과 일치).
- Organization으로 묶어서 관리, 처음엔 **Private**로 시작.
- 기존 챗봇 프로젝트(5개 저장소 방식)와 동일한 멀티레포 패턴 유지, 다만 Organization으로 그룹화한다는 점이 차이.

---

## 10. 개발 프로세스 (확정)

```
Claude  = 설계/방향/검토 — 전체 흐름, 규약, 의사결정
Cursor  = 실제 코드 작성 — 각 서비스 폴더의 작업 지시서(TASK.md) 기반
```

- 각 서비스 폴더에 `TASK.md` 작성 → Cursor가 이 문서를 보고 구현.
- `TASK.md` 공통 패턴: ①하는 일/안 하는 일 ②폴더 구조(확정) ③구현 순서(단계별, 건너뛰기 금지) ④세부 사양 ⑤로깅 규칙 ⑥완료 기준 체크리스트 ⑦질문 필요 시점.
- AI 작업 규칙은 `AGENTS.md` 참고 (별도 파일).
