# Thiet ke module quay so NOXH

## Muc tieu

Module quay so NOXH dam bao 4 yeu cau chinh:

- Du lieu dau vao duoc khoa lai truoc khi quay.
- Seed quay so co co che commit-reveal va co nguon cong khai.
- Thuat toan chon nguoi trung va phan can deterministic, co the chay lai de verify.
- Ket qua, hash va audit log duoc luu trong database de cong khai minh bach.

Phien ban hien tai dung manual input cho `xsmbResult` va `ethBlockHash`. Sau nay co the thay bang provider API ma khong can doi thuat toan tinh seed.

## Bang du lieu

### `lottery_event`

Luu dot quay cua tung du an.

Cot chinh:

- `project_id`: du an duoc quay.
- `name`: ten dot quay.
- `status`: `CREATED`, `SEED_COMMITTED`, `LOCKED`, `DRAWING`, `COMPLETED`, `FAILED`.
- `algorithm_type`: mac dinh `NOXH_COMMIT_REVEAL_V1`.
- `private_salt`: salt 256-bit, chi reveal sau khi quay.
- `commitment_hash`: SHA-256 cua private salt theo canonical format.
- `participant_hash`: hash danh sach lottery code da lock.
- `apartment_hash`: hash danh sach ma can ho da lock.
- `xsmb_draw_date`, `xsmb_result`: nguon XSMB nhap thu cong.
- `eth_chain_id`, `eth_block_number`, `eth_block_hash`: nguon Ethereum nhap thu cong.
- `clicked_timestamp`: thoi diem backend nhan request start.
- `final_seed`: seed cuoi cung de chay thuat toan.
- `sorted_normal_hash`, `sorted_winner_hash`, `sorted_apartment_hash`, `assignment_list_hash`, `result_hash`: cac hash verify ket qua.

### `lottery_participant`

Snapshot ho so tham gia tai thoi diem lock event.

Cot chinh:

- `event_id`
- `application_id`
- `lottery_code`
- `pool_type`: `PRIORITY` hoac `NORMAL`
- `priority_tags`: danh sach tag uu tien tai thoi diem lock

### `apartment_unit`

Danh sach can ho co the phan trong dot quay.

Format du lieu can ho de import/seed:

```csv
projectCode,apartmentCode,building,block,floor,unitNumber,areaSqm,bedroomCount,direction,pricePerSqm,totalPrice,status
GREEN_SKY,GS-B-0101,Green Sky,B,1,0101,45.5,1,Dong Nam,16000000,728000000,AVAILABLE
GREEN_SKY,GS-B-0102,Green Sky,B,1,0102,52.0,2,Tay Bac,16000000,832000000,AVAILABLE
```

Cot toi thieu bat buoc cho thuat toan:

- `project_id`
- `apartment_code`
- `status = AVAILABLE`

Cot mo rong de hien thi:

- `building`
- `block_name`
- `floor`
- `unit_number`
- `area_sqm`
- `bedroom_count`
- `direction`
- `price_per_sqm`
- `total_price`

### `priority_tag` va `application_priority_tag`

Dung de gan nhieu tag uu tien cho ho so. Phien ban hien tai van tuong thich voi cot cu `applications.priority_category`: neu ho so co `priority_category` thi duoc tinh la `PRIORITY` ngay ca khi chua co record trong `application_priority_tag`.

### `lottery_job`

Chong bam quay nhieu lan.

Rang buoc:

- `unique(lottery_event_id)`

Trang thai:

- `QUEUED`
- `RUNNING`
- `COMPLETED`
- `FAILED`

### `lottery_result`

Luu ket qua theo tung participant.

Cot chinh:

- `event_id`
- `participant_id`
- `lottery_code`
- `pool_type`
- `result_type`: `GUARANTEED`, `SELECTED`, `NOT_SELECTED`
- `normal_random_value`
- `winner_unit_hash`
- `apartment_id`
- `apartment_code`
- `unit_random_value`
- `draw_order`
- `created_at`

### `lottery_audit_log`

Audit log co hash chain.

Cong thuc:

