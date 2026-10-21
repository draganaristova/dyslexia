package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;

public class SyllablesExercises {
    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        String word = ExerciseContentUtils.syllablesWord(
                        ageGroup,
                        worldNumber,
                        pin,
                        task
                ).toLowerCase();

        int correct = ExerciseContentUtils.countVowels(word);

        if (correct < 1 || correct > 4) {
            throw new IllegalStateException("Недозволен број слогови за зборот: " + word + " (" + correct + ")");
        }

        String[] options = {
                "1",
                "2",
                "3",
                "4"
        };

        String question;
        if (ageGroup == AgeGroup.AGE_5_7) {
            question = "Колку слогови има зборот „" + word + "“?";
        } else if (ageGroup == AgeGroup.AGE_8_10) {
            question = "Прочитај го зборот „" + word + "“ и избери колку слогови има.";
        } else {
            question = "Внимателно анализирај го зборот „" + word + "“ и одреди го бројот на слогови.";
        }

        return ExerciseContentUtils.basic(
                question,
                options,
                String.valueOf(correct)
        );
    }
}
