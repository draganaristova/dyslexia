package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

public class SyllablesExercises {

    private static final String VOWELS = "аеиоу";
    private static final Map<String, String> SYLLABLES = createDictionary();
    private static Map<String, String> createDictionary() {
        Map<String, String> words = new LinkedHashMap<>();

        words.put("дом", "дом");
        words.put("сон", "сон");
        words.put("мак", "мак");
        words.put("рак", "рак");
        words.put("мама", "ма-ма");
        words.put("тато", "та-то");
        words.put("вода", "во-да");
        words.put("маса", "ма-са");
        words.put("куче", "ку-че");
        words.put("мачка", "мач-ка");
        words.put("риба", "ри-ба");
        words.put("книга", "кни-га");
        words.put("сонце", "сон-це");
        words.put("топка", "топ-ка");
        words.put("молив", "мо-лив");
        words.put("море", "мо-ре");
        words.put("банана", "ба-на-на");
        words.put("јаболко", "ја-бол-ко");
        words.put("планина", "пла-ни-на");
        words.put("месечина", "ме-се-чи-на");
        words.put("училиште", "у-чи-лиш-те");
        words.put("пеперутка", "пе-пе-рут-ка");
        words.put("кукла", "ку-кла");
        words.put("зелка", "зел-ка");
        words.put("зајак", "за-јак");
        words.put("мече", "ме-че");
        words.put("жаба", "жа-ба");
        words.put("пиле", "пи-ле");
        words.put("јагода", "ја-го-да");
        words.put("круша", "кру-ша");
        words.put("лисица", "ли-си-ца");
        words.put("желка", "жел-ка");
        words.put("птица", "пти-ца");
        words.put("морков", "мор-ков");
        words.put("пиперка", "пи-пер-ка");
        words.put("играчка", "и-грач-ка");
        words.put("ракета", "ра-ке-та");
        words.put("мечка", "меч-ка");
        words.put("тигар", "ти-гар");
        words.put("тетратка", "тет-рат-ка");
        words.put("ранец", "ра-нец");
        words.put("домати", "до-ма-ти");
        words.put("градина", "гра-ди-на");
        words.put("виножито", "ви-но-жи-то");
        words.put("верверица", "вер-ве-ри-ца");
        words.put("авион", "а-ви-он");

        validateDictionary(words);
        return Collections.unmodifiableMap(words);
    }

    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {
        String word = ExerciseContentUtils
                .syllablesWord(ageGroup, worldNumber, pin, task)
                .toLowerCase(Locale.ROOT);

        String correct = SYLLABLES.get(word);

        if (correct == null) {
            throw new IllegalStateException(
                    "Недостасува поделба на слогови за зборот: " + word
            );
        }

        String[] options = createOptions(correct, worldNumber, pin, task);
        String question = questionFor(ageGroup, word);

        return ExerciseContentUtils.basic(question, options, correct);
    }

    private static String questionFor(AgeGroup ageGroup, String word) {
        return switch (ageGroup) {
            case AGE_5_7 -> "Како правилно се дели зборот „" + word + "“ на слогови?";
            case AGE_8_10 -> "Избери ја правилната поделба на слогови за зборот „" + word + "“.";
            case AGE_10_15 -> "Внимателно прочитај го зборот „" + word + "“ и избери ја правилната поделба на слогови.";
        };
    }

    private static String[] createOptions(
            String correct,
            int worldNumber,
            int pin,
            int task
    ) {
        String word = correct.replace("-", "");
        int expectedParts = correct.split("-").length;

        List<String> incorrect = new ArrayList<>();
        int combinations = 1 << (word.length() - 1);

        for (int mask = 1; mask < combinations; mask++) {
            String candidate = splitWithMask(word, mask);
            String[] parts = candidate.split("-");

            if (parts.length > 4 || candidate.equals(correct)) {
                continue;
            }

            if (!hasInvalidSyllable(parts)) {
                continue;
            }

            incorrect.add(candidate);
        }

        if (incorrect.size() < 3) {
            throw new IllegalStateException(
                    "Нема доволно различни одговори за зборот: " + word
            );
        }

        long seed = (long) worldNumber * 1000003L
                + (long) pin * 10007L
                + (long) task * 101L
                + word.hashCode();

        Random random = new Random(seed);

        Collections.shuffle(incorrect, random);

        incorrect.sort(
                Comparator.comparingInt(
                        option -> Math.abs(
                                option.split("-").length - expectedParts
                        )
                )
        );

        List<String> options = new ArrayList<>();
        options.add(correct);
        options.addAll(incorrect.subList(0, 3));

        Collections.shuffle(options, random);

        return options.toArray(new String[0]);
    }

    private static String splitWithMask(String word, int mask) {
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < word.length(); i++) {
            result.append(word.charAt(i));

            if (i < word.length() - 1 && (mask & (1 << i)) != 0) {
                result.append("-");
            }
        }

        return result.toString();
    }

    private static boolean hasInvalidSyllable(String[] parts) {
        for (String part : parts) {
            int vowels = 0;

            for (int i = 0; i < part.length(); i++) {
                if (VOWELS.indexOf(part.charAt(i)) >= 0) {
                    vowels++;
                }
            }

            if (vowels != 1) {
                return true;
            }
        }

        return false;
    }

    private static void validateDictionary(Map<String, String> words) {
        for (Map.Entry<String, String> entry : words.entrySet()) {
            String word = entry.getKey();
            String division = entry.getValue();

            if (!division.replace("-", "").equals(word)) {
                throw new IllegalStateException(
                        "Неправилна поделба за зборот: " + word
                );
            }

            String[] parts = division.split("-");

            if (parts.length < 1 || parts.length > 4) {
                throw new IllegalStateException(
                        "Недозволен број слогови за зборот: " + word
                );
            }

            if (hasInvalidSyllable(parts)) {
                throw new IllegalStateException(
                        "Неправилно формирани слогови за зборот: " + word
                );
            }
        }
    }
}