```text
currentHash = SHA-256(previousHash + "|" + eventType + "|" + payload + "|" + createdAt)
```

Event types:

- `LOTTERY_CREATED`
- `PARTICIPANTS_LOCKED`
- `APARTMENTS_LOCKED`
- `SEED_COMMITTED`
- `DRAW_STARTED`
- `SEED_REVEALED`
- `NORMAL_POOL_DRAWN`
- `APARTMENTS_ASSIGNED`
- `RESULT_HASH_CREATED`
- `RESULT_PUBLISHED`
- `LOTTERY_FAILED`

## Vong doi event

### 1. Tao event

Admin tao event theo project.

Backend:

```text
privateSalt = random 256-bit
commitmentHash = SHA-256("NOXH:v1:COMMITMENT|" + privateSalt)
status = SEED_COMMITTED
audit: LOTTERY_CREATED, SEED_COMMITTED
```

Tai thoi diem nay public chi nen cong khai `commitmentHash`. `privateSalt` duoc luu DB va reveal sau khi quay.

### 2. Lock event

Admin bam `Lock event`.

Backend:

```text
SELECT FOR UPDATE lottery_event
Check status = SEED_COMMITTED
Lay applications APPROVED cua project
Chia pool:
  PRIORITY: co tag uu tien hoac priority_category khac rong
  NORMAL: khong co tag uu tien
Lay apartment_unit AVAILABLE cua project
Check availableApartmentCount >= priorityPoolSize
Sinh lotteryCode cho tung application
Snapshot vao lottery_participant
Chuyen apartment_unit sang LOCKED va gan locked_event_id
participantHash = SHA-256(canonical sorted lotteryCode list)
apartmentHash = SHA-256(canonical sorted apartmentCode list)
status = LOCKED
audit: PARTICIPANTS_LOCKED, APARTMENTS_LOCKED
```

### 3. Start draw

Admin bam quay va nhap seed source thu cong.

Input:

```text
xsmbDrawDate
xsmbResult
ethChainId
ethBlockNumber
ethBlockHash
sourceNote
```

Validation:

```text
xsmbResult: khong rong
ethChainId: so duong
ethBlockNumber: so duong
ethBlockHash: 0x + 64 ky tu hex
```

Backend:

```text
SELECT FOR UPDATE lottery_event
Check status = LOCKED
Check chua co lottery_job
Check chua co lottery_result
Tao lottery_job RUNNING
status = DRAWING
clickedTimestamp = backend UTC time
finalSeed = SHA-256(
  "NOXH:v1:FINAL_SEED|"
  + privateSalt + "|"
  + xsmbDrawDate + "|"
  + xsmbResult + "|"
  + ethChainId + "|"
  + ethBlockNumber + "|"
  + ethBlockHash + "|"
  + clickedTimestamp
)
audit: DRAW_STARTED, SEED_REVEALED
Chay thuat toan
Luu lottery_result
Gan apartment_unit ASSIGNED
status = COMPLETED
audit: NORMAL_POOL_DRAWN, APARTMENTS_ASSIGNED, RESULT_HASH_CREATED, RESULT_PUBLISHED
WebSocket: LOTTERY_STARTED, LOTTERY_COMPLETED hoac LOTTERY_FAILED
```

## Thuat toan chon nguoi trung

Input:

- Danh sach `lottery_participant` da lock.
- Danh sach `apartment_unit` da lock.
- `finalSeed`.

Priority pool:

```text
Tat ca PRIORITY deu trung suat
resultType = GUARANTEED
```

Normal pool:

```text
remainingUnits = apartmentCount - priorityPoolSize
```

Neu:

```text
remainingUnits >= normalPoolSize
```

Thi toan bo normal:

```text
resultType = SELECTED
```

Neu khong du can:

```text
normalRandomValue = SHA-256("NOXH:v1:NORMAL|" + finalSeed + "|" + lotteryCode)
Sort ASC theo normalRandomValue
Tie-break lotteryCode ASC
Top remainingUnits = SELECTED
Con lai = NOT_SELECTED
```

`sortedNormalHash`:

```text
SHA-256("NOXH:v1:SORTED_NORMAL\n" + canonical normal rows)
```

