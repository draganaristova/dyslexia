package com.dyslexia.backend.config;

import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.GameRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Order(2)
public class ExerciseData implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final GameRepository gameRepository;

    public ExerciseData(
            ExerciseRepository exerciseRepository,
            GameRepository gameRepository
    ) {
        this.exerciseRepository = exerciseRepository;
        this.gameRepository = gameRepository;
    }

    @Override
    public void run(String... args) {

        /*
         * 6 games × 3 pins × 3 age groups × 10 tasks
         * = 540 exercises.
         */
        if (exerciseRepository.count() >= 540) {
            return;
        }

        List<Games> games =
                gameRepository.findAll()
                        .stream()
                        .filter(g ->
                                g.getWorldNumber() != null &&
                                g.getWorldNumber() == 1
                        )
                        .sorted(
                                Comparator.comparing(
                                        Games::getOrderIndex
                                )
                        )
                        .toList();

        for (Games game : games) {

            GamesType type =
                    getGamesType(game.getOrderIndex());

            if (type == null) {
                continue;
            }

            for (AgeGroup ageGroup : AgeGroup.values()) {

                for (int pin = 1; pin <= 3; pin++) {

                    for (int task = 1; task <= 10; task++) {

                        createExercise(
                                game,
                                type,
                                ageGroup,
                                pin,
                                task
                        );
                    }
                }
            }
        }

        System.out.println(
                "======================================"
        );

        System.out.println(
                "EXERCISE DATA CREATED"
        );

        System.out.println(
                "Total exercises: "
                        + exerciseRepository.count()
        );

        System.out.println(
                "======================================"
        );
    }

    private void createExercise(
            Games game,
            GamesType type,
            AgeGroup ageGroup,
            int pin,
            int task
    ) {

        Optional<Exercise> existing =
                exerciseRepository
                        .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberAndTaskNumber(
                                game.getId(),
                                type,
                                ageGroup,
                                pin,
                                task
                        );

        if (existing.isPresent()) {
            return;
        }

        Exercise exercise =
                new Exercise();

        exercise.setGames(game);
        exercise.setGamesType(type);
        exercise.setAgeGroup(ageGroup);
        exercise.setPinNumber(pin);
        exercise.setTaskNumber(task);

        exercise.setContentJson(
                createContent(
                        type,
                        ageGroup,
                        pin,
                        task
                )
        );

        exerciseRepository.save(exercise);
    }

    private GamesType getGamesType(
            Integer orderIndex
    ) {

        if (orderIndex == null) {
            return null;
        }

        return switch (orderIndex) {

            case 1 -> GamesType.MEMORY;

            case 2 -> GamesType.WORD_BUILDING;

            case 3 -> GamesType.MISSING_LETTER;

            case 4 -> GamesType.RHYMES;

            case 5 -> GamesType.SYLLABLES;

            case 6 -> GamesType.SOUND_MANIPULATION;

            default -> null;
        };
    }

    private String createContent(
            GamesType type,
            AgeGroup ageGroup,
            int pin,
            int task
    ) {

        return switch (type) {

            case MEMORY ->
                    memory(task, pin, ageGroup);

            case WORD_BUILDING ->
                    wordBuilding(task, pin, ageGroup);

            case MISSING_LETTER ->
                    missingLetter(task, pin, ageGroup);

            case RHYMES ->
                    rhymes(task, pin, ageGroup);

            case SYLLABLES ->
                    syllables(task, pin, ageGroup);

            case SOUND_MANIPULATION ->
                    soundManipulation(task, pin, ageGroup);
        };
    }

    // =========================================================
    // MEMORY
    // =========================================================

    private String memory(
            int task,
            int pin,
            AgeGroup ageGroup
    ) {

        String[][] words = {

                {
                        "МАЧКА",
                        "МАЧКА",
                        "КУЧЕ",
                        "КУЧЕ"
                },

                {
                        "МЕЧЕ",
                        "МЕЧЕ",
                        "СОНЦЕ",
                        "СОНЦЕ"
                },

                {
                        "ТОПКА",
                        "ТОПКА",
                        "КРУША",
                        "КРУША"
                },

                {
                        "ЛАВ",
                        "ЛАВ",
                        "РИБА",
                        "РИБА"
                },

                {
                        "СНЕГ",
                        "СНЕГ",
                        "ДОМ",
                        "ДОМ"
                },

                {
                        "ЦВЕТ",
                        "ЦВЕТ",
                        "МОРЕ",
                        "МОРЕ"
                },

                {
                        "КОЊ",
                        "КОЊ",
                        "МЕЧКА",
                        "МЕЧКА"
                },

                {
                        "КНИГА",
                        "КНИГА",
                        "ОЛОВКА",
                        "ОЛОВКА"
                },

                {
                        "ПТИЦА",
                        "ПТИЦА",
                        "ДРВО",
                        "ДРВО"
                },

                {
                        "СОНЦЕ",
                        "СОНЦЕ",
                        "ЅВЕЗДА",
                        "ЅВЕЗДА"
                }
        };

        String[] item = words[(task - 1) % words.length];

        return json(
                "MEMORY",
                "Пронајди го парот.",
                List.of(item),
                item[0]
        );
    }

    // =========================================================
    // WORD BUILDING
    // =========================================================

    private String wordBuilding(
            int task,
            int pin,
            AgeGroup ageGroup
    ) {

        String[][] data = {

                {"М – Е – Ч", "МЕЧ"},
                {"Д – О – М", "ДОМ"},
                {"С – О – Н", "СОН"},
                {"Л – А – В", "ЛАВ"},
                {"К – У – Ч Е", "КУЧЕ"},
                {"М – О – Р Е", "МОРЕ"},
                {"Р – И – Б А", "РИБА"},
                {"Т – О – П К А", "ТОПКА"},
                {"К – Н – И – Г А", "КНИГА"},
                {"М – А – Ч К А", "МАЧКА"}
        };

        String[] item =
                data[(task - 1) % data.length];

        return json(
                "WORD_BUILDING",
                "Состави го зборот.",
                List.of(item[0]),
                item[1]
        );
    }

    // =========================================================
    // MISSING LETTER
    // =========================================================

    private String missingLetter(
            int task,
            int pin,
            AgeGroup ageGroup
    ) {

        String[][] data = {

                {"_ЕЧ", "М", "С", "Т", "М"},
                {"Д_М", "О", "А", "Е", "О"},
                {"С_Н", "О", "А", "Е", "О"},
                {"Л_В", "А", "О", "Е", "А"},
                {"К_ЧЕ", "У", "А", "О", "У"},
                {"М_РЕ", "О", "А", "Е", "О"},
                {"РИ_А", "Б", "П", "Д", "Б"},
                {"ТО_КА", "П", "Б", "М", "П"},
                {"КНИ_А", "Г", "К", "Б", "Г"},
                {"МАЧ_А", "К", "Г", "Т", "К"}
        };

        String[] item =
                data[(task - 1) % data.length];

        return json(
                "MISSING_LETTER",
                "Која буква недостасува?",
                List.of(
                        item[1],
                        item[2],
                        item[3]
                ),
                item[4]
        );
    }

    // =========================================================
    // RHYMES
    // =========================================================

    private String rhymes(
            int task,
            int pin,
            AgeGroup ageGroup
    ) {

        String[][] data = {

                {"МЕЧЕ", "ПЕЧЕ", "ДОМ", "ЛАВ", "ПЕЧЕ"},
                {"МАЧКА", "ТАЧКА", "СОН", "МОРЕ", "ТАЧКА"},
                {"КУЧЕ", "МУЧЕ", "РИБА", "СНЕГ", "МУЧЕ"},
                {"ДОМ", "ГРОМ", "ЛАВ", "МЕЧЕ", "ГРОМ"},
                {"СОН", "ТОН", "КУЧЕ", "МОРЕ", "ТОН"},
                {"ЛАВ", "ПРАВ", "МЕЧЕ", "РИБА", "ПРАВ"},
                {"МОРЕ", "ГОРЕ", "ДОМ", "КУЧЕ", "ГОРЕ"},
                {"РИБА", "КНИГА", "ЛАВ", "СОН", "КНИГА"},
                {"ПАТ", "МАТ", "ДОМ", "МОРЕ", "МАТ"},
                {"ЅВЕЗДА", "МЕСТА", "ЛАВ", "РИБА", "МЕСТА"}
        };

        String[] item =
                data[(task - 1) % data.length];

        return json(
                "RHYMES",
                "Најди го зборот што се римува.",
                List.of(
                        item[1],
                        item[2],
                        item[3]
                ),
                item[4]
        );
    }

    // =========================================================
    // SYLLABLES
    // =========================================================

    private String syllables(
            int task,
            int pin,
            AgeGroup ageGroup
    ) {

        String[][] data = {

                {"МА-МА", "2", "1", "3", "2"},
                {"ТА-ТА", "2", "1", "3", "2"},
                {"МЕ-ЧЕ", "2", "1", "3", "2"},
                {"КУ-ЧЕ", "2", "1", "3", "2"},
                {"МАЧ-КА", "2", "1", "3", "2"},
                {"ТОП-КА", "2", "1", "3", "2"},
                {"РИ-БА", "2", "1", "3", "2"},
                {"КНИ-ГА", "2", "1", "3", "2"},
                {"МО-РЕ", "2", "1", "3", "2"},
                {"МА-ШИ-НА", "3", "2", "4", "3"}
        };

        String[] item =
                data[(task - 1) % data.length];

        return json(
                "SYLLABLES",
                "Колку слогови има зборот " + item[0] + "?",
                List.of(
                        item[1],
                        item[2],
                        item[3]
                ),
                item[4]
        );
    }

    // =========================================================
    // SOUND MANIPULATION
    // =========================================================

    private String soundManipulation(
            int task,
            int pin,
            AgeGroup ageGroup
    ) {

        String[][] data = {

                {
                        "МАЧКА",
                        "Отстрани го првиот глас.",
                        "АЧКА",
                        "МАЧ",
                        "ЧКА",
                        "АЧКА"
                },

                {
                        "МЕЧЕ",
                        "Отстрани го првиот глас.",
                        "ЕЧЕ",
                        "МЕЧ",
                        "ЧЕ",
                        "ЕЧЕ"
                },

                {
                        "СОН",
                        "Отстрани го првиот глас.",
                        "ОН",
                        "СО",
                        "СН",
                        "ОН"
                },

                {
                        "ЛАВ",
                        "Отстрани го првиот глас.",
                        "АВ",
                        "ЛА",
                        "ЛВ",
                        "АВ"
                },

                {
                        "КУЧЕ",
                        "Отстрани го првиот глас.",
                        "УЧЕ",
                        "КУЧ",
                        "ЧЕ",
                        "УЧЕ"
                },

                {
                        "РИБА",
                        "Отстрани го првиот глас.",
                        "ИБА",
                        "РИБ",
                        "БА",
                        "ИБА"
                },

                {
                        "ТОПКА",
                        "Отстрани го првиот глас.",
                        "ОПКА",
                        "ТОПК",
                        "ПКА",
                        "ОПКА"
                },

                {
                        "КНИГА",
                        "Отстрани го првиот глас.",
                        "НИГА",
                        "КНИГ",
                        "ИГА",
                        "НИГА"
                },

                {
                        "МОРЕ",
                        "Отстрани го првиот глас.",
                        "ОРЕ",
                        "МОР",
                        "РЕ",
                        "ОРЕ"
                },

                {
                        "МАШИНА",
                        "Отстрани го првиот глас.",
                        "АШИНА",
                        "МАШИН",
                        "ШИНА",
                        "АШИНА"
                }
        };

        String[] item =
                data[(task - 1) % data.length];

        return json(
                "SOUND_MANIPULATION",
                item[1] + " " + item[0] + ".",
                List.of(
                        item[2],
                        item[3],
                        item[4]
                ),
                item[5]
        );
    }

    // =========================================================
    // JSON
    // =========================================================

    private String json(
            String type,
            String question,
            List<String> options,
            String answer
    ) {

        StringBuilder optionsJson =
                new StringBuilder("[");

        for (int i = 0; i < options.size(); i++) {

            if (i > 0) {
                optionsJson.append(",");
            }

            optionsJson
                    .append("\"")
                    .append(escape(options.get(i)))
                    .append("\"");
        }

        optionsJson.append("]");

        return "{"
                + "\"type\":\"" + escape(type) + "\","
                + "\"question\":\"" + escape(question) + "\","
                + "\"options\":" + optionsJson + ","
                + "\"answer\":\"" + escape(answer) + "\""
                + "}";
    }

    private String escape(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}