package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class RhymesExercises {
    private record RhymePair(
            String word,
            String rhyme,
            String group
    ) {}

    private static final RhymePair[] AGE_5_7 = {
            new RhymePair("мост", "гост", "ост"),
            new RhymePair("мир", "вир", "ир"),
            new RhymePair("слава", "глава", "ава"),
            new RhymePair("мече", "рече", "ече"),
            new RhymePair("маче", "плаче", "аче"),
            new RhymePair("зелка", "елка", "елка"),
            new RhymePair("коса", "боса", "оса"),
            new RhymePair("слива", "плива", "ива"),
            new RhymePair("зима", "рима", "има"),
            new RhymePair("вода", "мода", "ода"),
            new RhymePair("мама", "дама", "ама"),
            new RhymePair("река", "мека", "ека"),
            new RhymePair("куче", "уче", "уче"),
            new RhymePair("круша", "слуша", "уша"),
            new RhymePair("птица", "жица", "ица"),
            new RhymePair("ноќ", "моќ", "оќ")
    };

    private static final RhymePair[] AGE_8_10 = {
            new RhymePair("птица", "жица", "ица"),
            new RhymePair("мост", "гост", "ост"),
            new RhymePair("мир", "вир", "ир"),
            new RhymePair("слава", "глава", "ава"),
            new RhymePair("куче", "уче", "уче"),
            new RhymePair("круша", "слуша", "уша"),
            new RhymePair("мече", "рече", "ече"),
            new RhymePair("маче", "плаче", "аче"),
            new RhymePair("зелка", "елка", "елка"),
            new RhymePair("коса", "боса", "оса"),
            new RhymePair("слива", "плива", "ива"),
            new RhymePair("зима", "рима", "има"),
            new RhymePair("вода", "мода", "ода"),
            new RhymePair("река", "мека", "ека"),
            new RhymePair("мама", "дама", "ама"),
            new RhymePair("ноќ", "моќ", "оќ"),
            new RhymePair("цвет", "свет", "ет"),
            new RhymePair("лета", "цвета", "ета"),
            new RhymePair("пее", "сее", "ее"),
            new RhymePair("снег", "брег", "ег")
    };

    private static final RhymePair[] AGE_10_15 = {
            new RhymePair("птица", "жица", "ица"),
            new RhymePair("спиење", "пиење", "иење"),
            new RhymePair("младост", "радост", "адост"),
            new RhymePair("мост", "гост", "ост"),
            new RhymePair("мир", "вир", "ир"),
            new RhymePair("слава", "глава", "ава"),
            new RhymePair("куче", "уче", "уче"),
            new RhymePair("круша", "слуша", "уша"),
            new RhymePair("мече", "рече", "ече"),
            new RhymePair("маче", "плаче", "аче"),
            new RhymePair("зелка", "елка", "елка"),
            new RhymePair("коса", "боса", "оса"),
            new RhymePair("слива", "плива", "ива"),
            new RhymePair("зима", "рима", "има"),
            new RhymePair("вода", "мода", "ода"),
            new RhymePair("река", "мека", "ека"),
            new RhymePair("мама", "дама", "ама"),
            new RhymePair("ноќ", "моќ", "оќ"),
            new RhymePair("цвет", "свет", "ет"),
            new RhymePair("лета", "цвета", "ета"),
            new RhymePair("пее", "сее", "ее"),
            new RhymePair("снег", "брег", "ег"),
            new RhymePair("слон", "сон", "он"),
            new RhymePair("гора", "зора", "ора")
    };

    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        RhymePair[] bank = switch (ageGroup) {
            case AGE_5_7 -> AGE_5_7;
            case AGE_8_10 -> AGE_8_10;
            case AGE_10_15 -> AGE_10_15;
        };

        int index = Math.floorMod((worldNumber - 1) * 10 + (pin - 1) * 3 + (task - 1),  bank.length);
        RhymePair pair = bank[index];
        List<String> options = new ArrayList<>();
        options.add(pair.rhyme());

        for (
                int offset = 1;
                offset < bank.length && options.size() < 4;
                offset++
        ) {

            RhymePair candidate = bank[(index + offset) % bank.length];
            String distractor = candidate.rhyme();

            if (options.contains(distractor)) {
                continue;
            }

            if (candidate.group().equals(pair.group())) {
                continue;
            }

            if (rhymesWith(pair.word(), distractor)) {
                continue;
            }

            options.add(distractor);
        }

        if (options.size() != 4) {
            throw new IllegalStateException("Нема доволно понудени одговори за: " + pair.word());
        }

        Collections.rotate(options, Math.floorMod(worldNumber + pin + task, options.size()));

        String question = "Кој збор се римува со „" + pair.word() + "“?";

        return ExerciseContentUtils.basic(
                question,
                options.toArray(new String[0]),
                pair.rhyme()
        );
    }

    private static boolean rhymesWith(
            String first,
            String second
    ) {

        if (first == null || second == null) {
            return false;
        }

        first = first.toLowerCase();
        second = second.toLowerCase();

        int minLength = Math.min(first.length(), second.length());

        if (minLength < 2) {
            return false;
        }

        int suffixLength = Math.min(3, minLength);
        return first.substring(first.length() - suffixLength).equals(second.substring(second.length() - suffixLength));
    }
}