Moi row:

```text
lotteryCode|normalRandomValue|resultType
```

## Thuat toan phan can

Danh sach winners:

```text
priorityWinners + selectedNormalWinners
```

Seed phan can:

```text
apartmentSeed = SHA-256("NOXH:v1:APARTMENT|" + finalSeed)
```

Hash nguoi:

```text
winnerUnitHash = SHA-256("NOXH:v1:WINNER|" + apartmentSeed + "|" + lotteryCode)
```

Hash can:

```text
unitRandomValue = SHA-256("NOXH:v1:UNIT|" + apartmentSeed + "|" + apartmentCode)
```

Sort:

```text
Sort winners ASC theo winnerUnitHash, tie-break lotteryCode ASC
Sort apartments ASC theo unitRandomValue, tie-break apartmentCode ASC
Ghep 1-1 theo index
```

Hash:

```text
sortedWinnerHash = SHA-256("NOXH:v1:SORTED_WINNER\n" + winner rows)
sortedApartmentHash = SHA-256("NOXH:v1:SORTED_APARTMENT\n" + apartment rows)
assignmentListHash = SHA-256("NOXH:v1:ASSIGNMENTS\n" + assignment rows)
```

## Result hash

Cong thuc:

```text
resultHash = SHA-256(
  "NOXH:v1:RESULT|"
  + participantHash + "|"
  + apartmentHash + "|"
  + finalSeed + "|"
  + sortedNormalHash + "|"
  + sortedWinnerHash + "|"
  + sortedApartmentHash + "|"
  + assignmentListHash
)
```

Neu nguoi dung tai `participants.json`, `apartments.json`, `results.json`, `verification.json` va chay lai cac buoc tren ma ra cung `resultHash`, ket qua duoc xem la hop le.

## API

Admin:

```http
GET  /api/admin/lottery-events
POST /api/admin/lottery-events
POST /api/admin/lottery-events/{eventId}/lock
POST /api/admin/lottery-events/{eventId}/start
GET  /api/admin/lottery-events/apartment-units?projectId={projectId}
```

Public:

```http
GET /api/lottery-events/{eventId}/verification
GET /api/lottery-events/{eventId}/participants.json
GET /api/lottery-events/{eventId}/apartments.json
GET /api/lottery-events/{eventId}/results.json
GET /api/lottery-events/{eventId}/verification.json
```

WebSocket:

```text
Endpoint: /ws
Topic: /topic/lottery-events/{eventId}
```

Events:

- `LOTTERY_STARTED`
- `LOTTERY_COMPLETED`
- `LOTTERY_FAILED`

Phien ban sau co the stream batch:

- `DRAWING_NORMAL_POOL`
- `WINNER_BATCH_REVEALED`
- `APARTMENT_BATCH_ASSIGNED`

## Frontend

Admin page:

```text
/admin/lottery-events
```

Chuc nang:

- Tao event theo project.
- Xem commitment hash.
- Lock participants va apartments.
- Nhap manual seed source.
- Start draw.
- Xem realtime event tu WebSocket.
- Mo public verification page sau khi completed.

Public verification page:

```text
/lottery-events/{eventId}/verification
```

Hien thi:

- Tat ca hash quan trong.
- Seed source.
- Private salt sau khi reveal.
- Bang ket qua phan can.
- Link tai JSON.

## Huong mo rong

### Tu manual input sang API provider

Tao interface:

```text
SeedSourceProvider
  getXsmbResult(drawDate)
  getEthBlockAfter(timestamp)
```

Sau do thay manual input bang provider call. Cac cot DB va cong thuc `finalSeed` giu nguyen.

### Import can ho bang CSV

Them endpoint admin:

```http
POST /api/admin/projects/{projectId}/apartment-units/import
```

CSV dung format da mo ta o tren. Khi import can validate:

- `apartmentCode` khong trung trong cung project.
- `status` hop le.
- `areaSqm`, `pricePerSqm`, `totalPrice` khong am.
- Can ho da `LOCKED` hoac `ASSIGNED` khong duoc overwrite neu khong co thao tac admin rieng.
