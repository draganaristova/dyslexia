import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import kids from "../assets/screens/kids.jpg";
import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home">
            <header className="home-header">
                <Logo />
                <div className="nav-icons-row">
                    <HomeButton />
                    <LogoutButton />
                    <ProfileButton />
                 </div>
            </header>

            <section className="center">
                <div className="left-side">
                    <h1>Добредојдовте во <span>ЛексиЛенд!</span></h1>
                    <p>
                       ЛексиЛенд е платформа каде децата се надградуваат преку интерактивни игри и забавни активности. Со секоја вежба го градат своето читање, вокабулар и самодоверба - на начин прилагоден токму за нив.
                    </p>

                    <div className="buttons">
                        <button className="login" onClick={() => navigate("/login")}>
                            Најави се
                        </button>
                        <button className="register" onClick={() => navigate("/register")}>
                            Регистрирај се
                        </button>
                        <button className="game" onClick={() => navigate("/gameselection")}>Игри</button>
                    </div>
                </div>

                <div className="right-side">
                    <div className="kids-frame">
                        <img src={kids} className="kids" alt="Деца читаат книга" />
                    </div>
                </div>
            </section>

            <section className="cards">
                <div className="card card-yellow">
                    <span className="card-icon">🎲</span>
                    <h3>Игри</h3>
                    <p>Спарувај зборови со слики, состави ги буквите и препознај го точниот збор - секоја игра е нов предизвик!</p>
                </div>

                <div className="card card-green">
                    <span className="card-icon">🧠</span>
                    <h3>Учење</h3>
                    <p>Интерактивни вежби креирани за корисно учење преку овозможено слушање и читање.</p>
                </div>

                <div className="card card-blue">
                    <span className="card-icon">📈</span>
                    <h3>Следење напредок</h3>
                    <p>Следење на резултатите и напредокот на детето постигнати преку игра.</p>
                </div>

                <div className="card card-purple">
                    <span className="card-icon">🌿</span>
                    <h3>Релаксирање</h3>
                    <p>Кратки вежби за дишење и истегнување - момент за пауза и смирување помеѓу игрите.</p>
                </div>
            </section>
            <footer>
                 <div className="quote">
                        <p>Учењето со забава е најдобриот начин да се учат нешта!</p>
                    </div>
            </footer>
        </div>
    );
}
export default Home;