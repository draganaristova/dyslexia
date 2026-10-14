
package com.dyslexia.backend.config.exercises;

import com.dyslexia.backend.model.AgeGroup;
import java.util.Locale;

public class ExerciseContentUtils {

    public static String basic(
            String question,
            String[] options,
            String answer
    ) {
        return "{\"question\":" + quote(question)
                + ",\"options\":" + array(options)
                + ",\"answer\":" + quote(answer) + "}";
    }

    public static String missingLetter(
            String question,
            String word,
            String[] options,
            String answer
    ) {
        return "{\"question\":" + quote(question)
                + ",\"word\":" + quote(word)
                + ",\"options\":" + array(options)
                + ",\"answer\":" + quote(answer) + "}";
    }

    public static String wordBuilding(
            String question,
            String description,
            String emoji,
            String[] letters,
            String answer
    ) {
        return "{\"question\":" + quote(question)
                + ",\"description\":" + quote(description)
                + ",\"letters\":" + array(letters)
                + ",\"emoji\":" + quote(emoji)
                + ",\"answer\":" + quote(answer)
                + ",\"correctAnswer\":" + quote(answer)
                + "}";
    }

    public static String memory(
            String question,
            String answer,
            String[][] cards
    ) {
        StringBuilder json = new StringBuilder();

        json.append("{\"question\":")
                .append(quote(question));

        json.append(",\"answer\":")
                .append(quote(answer));

        json.append(",\"cards\":[");

        for (int i = 0; i < cards.length; i++) {
            if (i > 0) {
                json.append(",");
            }

            String[] card = cards[i];

            json.append("{\"id\":")
                    .append(quote(card.length > 0 ? card[0] : ""));

            json.append(",\"pairId\":")
                    .append(quote(card.length > 1 ? card[1] : ""));

            json.append(",\"image\":")
                    .append(quote(card.length > 2 ? card[2] : ""));

            json.append(",\"label\":")
                    .append(quote(card.length > 3 ? card[3] : ""));

            json.append("}");
        }

        json.append("]}");
        return json.toString();
    }

    // Зборови за 5–7 години
    private static final String[] AGE_5_7_WORDS = {
            "дом", "сон", "мак", "рак",
            "море", "маса", "мама", "тато",
            "вода", "млеко", "куче", "мачка",
            "риба", "птица", "цвеќе", "сонце",
            "месечина", "топка", "книга", "молив",
            "јаболко", "банана", "круша",
            "автомобил", "куќа", "училиште",
            "другар", "игра", "планина", "река"
    };

    // Кратки, познати зборови за 8–10 години
    private static final String[] AGE_8_10_WORDS = {
            "кукла", "зелка", "зајак", "топка",
            "мачка", "куче", "лиса", "мече",
            "книга", "молив", "пенкало", "маса",
            "стол", "врата", "ранец", "торба",
            "риба", "пиле", "птица", "жаба",
            "јаболко", "банана", "јагода", "круша",
            "сонце", "ѕвезда", "облак", "река",
            "море", "шума", "цвет", "ракета"
    };

    // Слична тежина за 10–15 години
    private static final String[] AGE_10_15_WORDS = {
            "кукла", "зајак", "желка", "лисица",
            "верверица", "мечка", "коњ", "тигар",
            "топка", "играчка", "книга", "тетратка",
            "пенкало", "молив", "ранец", "клупа",
            "јагода", "банана", "јаболко", "морков",
            "пиперка", "домати", "зелка", "круша",
            "планина", "градина", "река", "море",
            "пеперутка", "виножито", "ракета", "авион"
    };

    // Посебни листи за играта со слогови
    private static final String[] SYLLABLES_5_7 = {
            "дом", "сон", "мак", "рак",
            "мама", "тато", "вода", "маса",
            "куче", "мачка", "риба", "книга",
            "сонце", "топка", "молив", "море",
            "банана", "јаболко", "планина",
            "месечина", "училиште", "пеперутка"
    };

    private static final String[] SYLLABLES_8_10 = {
            "кукла", "зелка", "зајак", "топка",
            "мачка", "куче", "мече", "жаба",
            "риба", "пиле", "книга", "молив",
            "јагода", "банана", "јаболко", "круша",
            "лисица", "желка", "сонце", "птица",
            "морков", "пиперка", "играчка", "ракета"
    };

    private static final String[] SYLLABLES_10_15 = {
            "кукла", "зелка", "зајак", "топка",
            "желка", "лисица", "мечка", "тигар",
            "книга", "тетратка", "ранец", "молив",
            "јагода", "банана", "јаболко", "морков",
            "пиперка", "домати", "играчка", "ракета",
            "планина", "градина", "пеперутка",
            "виножито", "верверица", "авион"
    };

    public static String[] wordsForAge(AgeGroup ageGroup) {
        return switch (ageGroup) {
            case AGE_5_7 -> AGE_5_7_WORDS;
            case AGE_8_10 -> AGE_8_10_WORDS;
            case AGE_10_15 -> AGE_10_15_WORDS;
        };
    }

    public static String word(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {
        String[] words = wordsForAge(ageGroup);

        int index = Math.floorMod(
                (worldNumber - 1) * 10
                        + (pin - 1) * 3
                        + (task - 1),
                words.length
        );

        return words[index];
    }

    public static String syllablesWord(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {
        String[] words = switch (ageGroup) {
            case AGE_5_7 -> SYLLABLES_5_7;
            case AGE_8_10 -> SYLLABLES_8_10;
            case AGE_10_15 -> SYLLABLES_10_15;
        };

        int index = Math.floorMod(
                (worldNumber - 1) * 10
                        + (pin - 1) * 3
                        + (task - 1),
                words.length
        );

        return words[index];
    }

    public static String firstLetter(String word) {
        if (word == null || word.isEmpty()) {
            return "";
        }

        return String.valueOf(word.charAt(0))
                .toUpperCase(Locale.ROOT);
    }

    public static String lastLetter(String word) {
        if (word == null || word.isEmpty()) {
            return "";
        }

        return String.valueOf(
                word.charAt(word.length() - 1)
        ).toUpperCase(Locale.ROOT);
    }

    public static int countVowels(String word) {
        if (word == null) {
            return 0;
        }

        int count = 0;

        for (char c : word.toLowerCase(Locale.ROOT).toCharArray()) {
            if ("аеиоу".indexOf(c) >= 0) {
                count++;
            }
        }

        return count;
    }

    public static int countSounds(String word) {
        if (word == null) {
            return 0;
        }

        return word.replace(" ", "").length();
    }

    public static String worldTheme(int worldNumber) {
        return switch (worldNumber) {
            case 1 -> "Патеката на брзината";
            case 2 -> "Планината на авантурите";
            case 3 -> "Селото на зборовите";
            case 4 -> "Галаксијата на буквите";
            case 5 -> "Кралството на приказните";
            case 6 -> "Стазата на шампионите";
            default -> "LexiLand";
        };
    }

    public static String quote(String value) {
        if (value == null) {
            return "\"\"";
        }

        return "\""
                + value.replace("\\", "\\\\")
                       .replace("\"", "\\\"")
                       .replace("\n", "\\n")
                       .replace("\r", "\\r")
                + "\"";
    }

    public static String array(String[] values) {
        StringBuilder result = new StringBuilder("[");

        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                result.append(",");
            }

            result.append(quote(values[i]));
        }

        result.append("]");
        return result.toString();
    }
}
