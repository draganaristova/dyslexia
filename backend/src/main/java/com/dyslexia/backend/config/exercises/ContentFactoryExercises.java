package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.GamesType;

public class ContentFactoryExercises {
    public static String create(
            GamesType type,
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        return switch (type) {

            case MEMORY -> MemoryExercises.create(
                            ageGroup,
                            worldNumber,
                            pin,
                            task
                    );

            case WORD_BUILDING -> WordBuildingExercises.create(
                            ageGroup,
                            worldNumber,
                            pin,
                            task
                    );

            case MISSING_LETTER -> MissingLetterExercises.create(
                            ageGroup,
                            worldNumber,
                            pin,
                            task
                    );

            case RHYMES -> RhymesExercises.create(
                            ageGroup,
                            worldNumber,
                            pin,
                            task
                    );

            case SYLLABLES -> SyllablesExercises.create(
                            ageGroup,
                            worldNumber,
                            pin,
                            task
                    );

            case SOUND_MANIPULATION -> SoundManipulationExercises.create(
                            ageGroup,
                            worldNumber,
                            pin,
                            task
                    );
        };
    }
}