import game1 from "../assets/games/game1.png";
import game2 from "../assets/games/game2.png";
import game3 from "../assets/games/game3.png";
import game4 from "../assets/games/game4.png";
import game5 from "../assets/games/game5.png";
import game6 from "../assets/games/game6.png";

export const exerciseTypes = [
    {
        type: "MEMORY",
        icon: "🃏",
        name: "Меморија",
    },
    {
        type: "WORD_BUILDING",
        icon: "🧩",
        name: "Состави го зборот",
    },
    {
        type: "MISSING_LETTER",
        icon: "🔤",
        name: "Која буква недостасува",
    },
    {
        type: "RHYMES",
        icon: "🎵",
        name: "Најди ја римата",
    },
    {
        type: "SYLLABLES",
        icon: "👏",
        name: "Слогови",
    },
    {
        type: "SOUND_MANIPULATION",
        icon: "✂️",
        name: "Бриши и замени гласови",
    },
];

export const worldsData = {
    1: {
        name: "Патека на брзината",
        img: game1,
        color: "coral",

        // На почеток нема завршени мисии.
        pinsDone: 0,

        status: "unlocked",

        // 6 игри од backend
        typeOrder: [
            0, // RECOGNIZE_SOUND
            1, // MEMORY
            2, // RHYMES
            3, // MISSING_LETTER
            4, // WORD_BUILDING
            5, // WHAT_CHANGED
        ],

        positions: [
            { top: "84%", left: "48%" },
            { top: "62%", left: "16%" },
            { top: "26%", left: "12%" },
            { top: "10%", left: "42%" },
            { top: "8%", left: "68%" },
            { top: "34%", left: "88%" },
        ],
    },

    2: {
        name: "Планина на авантурите",
        img: game2,
        color: "green",

        pinsDone: 0,
        status: "locked",

        typeOrder: [
            0,
            1,
            2,
            3,
            4,
            5,
        ],

        positions: [
            { top: "62%", left: "9%" },
            { top: "58%", left: "36%" },
            { top: "38%", left: "47%" },
            { top: "46%", left: "58%" },
            { top: "16%", left: "83%" },
            { top: "78%", left: "80%" },
        ],
    },

    3: {
        name: "Селото на зборовите",
        img: game3,
        color: "blue",

        pinsDone: 0,
        status: "locked",

        typeOrder: [
            0,
            1,
            2,
            3,
            4,
            5,
        ],

        positions: [
            { top: "18%", left: "16%" },
            { top: "52%", left: "10%" },
            { top: "70%", left: "38%" },
            { top: "42%", left: "70%" },
            { top: "26%", left: "80%" },
            { top: "55%", left: "56%" },
        ],
    },

    4: {
        name: "Галаксија на буквите",
        img: game4,
        color: "purple",

        pinsDone: 0,
        status: "locked",

        typeOrder: [
            0,
            1,
            2,
            3,
            4,
            5,
        ],

        positions: [
            { top: "10%", left: "13%" },
            { top: "30%", left: "17%" },
            { top: "80%", left: "10%" },
            { top: "48%", left: "46%" },
            { top: "63%", left: "34%" },
            { top: "58%", left: "80%" },
        ],
    },

    5: {
        name: "Кралство на приказните",
        img: game5,
        color: "pink",

        pinsDone: 0,
        status: "locked",

        typeOrder: [
            0,
            1,
            2,
            3,
            4,
            5,
        ],

        positions: [
            { top: "16%", left: "48%" },
            { top: "63%", left: "15%" },
            { top: "84%", left: "12%" },
            { top: "58%", left: "45%" },
            { top: "44%", left: "78%" },
            { top: "74%", left: "70%" },
        ],
    },

    6: {
        name: "Стаза на шампионите",
        img: game6,
        color: "gold",

        pinsDone: 0,
        status: "locked",

        typeOrder: [
            0,
            1,
            2,
            3,
            4,
            5,
        ],

        positions: [
            { top: "16%", left: "16%" },
            { top: "15%", left: "80%" },
            { top: "45%", left: "48%" },
            { top: "80%", left: "78%" },
            { top: "55%", left: "12%" },
            { top: "82%", left: "36%" },
        ],
    },
};