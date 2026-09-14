import game1 from "../assets/games/game1.png";
import game2 from "../assets/games/game2.png";
import game3 from "../assets/games/game3.png";
import game4 from "../assets/games/game4.png";
import game5 from "../assets/games/game5.png";
import game6 from "../assets/games/game6.png";

export const exerciseTypes = [
    { type: "LETTER_MATCH", icon: "🔤" },
    { type: "PICTURE_WORD", icon: "🖼️" },
    { type: "WORD_BUILDER", icon: "🧩" },
    { type: "MEMORY", icon: "🃏" },
    { type: "LISTEN_CHOOSE", icon: "🔊" },
    { type: "SENTENCE_READ", icon: "📖" },
    { type: "BOSS_MIX", icon: "🏆" },
];

export const worldsData = {
    1: {
        name: "Патека на брзината",
        img: game1,
        color: "coral",
        pinsDone: 3,
        status: "unlocked",
        typeOrder: [0, 4, 2, 6, 1, 3, 5],
        positions: [
            { top: "84%", left: "48%" },
            { top: "62%", left: "16%" },
            { top: "26%", left: "12%" },
            { top: "10%", left: "42%" },
            { top: "8%", left: "68%" },
            { top: "34%", left: "88%" },
            { top: "62%", left: "80%" },
        ],
    },
    2: {
        name: "Планина на авантурите",
        img: game2,
        color: "green",
        status: "locked",
        pinsDone: 0,
        typeOrder: [3, 0, 5, 2, 6, 1, 4],
        positions: [
            { top: "62%", left: "9%" },
            { top: "58%", left: "36%" },
            { top: "38%", left: "47%" },
            { top: "46%", left: "58%" },
            { top: "16%", left: "83%" },
            { top: "78%", left: "80%" },
            { top: "10%", left: "18%" },
        ],
    },
    3: {
        name: "Селото на зборовите",
        img: game3,
        color: "blue",
        pinsDone: 0,
        status: "locked",
        typeOrder: [2, 5, 0, 4, 6, 3, 1],
        positions: [
            { top: "18%", left: "16%" },
            { top: "52%", left: "10%" },
            { top: "70%", left: "38%" },
            { top: "42%", left: "70%" },
            { top: "26%", left: "80%" },
            { top: "55%", left: "56%" },
            { top: "80%", left: "26%" },
        ],
    },
    4: {
        name: "Галаксија на буквите",
        img: game4,
        color: "purple",
        pinsDone: 0,
        status: "locked",
        typeOrder: [6, 1, 4, 0, 3, 5, 2],
        positions: [
            { top: "10%", left: "13%" },
            { top: "30%", left: "17%" },
            { top: "80%", left: "10%" },
            { top: "48%", left: "46%" },
            { top: "63%", left: "34%" },
            { top: "58%", left: "80%" },
            { top: "18%", left: "88%" },
        ],
    },
    5: {
        name: "Кралство на приказните",
        img: game5,
        color: "pink",
        pinsDone: 0,
        status: "locked",
        typeOrder: [5, 3, 6, 0, 2, 4, 1],
        positions: [
            { top: "16%", left: "48%" },
            { top: "63%", left: "15%" },
            { top: "84%", left: "12%" },
            { top: "58%", left: "45%" },
            { top: "44%", left: "78%" },
            { top: "74%", left: "70%" },
            { top: "9%", left: "88%" },
        ],
    },
    6: {
        name: "Стаза на шампионите",
        img: game6,
        color: "gold",
        pinsDone: 0,
        status: "locked",
        typeOrder: [1, 6, 3, 5, 0, 2, 4],
        positions: [
            { top: "16%", left: "16%" },
            { top: "15%", left: "80%" },
            { top: "45%", left: "48%" },
            { top: "80%", left: "78%" },
            { top: "55%", left: "12%" },
            { top: "82%", left: "36%" },
            { top: "50%", left: "86%" },
        ],
    },
};