package com.dyslexia.backend.config.exercises;
import com.dyslexia.backend.model.AgeGroup;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class WordBuildingExercises {
    private record WordItem(
            String word,
            String emoji,
            String description
    ) {}

    public static String create(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        WordItem item = wordForAge(
                ageGroup,
                worldNumber,
                pin,
                task
        );

        String word = item.word().toUpperCase();
        List<String> letters = new ArrayList<>(List.of(word.split("")));
        Collections.rotate(letters, (worldNumber + pin + task) % letters.size());

        if (letters.size() > 1 && String.join("", letters).equals(word)) {
                Collections.reverse(letters);
        }
        if (letters.size() > 1 && String.join("", letters).equals(word)) {
            Collections.swap(letters, 0, 1);
        }

        String question;

        if (ageGroup == AgeGroup.AGE_5_7) {
            question = "Состави го зборот од буквите.";
        } else if (ageGroup == AgeGroup.AGE_8_10) {
            question = "Подреди ги буквите и состави го зборот.";
        } else {
            question = "Состави го зборот и прочитај го.";
        }

        return ExerciseContentUtils.wordBuilding(
                question,
                item.description(),
                item.emoji(),
                letters.toArray(new String[0]),
                word
        );
    }

    private static WordItem wordForAge(
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        WordItem[] bank = switch (ageGroup) {
            case AGE_5_7 -> AGE_5_7;
            case AGE_8_10 -> AGE_8_10;
            case AGE_10_15 -> AGE_10_15;
        };

        int index = Math.floorMod((worldNumber - 1) * 10 + (pin - 1) * 10 + (task - 1), bank.length);
        return bank[index];
    }

    private static final WordItem[] AGE_5_7 = {
            new WordItem("МАЧКА", "🐱","Животно што мјаука и често живее со луѓето."),
            new WordItem("КУЧЕ", "🐶","Животно што лае и често е домашен миленик."),
            new WordItem("СОНЦЕ", "☀️","Свети на небото и ни дава светлина и топлина."),
            new WordItem("МЕЧЕ", "🐻","Мало животно што личи на мечка."),
            new WordItem("ТАТО", "👨","Така често го викаме нашиот татко."),
            new WordItem("МАМА", "👩","Личноста која се грижи за своето дете и го сака."),
            new WordItem("ДОМ", "🏠","Местото каде што живееме со нашето семејство."),
            new WordItem("МОРЕ", "🌊","Голема површина со солена вода."),
            new WordItem("РИБА", "🐟","Животно што живее во вода и плива."),
            new WordItem("ТОПКА", "⚽","Тркалезен предмет со кој можеме да играме."),
            new WordItem("ЦВЕТ", "🌸","Растение со убави ливчиња и пријатен мирис."),
            new WordItem("ЛИСА", "🦊","Диво животно со бушава опашка."),
            new WordItem("КОЊ", "🐴","Големо животно со четири нозе на кое можеме да јаваме."),
            new WordItem("ПТИЦА", "🐦","Животно со пердуви и крилја што може да лета."),
            new WordItem("СНЕГ", "❄️","Бели снегулки што паѓаат од небото во зима."),
            new WordItem("ВОДА", "💧","Течност што ни е потребна за живот."),
            new WordItem("КРУША", "🍐","Слатко овошје со зелена или жолта боја."),
            new WordItem("ЈАБОЛКО", "🍎","Овошје кое може да биде црвено, зелено или жолто."),
            new WordItem("БАЛОН", "🎈","Шарен предмет исполнет со воздух."),
            new WordItem("КУЌА", "🏡","Место со ѕидови и покрив каде што живеат луѓето.")
    };

    private static final WordItem[] AGE_8_10 = {
            new WordItem("КУКЛА", "🪆","Играчка со која децата си играат."),
            new WordItem("ЗАЈАК", "🐰","Животно со долги уши."),
            new WordItem("ЖЕЛКА", "🐢","Животно што носи оклоп."),
            new WordItem("ТОПКА", "⚽","Тркалезна играчка за игра."),
            new WordItem("МАЧКА", "🐱","Животно што мјаука."),
            new WordItem("КУЧЕ", "🐶","Животно што лае."),
            new WordItem("МЕЧЕ", "🐻","Мала мечка."),
            new WordItem("КНИГА", "📖","Има страници што ги читаме."),
            new WordItem("МОЛИВ", "✏️","Со него пишуваме и цртаме."),
            new WordItem("РИБА", "🐟","Живее во вода и плива."),
            new WordItem("ПИЛЕ", "🐥","Мало од кокошка."),
            new WordItem("ЖАБА", "🐸","Зелено животно што скока."),
            new WordItem("ЈАГОДА", "🍓","Мало црвено овошје."),
            new WordItem("БАНАНА", "🍌","Долго жолто овошје."),
            new WordItem("КРУША", "🍐","Слатко овошје."),
            new WordItem("СОНЦЕ", "☀️","Свети и грее на небото."),
            new WordItem("ЅВЕЗДА", "⭐","Свети на ноќното небо."),
            new WordItem("ЦВЕТ", "🌸","Расте во градина."),
            new WordItem("РЕКА", "🏞️","Вода што тече низ природата."),
            new WordItem("РАКЕТА", "🚀","Лета високо во вселената.")
    };

    private static final WordItem[] AGE_10_15 = {
            new WordItem("ЛИСИЦА", "🦊","Шумско животно со бушава опашка."),
            new WordItem("ЗАЈАК", "🐰","Животно со долги уши."),
            new WordItem("ЖЕЛКА", "🐢","Животно со тврд оклоп."),
            new WordItem("КУКЛА", "🪆","Играчка што личи на човек."),
            new WordItem("ТОПКА", "⚽","Со неа играме фудбал."),
            new WordItem("КНИГА", "📖","Во неа читаме приказни."),
            new WordItem("РАНЕЦ", "🎒","Во него носиме книги."),
            new WordItem("МОЛИВ", "✏️","Со него пишуваме."),
            new WordItem("ЈАГОДА", "🍓","Црвено слатко овошје."),
            new WordItem("БАНАНА", "🍌","Жолто овошје со кора."),
            new WordItem("ЈАБОЛКО", "🍎","Овошје што расте на дрво."),
            new WordItem("МОРКОВ", "🥕","Портокалов зеленчук."),
            new WordItem("ПИПЕРКА", "🫑","Зеленчук што може да биде црвен или зелен."),
            new WordItem("ПЛАНИНА", "⛰️","Високо место во природата."),
            new WordItem("РЕКА", "🏞️","Вода што тече."),
            new WordItem("МОРЕ", "🌊","Голема површина со солена вода."),
            new WordItem("АВИОН", "✈️","Превозно средство што лета."),
            new WordItem("РАКЕТА", "🚀","Лета во вселената."),
            new WordItem("ПТИЦА", "🐦","Има крилја и пердуви."),
            new WordItem("ЦВЕТ", "🌸","Расте во градина.")
    };
}
