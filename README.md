# 🏃🏻‍♂️🏃🏻‍♀️ 러너스하이 Server Repository 🏃🏻‍♂️🏃🏻‍♀️

<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/로고.png" width="40%" height="40%">

## 러닝을 게임처럼, 러너스하이

- SOPT 26th APPJAM

- 프로젝트 기간: 2020.06.27 ~ 2020.07.18

## 📑 About Project

<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/WorkFlow.jpg" width="50%" height="50%">

**✨ 기존 러닝 어플리케이션과의 확실한 차별화 요소를 적용했습니다.**
   - 사용자는 '실시간 경쟁'이라는 게이미피케이션 요소를 통해 지루한 러닝이 아닌, 게임처럼 유쾌한 러닝을 즐길 수 있습니다.

**✨ "따로, 또 같이" 함께 하는 가치를  추구하고자 합니다.**
   - 어떤 단체에 소속되지 않아도, 굳이 친구와 약속을 잡고 만나지 않아도, 사용자는 언제 어디서든 나와 함께 뛸 상대를 찾아 같이 러닝을 즐길 수 있습니다.    
   
**✨ 트렌디한 디자인적 요소를 통해 시각적인 즐거움을 얻을 수 있습니다.**                                                 
   - 특정 목표를 달성하면 획득할 수 있는 개성있는 여러 가지 뱃지뿐만 아니라 다양한 러너 랭킹을 통해 사용자의 즐거움을 도모하고자 합니다.
     또, 누구나 사용하기 쉬운 UX 요소는 즐거움을 배로 향상시켜 줄 거예요.


##  :loudspeaker: 핵심 기능

### 1. 실시간 매칭

<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/runningmain.PNG" width="20%" height="50%">   

- 러닝목표시간, 러너의 성별에 맞는 사람을 실시간으로 매칭한다.
   - 매칭이 된다면, 소켓 통신을 통해 상대방 러너와 대결을 시작한다.
   - 매칭이 되지 않는다면, 과거의 자신과 대결하게 된다.
### 2. 러닝    

<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/runningbattle.PNG" width="20%" height="50%">   

- 실제 달리고 있는 거리, 시간, 페이스 등을 실시간으로 알려준다. 
- 실시간으로 상대방이 어느 정도 달렸는지 보여준다. 
- 음성피드백을 통해, 현재 몇 시간이 남았는지 알려준다. 
- 자신이 달렸던 길을 좌표, 지도를 통해 경로를 그려준다. 

### 3. 러닝 기록   

<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/runningrecord.PNG" width="20%" height="50%">   

- 이전에 달렸던 나의 러닝 기록들을 볼 수 있다.
- 기록에는 거리, 시간, 페이스, 지도경로를 보여준다. 
- 과거에 같이 뛰었던 상대방의 정보도 알려준다. 

### 4. 러닝 랭킹   

<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/runnerRanking.PNG" width="20%" height="50%">    

- 한 달을 기준으로 하는 러너 랭킹 ( 이달의 러너, 명예의 전당, 졌.잘.싸)
- 뱃지 기능을 통해 러닝을 하는 것에 있어 즐거움을 느끼도록 유도한다.


## 📚 API DOCS    

[Api Description Link](https://github.com/RunnersHi/RunnersHi_Server/wiki)


## 📂 ERD    

![ERD](https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/erd%EB%AA%A8%EB%8D%B8.png)

### 🏃‍♂️ user 🏃‍♀️

서비스 사용자의 정보를 담고 있는 테이블

| Column | type |  설명 | PK/FK |
| :----: | :------: | :----------------------: | :----: |
| user_idx | INT | 사용자의 인덱스값 | PK |
| nickname | VARCHAR | 사용자의 닉네임 |  |
| id | VARCHAR | 사용자의 ID |  |
| password | VARCHAR | 사용자의 비밀번호 |  |
| salt | VARCHAR | 사용자의 비밀번호 Salt |  |
| gender | INT | 사용자의 성별 |  |
| level | INT | 사용자의 레벨(초급, 중급, 고급) |  |
| log_visibility | TINYINT | 사용자의 러닝 기록 조회 가능 여부(False일 시 랭킹에 해당 유저 비포함) |  |
| image | INT | 사용자의 프로필 이미지 |  |
| badge | VARCHAR | 사용자의 배지 소유여부, 12자리 이진수값. ex) 101011000000: 1, 3, 5, 6번 배지 소유 |  |


### 🎮 game 🕹️

게임 진행 시 해당 게임의 정보를 담고 있는 테이블

| Column | type |  설명 | PK/FK |
| :----: | :------: | :----------------------: | :----: |
| game_idx | INT | 게임의 인덱스값 | PK |


### 🏅 run 🏆

게임 종료 후 러닝에 대한 정보를 담고 있는 테이블   

| Column | type |  설명 | PK/FK |
| :----: | :------: | :----------------------: | :----: |
| run_idx | INT | 러닝의 인덱스값 | PK |
| user_idx | INT | 러닝 사용자의 인덱스값 | FK |
| game_idx | INT | 게임 인덱스값 | FK |
| distance | INT | 러닝 거리(m) |  |
| time | INT | 러닝 시간(초) |  |
| result | INT | 러닝 결과(1: Win, 2: Lose, 3: Escape, 4: nothing, 5: tie) |  |
| created_time | DATETIME | 러닝 데이터 생성시간(매칭 완료 시간) |  |
| end_time | DATETIME | 러닝 데이터 완료시간(러닝 완료 시간) |  |



### :chart_with_upwards_trend: coordinate
running 중 수집한 위치 좌표 정보를 담고 있는 테이블

| Column | type |  설명 | PK/FK |
| :----: | :------: | :----------------------: | :----: |
| coordinate_idx | INT | coordinate의 인덱스값(PK) | PK |
| run_idx | INT | 러닝의 인덱스값 | FK |
| latitude | DOUBLE | 위도 |  |
| longitude | DOUBLE | 경도 |  |


## ⚙️ Dependencies
```

   "dependencies": {
    "base64url": "^3.0.1",
    "clean-css": "^4.2.3",
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "^4.17.1",
    "express-validation": "^3.0.5",
    "helmet": "^3.23.3",
    "http-errors": "~1.6.3",
    "iconv-lite": "^0.6.2",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.27.0",
    "moment-timezone": "^0.5.31",
    "morgan": "~1.9.1",
    "mysql": "^2.18.1",
    "nodemailer": "^6.4.10",
    "pool": "^0.4.1",
    "promise-mysql": "^4.1.3",
    "pug": "2.0.0-beta11",
    "socket.io": "^2.3.0"
  }

```


### ARICHTECTURE
<img src="https://github.com/RunnersHi/RunnersHi_Server/blob/master/runners_server/readmeimg/runningbattle.PNG" width="40%" height="40%">    



### 💻 역할분담

------------

:boy:[오태진](https://github.com/ORANZINO)
- DB 설계 및 구축
- 소켓 통신

:woman: [유가희](https://github.com/yougahee)
- DB 설계 및 구축
- 랭킹, 기록 관련 API

:boy:[주세환](https://github.com/famer9716)
- DB 설계 및 구축
- 유저 관련 API
