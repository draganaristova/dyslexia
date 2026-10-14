package com.dyslexia.backend.config.exercises;

import com.dyslexia.backend.model.AgeGroup;

import java.util.ArrayList;
import java.util.List;

public class SoundManipulationExercises {

    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        String word =
                ExerciseContentUtils
                        .word(
                                ageGroup,
                                worldNumber,
                                pin,
                                task
                        )
                        .toUpperCase();

        if (word.length() < 2) {
            word = "МАМА";
        }

        String question;
        String answer;

        /*
         * ==========================================
         * 5–7
         * ==========================================
         *
         * First sound -> last sound -> remove first.
         */

        if (ageGroup == AgeGroup.AGE_5_7) {

            if (pin <= 2) {

                question =
                        "Кој е првиот глас во „"
                                + word
                                + "“?";

                answer =
                        ExerciseContentUtils.firstLetter(
                                word
                        );

            } else if (pin <= 4) {

                question =
                        "Кој е последниот глас во „"
                                + word
                                + "“?";

                answer =
                        ExerciseContentUtils.lastLetter(
                                word
                        );

            } else {

                question =
                        "Кажи го зборот без првиот глас: „"
                                + word
                                + "“.";

                answer =
                        word.substring(1);
            }
        }

        /*
         * ==========================================
         * 8–10
         * ==========================================
         *
         * More active manipulation.
         */

        else if (ageGroup == AgeGroup.AGE_8_10) {

            if (pin <= 2) {

                question =
                        "Кој е првиот глас во „"
                                + word
                                + "“?";

                answer =
                        ExerciseContentUtils.firstLetter(
                                word
                        );

            } else if (pin <= 3) {

                question =
                        "Кој е последниот глас во „"
                                + word
                                + "“?";

                answer =
                        ExerciseContentUtils.lastLetter(
                                word
                        );

            } else if (pin <= 4) {

                question =
                        "Кажи го зборот без последниот глас: „"
                                + word
                                + "“.";

                answer =
                        word.substring(
                                0,
                                word.length() - 1
                        );

            } else {

                String first =
                        ExerciseContentUtils.firstLetter(
                                word
                        );

                String replacement =
                        replacementFor(
                                first,
                                task
                        );

                question =
                        "Замени го првиот глас /"
                                + first
                                + "/ со /"
                                + replacement
                                + "/.";

                answer =
                        replacement
                                + word.substring(1);
            }
        }

        /*
         * ==========================================
         * 10–15
         * ==========================================
         *
         * Complex manipulation.
         */

        else {

            if (pin <= 2) {

                question =
                        "Колку гласови има во „"
                                + word
                                + "“?";

                answer =
                        String.valueOf(
                                ExerciseContentUtils.countSounds(
                                        word
                                )
                        );

            } else if (pin <= 3) {

                question =
                        "Кажи го зборот без првиот глас: „"
                                + word
                                + "“.";

                answer =
                        word.substring(1);

            } else if (pin <= 4) {

                question =
                        "Кажи го зборот без последниот глас: „"
                                + word
                                + "“.";

                answer =
                        word.substring(
                                0,
                                word.length() - 1
                        );

            } else if (pin == 5) {

                String first =
                        ExerciseContentUtils.firstLetter(
                                word
                        );

                String replacement =
                        replacementFor(
                                first,
                                task
                        );

                question =
                        "Замени го првиот глас /"
                                + first
                                + "/ со /"
                                + replacement
                                + "/.";

                answer =
                        replacement
                                + word.substring(1);

            } else {

                String last =
                        ExerciseContentUtils.lastLetter(
                                word
                        );

                String replacement =
                        replacementFor(
                                last,
                                task + 3
                        );

                question =
                        "Замени го последниот глас /"
                                + last
                                + "/ со /"
                                + replacement
                                + "/.";

                answer =
                        word.substring(
                                0,
                                word.length() - 1
                        )
                                + replacement;
            }
        }

        String[] options =
                createOptions(
                        answer,
                        task
                );

        return ExerciseContentUtils.basic(
                question,
                options,
                answer
        );
    }

    private static String replacementFor(
            String original,
            int task
    ) {

        String[] letters = {
                "А",
                "Е",
                "И",
                "О",
                "У",
                "М",
                "Р",
                "Л",
                "С",
                "Т",
                "Н"
        };

        int start =
                Math.abs(task)
                        % letters.length;

        for (int i = 0; i < letters.length; i++) {

            String candidate =
                    letters[
                            (start + i)
                                    % letters.length
                    ];

            if (!candidate.equalsIgnoreCase(
                    original
            )) {

                return candidate;
            }
        }

        return "М";
    }

    private static String[] createOptions(
            String correct,
            int task
    ) {

        List<String> result =
                new ArrayList<>();

        result.add(correct);

        /*
         * NUMBER
         */

        if (correct.matches("\\d+")) {

            int number =
                    Integer.parseInt(
                            correct
                    );

            addUnique(
                    result,
                    String.valueOf(
                            Math.max(
                                    1,
                                    number - 1
                            )
                    )
            );

            addUnique(
                    result,
                    String.valueOf(
                            number + 1
                    )
            );

            addUnique(
                    result,
                    String.valueOf(
                            number + 2
                    )
            );
        }

        /*
         * SINGLE LETTER
         */

        else if (
                correct.length() == 1
                        &&
                Character.isLetter(
                        correct.charAt(0)
                )
        ) {

            String[] letters = {
                    "А",
                    "Е",
                    "И",
                    "М",
                    "О",
                    "Р",
                    "Т",
                    "С",
                    "Н",
                    "Л"
            };

            int start =
                    Math.abs(task)
                            % letters.length;

            for (int i = 0;
                 i < letters.length
                         && result.size() < 4;
                 i++) {

                addUnique(
                        result,
                        letters[
                                (
                                        start + i
                                )
                                        % letters.length
                        ]
                );
            }
        }

        /*
         * WORD
         */

        else {

            addUnique(
                    result,
                    correct + "А"
            );

            addUnique(
                    result,
                    correct + "Е"
            );

            addUnique(
                    result,
                    correct + "О"
            );
        }

        return result.toArray(
                new String[0]
        );
    }

    private static void addUnique(
            List<String> list,
            String value
    ) {

        if (
                value != null
                        &&
                !list.contains(value)
        ) {

            list.add(value);
        }
    }
}