package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MemoryExercises {

    private record MemoryItem(String word, String image) {}
    public static String create(AgeGroup ageGroup, int worldNumber, int pin, int task) {
        MemoryItem[] bank = bankForAge(ageGroup);
        int numberOfPairs = pin <= 1 ? 4 : pin == 2 ? 5 : 6;
        List<String[]> cards = new ArrayList<>();

        int start = Math.floorMod((worldNumber - 1) * 10 + (pin - 1) * 3 + (task - 1), bank.length);
        int cardId = 1;

        for (int i = 0; i < numberOfPairs; i++) {
            MemoryItem item = bank[(start + i) % bank.length];
            String pairId = "pair-" + (i + 1);

            if (ageGroup == AgeGroup.AGE_5_7) {
                cards.add(new String[]{String.valueOf(cardId++), pairId, item.image(), ""});
                cards.add(new String[]{String.valueOf(cardId++), pairId, item.image(), ""});
            } else if (ageGroup == AgeGroup.AGE_8_10) {
                cards.add(new String[]{String.valueOf(cardId++), pairId, item.image(), ""});
                cards.add(new String[]{String.valueOf(cardId++), pairId, "", item.word()});
            } else {
                cards.add(new String[]{String.valueOf(cardId++), pairId, "", item.word()});
                cards.add(new String[]{String.valueOf(cardId++), pairId, "", item.word()});
            }
        }

        Collections.rotate(cards, (worldNumber + pin + task) % cards.size());

        return ExerciseContentUtils.memory(
                getQuestion(ageGroup, pin),
                "Пронајди ги сите парови.",
                cards.toArray(new String[0][])
        );
    }

    private static String getQuestion(AgeGroup ageGroup, int pin) {
        if (ageGroup == AgeGroup.AGE_5_7) {
            if (pin == 1) return "Најди ги истите слики.";
            if (pin == 2) return "Запомни ги сликите и најди ги паровите.";
            return "Пронајди ги сите парови на слики.";
        }

        if (ageGroup == AgeGroup.AGE_8_10) {
            if (pin == 1) return "Спои ја сликата со точниот збор.";
            if (pin == 2) return "Запомни ги сликите и зборовите.";
            return "Најди ги паровите слика и збор.";
        }

        if (pin == 1) return "Спои ги истите зборови.";
        if (pin == 2) return "Запомни ги зборовите и најди ги паровите.";
        return "Пронајди ги сите парови на зборови.";
    }

    private static MemoryItem[] bankForAge(AgeGroup ageGroup) {
        return switch (ageGroup) {
            case AGE_5_7 -> AGE_5_7;
            case AGE_8_10 -> AGE_8_10;
            case AGE_10_15 -> AGE_10_15;
        };
    }

    private static final MemoryItem[] AGE_5_7 = {
            new MemoryItem("мачка", "cat"),
            new MemoryItem("куче", "dog"),
            new MemoryItem("сонце", "sun"),
            new MemoryItem("јаболко", "apple"),
            new MemoryItem("топка", "ball"),
            new MemoryItem("цвет", "flower"),
            new MemoryItem("куќа", "house"),
            new MemoryItem("дрво", "tree"),
            new MemoryItem("риба", "fish"),
            new MemoryItem("автомобил", "car"),
            new MemoryItem("месечина", "moon"),
            new MemoryItem("ѕвезда", "star"),
            new MemoryItem("зајак", "rabbit"),
            new MemoryItem("птица", "bird"),
            new MemoryItem("круша", "pear")
    };

    private static final MemoryItem[] AGE_8_10 = {
            new MemoryItem("мачка", "cat"),
            new MemoryItem("куче", "dog"),
            new MemoryItem("сонце", "sun"),
            new MemoryItem("јаболко", "apple"),
            new MemoryItem("топка", "ball"),
            new MemoryItem("цвет", "flower"),
            new MemoryItem("куќа", "house"),
            new MemoryItem("дрво", "tree"),
            new MemoryItem("риба", "fish"),
            new MemoryItem("месечина", "moon"),
            new MemoryItem("ѕвезда", "star"),
            new MemoryItem("зајак", "rabbit"),
            new MemoryItem("птица", "bird"),
            new MemoryItem("круша", "pear"),
            new MemoryItem("река", "river")
    };

    private static final MemoryItem[] AGE_10_15 = {
            new MemoryItem("мачка", "cat"),
            new MemoryItem("куче", "dog"),
            new MemoryItem("сонце", "sun"),
            new MemoryItem("јаболко", "apple"),
            new MemoryItem("топка", "ball"),
            new MemoryItem("цвет", "flower"),
            new MemoryItem("куќа", "house"),
            new MemoryItem("дрво", "tree"),
            new MemoryItem("риба", "fish"),
            new MemoryItem("месечина", "moon"),
            new MemoryItem("ѕвезда", "star"),
            new MemoryItem("зајак", "rabbit"),
            new MemoryItem("птица", "bird"),
            new MemoryItem("круша", "pear"),
            new MemoryItem("река", "river")
    };
}
