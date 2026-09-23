Да. Од сега можеме да го користиме ова како **краток project status** и кога ќе ми го пратиш во нов разговор ќе знам каде сме.

# ЛексиЛенд — PROJECT STATUS

### Stack

* Frontend: **React + Vite**
* Backend: **Java + Spring Boot**
* Database: **PostgreSQL**
* Authentication: **JWT + BCrypt**
* DB communication: **JPA/Hibernate**

### Frontend — готово

* ✅ Home/Main page
* ✅ Register page/UI
* ✅ Login page/UI
* ✅ Forgot Password page/UI
* ✅ Game Selection page
* ✅ World/Game Path page
* ✅ Profile page
* ⏳ Progress page — треба да се направи
* ⏳ 6 игри × 3 нивоа = **18 game configurations**

### Backend — моментално

* ✅ Spring Boot project
* ✅ `User`
* ✅ `Games`
* ✅ `TrackingProgress`
* ✅ `Exercise`
* ✅ `AgeGroup`
* ✅ Repositories
* ✅ `LoginRequest`
* ✅ `RegisterRequest`
* ✅ `ForgotPasswordRequest`
* ✅ `AuthResponse`
* ✅ `JwtUtil`
* ✅ `JwtAuthFilter` — направен/се средува
* ✅ `SecurityConfig` — направен/се средува
* ✅ `AuthController` — Register/Login основа
* ⏳ Forgot Password endpoint
* ⏳ JWT authentication целосно тестирање
* ⏳ User/Profile endpoints
* ⏳ Games endpoints
* ⏳ Exercise endpoints
* ⏳ Progress endpoints
* ⏳ поврзување со frontend

### PostgreSQL

* ✅ PostgreSQL 18 инсталиран
* ✅ pgAdmin работи
* ✅ database `dyslexia` креирана
* ⏳ проверка/креирање на сите табли преку JPA
* ⏳ внесување initial games/exercises

### Модел на апликацијата

```text
PostgreSQL
   │
   ├── users
   │
   ├── games
   │
   ├── exercises
   │
   └── tracking_progress
          │
          ├── user
          ├── game
          └── level
```

### Планирани игри

1. **Memory**

   * 5–7: слика ↔ почетна буква
   * 7–10: слика ↔ збор
   * 10–15: збор ↔ збор со сличен правопис

2. **Missing Letter**

   * збор со празна буква
   * тежината расте според ниво

3. **Build a Word**

   * понудени букви
   * детето ги клика по ред за да го состави зборот

4. **Sentence Comprehension**

   * илустрација + реченица + прашање + избор на одговор

5. **Game 5**

   * концептот допрва ќе го дефинираме

6. **Game 6**

   * концептот допрва ќе го дефинираме

### Progress / unlocking логика

```text
User
 ↓
Game
 ↓
Level 1
 ↓
доволна успешност
 ↓
Level 2
 ↓
доволна успешност
 ↓
Level 3
```

Возраст:

```text
5–7
7–10
10–15
```

се користи за почетно прилагодување, а тежината се контролира преку нивоа.

---

# Што останува да направиме — редослед

### WEEK 1 — Backend foundation

1. ⏳ Средување `User`
2. ⏳ `JwtUtil`
3. ⏳ `JwtAuthFilter`
4. ⏳ `SecurityConfig`
5. ⏳ `AuthController`
6. ⏳ Register
7. ⏳ Login
8. ⏳ Logout
9. ⏳ JWT testing
10. ⏳ PostgreSQL connection
11. ⏳ проверка на `users` table

### WEEK 2 — Games + Exercises

12. ⏳ дефинирање на конечните 6 игри
13. ⏳ `Games`
14. ⏳ `Exercise`
15. ⏳ 3 нивоа по игра
16. ⏳ внесување exercises
17. ⏳ Games API
18. ⏳ Exercise API

### WEEK 3 — Progress

19. ⏳ `TrackingProgress`
20. ⏳ save score
21. ⏳ attempts
22. ⏳ completed
23. ⏳ unlock logic
24. ⏳ Progress API
25. ⏳ Progress page
26. ⏳ поврзување Game Path со database

### WEEK 4 — Frontend integration + testing

27. ⏳ Login → JWT
28. ⏳ Register → PostgreSQL
29. ⏳ Logout
30. ⏳ Profile → database
31. ⏳ Games → backend
32. ⏳ Exercises → backend
33. ⏳ Progress → backend
34. ⏳ сите 18 игри
35. ⏳ тестирање
36. ⏳ bug fixing
37. ⏳ final cleanup

---

## Најважно за моменталната позиција

**Последно поправено:**

```text
AuthController
└── LoginResponse → AuthResponse ✅
User
└── private User() → public User() ✅
```

Сега следниот чекор е:

```text
JwtAuthFilter
      ↓
SecurityConfig
      ↓
PostgreSQL connection
      ↓
Register/Login test
```

Ова можеш да ми го пратиш во иднина како:

> **ЛЕКСИЛЕНД STATUS — Week 1**
>
> Stack: React/Vite + Java Spring Boot + PostgreSQL + JWT
> Frontend: Home, Register, Login, Forgot Password, Games, WorldPath, Profile готови.
> Backend: User, Games, Exercise, TrackingProgress, repositories, DTOs, JwtUtil, JwtAuthFilter, SecurityConfig, AuthController.
> PostgreSQL 18 + database `dyslexia` готови.
> AuthController и User constructor поправени; последно работиме на JWT/Security.
> Следно: продолжи од последниот backend чекор, не од нула.
> План: Auth → DB → Games/Exercises → Progress → 18 games → frontend integration → testing.

Тоа е доволно кратко за јас веднаш да знам **што имаш, што е готово и каде да продолжиме**.
