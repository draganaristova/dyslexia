import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/ForgotPassword.css";
import kidsImage from '../assets/screens/login_kids.png';
import Logo from "../widgets/Logo";
import HomeButton from "../widgets/HomeButton";

export default function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newpassword, setNewPassword] = useState('');
    const [repeatpassword, setRepeatPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let formErrors = {};

        if (!email) {
            formErrors.email = 'Полето е задолжително';
        }
        else if (!/\S+@\S+\.\S+/.test(email)) {
            formErrors.email = 'Не е внесена валидна емаил адреса';
        }

        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(newpassword);
        const hasUppercase = /[A-Z]/.test(newpassword);

        if (!newpassword) {
            formErrors.newpassword = 'Полето е задолжително';
        }
        else if (newpassword.length <= 8) {
            formErrors.newpassword = 'Лозинката мора да содржи најмалку 8 карактери';
        }
        else if (!hasSpecialChar) {
            formErrors.newpassword = 'Лозинката мора да содржи специјален карактер';
        }
        else if (!hasUppercase) {
            formErrors.newpassword = 'Лозинката мора да содржи голема буква';
        }

        if (!repeatpassword) {
            formErrors.repeatpassword = 'Полето е задолжително';
        }
        else if (repeatpassword !== newpassword) {
            formErrors.repeatpassword = 'Лозинките не се совпаѓаат';
        }

        return formErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await fetch('https://localhost:5173', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newpassword }),
            });

            const data = await response.json();

            if (response.ok) {
            alert('Успешно се променета лозинката!');
            navigate('/login');
        }
        else {
            setErrors({ server: data.message || 'Промената не е успешна, обидете се повторно!' });
        }
        }
        catch (error) {
            setErrors({ server: 'Network error. Please try again later.' });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="home">
            <header className='forgot-header'>
                <Logo />
                <div className="nav-icons-row">
                    <HomeButton />
                </div>
            </header>
            <div className='loginForm'>
            <form className='form' onSubmit={handleSubmit} noValidate>
                <img src={kidsImage} alt="login slika" className='kids-image' />

                <h2>Добредојдовте во ЛексиЛенд!</h2>
                <p className='message'>Пополнете ја формата за да ја промените лозинката.</p>

                {errors.server && <div className='bannerError'>{errors.server}</div>}

                <div className='input'>
                    <label htmlFor='email'>Е-пошта</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? 'input-error' : ''}
                        placeholder="you@example.com"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="input">
                    <label htmlFor="newpassword">Нова лозинка</label>
                    <input
                        type="password"
                        id="newpassword"
                        value={newpassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={errors.newpassword ? 'input-error' : ''}
                        placeholder="********"
                    />
                    {errors.newpassword && <span className="error-text">{errors.newpassword}</span>}
                </div>

                <div className="input">
                    <label htmlFor="repeatpassword">Повтори лозинка</label>
                    <input
                        type="password"
                        id="repeatpassword"
                        value={repeatpassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className={errors.repeatpassword ? 'input-error' : ''}
                        placeholder="********"
                    />
                    {errors.repeatpassword && <span className="error-text">{errors.repeatpassword}</span>}
                </div>

                <div className='form-row'>
                    <div className='rememberMe'>
                        <input type='checkbox' id='remember' />
                        <label htmlFor='remember'>Запомни профил</label>
                    </div>               
                </div>

                <button type='submit' disabled={isSubmitting} className='submit'>
                    {isSubmitting ? 'Променување...' : 'Променете лозинка'}
                </button>
            </form>
        </div>
        </div>
    );
}