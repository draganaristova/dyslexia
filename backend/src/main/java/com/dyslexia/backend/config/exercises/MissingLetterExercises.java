package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;
import java.util.ArrayList;
import java.util.List;

public class MissingLetterExercises {
    private static final String LETTER_POOL = "АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ";

    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        String word = ExerciseContentUtils.word(ageGroup, worldNumber, pin, task).toUpperCase();

        if (word.length() < 3) {
            word = "МАМА";
        }

        String pattern = word;
        String answer;

        if (ageGroup == AgeGroup.AGE_5_7) {

            int index;

            if (pin <= 2) {
                index = word.length() - 1;
            } else if (pin <= 4) {
                index = word.length() / 2;
            } else {
                index = 0;
            }

            answer = String.valueOf(word.charAt(index));
            StringBuilder builder = new StringBuilder(word);
            builder.setCharAt(index, '_');
            pattern = builder.toString();
        }

        else if (ageGroup == AgeGroup.AGE_8_10) {

            int index;

            if (pin <= 2) {
                index = word.length() - 1;
            } else if (pin <= 4) {
                index = word.length() / 2;
            } else {
                index = Math.max(0, word.length() / 3);
            }

            answer = String.valueOf(word.charAt(index));
            StringBuilder builder = new StringBuilder(word);
            builder.setCharAt(index, '_');
            pattern = builder.toString();
        }

        else {

            if (pin <= 2) {

                int index = word.length() - 1;
                answer = String.valueOf(word.charAt(index));
                StringBuilder builder = new StringBuilder(word);
                builder.setCharAt(index, '_');
                pattern = builder.toString();

            } else if (pin <= 4) {

                int first = word.length() / 2;
                answer = String.valueOf(word.charAt(first));
                StringBuilder builder = new StringBuilder(word);
                builder.setCharAt(first, '_');
                pattern = builder.toString();

            } else {

                int first = 0;
                int second = word.length() - 1;
                answer = String.valueOf(word.charAt(first)) + word.charAt(second);
                StringBuilder builder = new StringBuilder(word);
                builder.setCharAt(first, '_');
                builder.setCharAt(second, '_');
                pattern = builder.toString();
            }
        }

        String[] options = createOptions(
                        answer,
                        worldNumber,
                        pin,
                        task
                );

        String question = questionFor(
                        ageGroup,
                        pin
                );

        return ExerciseContentUtils.missingLetter(
                question,
                pattern,
                options,
                answer
        );
    }

    private static String questionFor(
            AgeGroup ageGroup,
            int pin
    ) {

        if (ageGroup == AgeGroup.AGE_5_7) {
            return "Која буква недостасува?";
        }

        if (ageGroup == AgeGroup.AGE_8_10) {
            return "Пронајди ја буквата што недостасува.";
        }

        if (pin >= 5) {
            return "Пронајди ги двете букви што недостасуваат.";
        }

        return "Внимателно прочитај го зборот и најди ја буквата.";
    }

    private static String[] createOptions(
            String correct,
            int worldNumber,
            int pin,
            int task
    ) {

        List<String> result = new ArrayList<>();

        for (char c : correct.toCharArray()) {
            String letter = String.valueOf(c);
            if (!result.contains(letter)) {
                result.add(letter);
            }
        }

        int start =(worldNumber + pin + task) % LETTER_POOL.length();

        for (int i = 0; i < LETTER_POOL.length() && result.size() < 4;i++) {
            String letter = String.valueOf( LETTER_POOL.charAt((start + i) % LETTER_POOL.length()));

            if (!result.contains(letter)) {
                result.add(letter);
            }
        }

        return result.toArray(new String[0]);
    }
}