// package com.dyslexia.backend.controller;

// import com.dyslexia.backend.model.Exercise;
// import com.dyslexia.backend.model.ExerciseProgress;
// import com.dyslexia.backend.repository.ExerciseProgressRepository;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.ArrayList;
// import java.util.HashMap;
// import java.util.LinkedHashMap;
// import java.util.List;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/progress")
// public class ProgressController {

//     /*
//      * За успешно завршено ниво:
//      *
//      * 10 задачи
//      * минимум 8 поени
//      */
//     private static final int TOTAL_TASKS = 10;
//     private static final int PASS_SCORE = 8;

//     private final ExerciseProgressRepository
//             exerciseProgressRepository;


//     public ProgressController(
//             ExerciseProgressRepository
//                     exerciseProgressRepository
//     ) {

//         this.exerciseProgressRepository =
//                 exerciseProgressRepository;
//     }


//     /**
//      * Progress за еден корисник.
//      *
//      * Ги земаме сите ExerciseProgress записи
//      * и од нив ги правиме summary податоците.
//      */
//     @GetMapping("/user/{userId}")
//     public ResponseEntity<?> getUserProgress(
//             @PathVariable Long userId
//     ) {

//         List<ExerciseProgress> list =
//                 exerciseProgressRepository
//                         .findByUserIdOrderByCompletedAtDesc(
//                                 userId
//                         );

//         return ResponseEntity.ok(
//                 buildSummaries(list)
//         );
//     }


//     /**
//      * Progress за една конкретна игра.
//      */
//     @GetMapping("/user/{userId}/game/{gamesId}")
//     public ResponseEntity<?> getUserGameProgress(
//             @PathVariable Long userId,
//             @PathVariable Long gamesId
//     ) {

//         List<ExerciseProgress> list =
//                 exerciseProgressRepository
//                         .findByUserIdAndExerciseGamesId(
//                                 userId,
//                                 gamesId
//                         );

//         return ResponseEntity.ok(
//                 buildSummaries(list)
//         );
//     }


//     /**
//      * Генерална функција која од деталните
//      * ExerciseProgress записи прави summary.
//      */
//     private List<Map<String, Object>> buildSummaries(
//             List<ExerciseProgress> list
//     ) {

//         /*
//          * Клучот ќе биде:
//          *
//          * gamesId + "-" + pinNumber
//          *
//          * пример:
//          *
//          * 1-1 = Меморија, level 1
//          * 1-2 = Меморија, level 2
//          * 1-3 = Меморија, level 3
//          */
//         Map<String, Map<String, Object>> groups =
//                 new LinkedHashMap<>();


//         for (ExerciseProgress progress : list) {

//             Exercise exercise =
//                     progress.getExercise();


//             if (exercise == null
//                     || exercise.getGames() == null) {

//                 continue;
//             }


//             Long gamesId =
//                     exercise.getGames().getId();

//             Integer level =
//                     exercise.getPinNumber();


//             String key =
//                     gamesId + "-" + level;


//             Map<String, Object> group =
//                     groups.get(key);


//             /*
//              * Ако ова е првата задача
//              * од ова ниво што ја среќаваме,
//              * креираме нов summary.
//              */
//             if (group == null) {

//                 group = new HashMap<>();

//                 group.put(
//                         "gamesId",
//                         gamesId
//                 );

//                 group.put(
//                         "gameName",
//                         exercise.getGames().getName()
//                 );

//                 group.put(
//                         "gamesType",
//                         exercise.getGamesType() != null
//                                 ? exercise.getGamesType().name()
//                                 : null
//                 );

//                 group.put(
//                         "ageGroup",
//                         exercise.getAgeGroup() != null
//                                 ? exercise.getAgeGroup().name()
//                                 : null
//                 );

//                 group.put(
//                         "levelNumber",
//                         level
//                 );

//                 group.put(
//                         "score",
//                         0
//                 );

//                 group.put(
//                         "completedTasks",
//                         0
//                 );

//                 groups.put(
//                         key,
//                         group
//                 );
//             }


//             int score =
//                     (Integer) group.get("score");

//             int completed =
//                     (Integer) group.get(
//                             "completedTasks"
//                     );


//             int points =
//                     progress.getScore() == null
//                             ? 0
//                             : progress.getScore();


//             group.put(
//                     "score",
//                     score + points
//             );

//             group.put(
//                     "completedTasks",
//                     completed + 1
//             );
//         }


//         List<Map<String, Object>> result =
//                 new ArrayList<>();


//         for (Map<String, Object> group :
//                 groups.values()) {

//             int score =
//                     (Integer) group.get("score");

//             int completed =
//                     (Integer) group.get(
//                             "completedTasks"
//                     );


//             group.put(
//                     "totalTasks",
//                     TOTAL_TASKS
//             );


//             boolean passed =
//                     completed >= TOTAL_TASKS
//                             && score >= PASS_SCORE;


//             group.put(
//                     "passed",
//                     passed
//             );


//             /*
//              * Процент на ниво.
//              */
//             double percentage =
//                     TOTAL_TASKS == 0
//                             ? 0
//                             : (completed * 100.0)
//                               / TOTAL_TASKS;


//             group.put(
//                     "completionPercentage",
//                     percentage
//             );


//             result.add(group);
//         }


//         return result;
//     }
// }