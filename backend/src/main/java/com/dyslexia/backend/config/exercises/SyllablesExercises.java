
package com.dyslexia.backend.config.exercises;

import com.dyslexia.backend.model.AgeGroup;

public class SyllablesExercises {

    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        /*
         * Избираме збор од посебната листа
         * за вежбите со слогови.
         */

        String word = ExerciseContentUtils
                .syllablesWord(
                        ageGroup,
                        worldNumber,
                        pin,
                        task
                )
                .toLowerCase();

        /*
         * Го пресметуваме бројот на слогови
         * преку македонските самогласки.
         */

        int correct = ExerciseContentUtils
                .countVowels(word);

        /*
         * Дозволуваме само 1 до 4 слога.
         */

        if (correct < 1 || correct > 4) {

            throw new IllegalStateException(
                    "Недозволен број слогови за зборот: "
                            + word
                            + " ("
                            + correct
                            + ")"
            );
        }

        /*
         * Секогаш четири понудени одговори.
         */

        String[] options = {
                "1",
                "2",
                "3",
                "4"
        };

        /*
         * Прашање според возраста.
         * Зборот секогаш е видлив.
         */

        String question;

        if (ageGroup == AgeGroup.AGE_5_7) {

            question =
                    "Колку слогови има зборот „"
                            + word
                            + "“?";

        } else if (ageGroup == AgeGroup.AGE_8_10) {

            question =
                    "Прочитај го зборот „"
                            + word
                            + "“ и избери колку слогови има.";

        } else {

            question =
                    "Внимателно анализирај го зборот „"
                            + word
                            + "“ и одреди го бројот на слогови.";
        }

        /*
         * Го генерираме JSON за frontend.
         */

        return ExerciseContentUtils.basic(
                question,
                options,
                String.valueOf(correct)
        );
    }
}
