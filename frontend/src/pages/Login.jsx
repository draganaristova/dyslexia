import React, { useState } from 'react';
import '../styles/Login.css';
import kidsImage from '../assets/screens/login_kids.png';
import HomeButton from '../widgets/HomeButton';
import Logo from '../widgets/Logo';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);

        if (!password) {
            formErrors.password = 'Полето е задолжително';
        }
        else if (password.length <= 8) {
            formErrors.password = 'Лозинката мора да содржи најмалку 8 карактери';
        }
        else if (!hasSpecialChar) {
            formErrors.password = 'Лозинката мора да содржи специјален карактер';
        }
        else if (!hasUppercase) {
            formErrors.password = 'Лозинката мора да содржи голема буква';
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
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Успешно се најавивте!');
            }
            else {
                setErrors({ server: data.message || 'Најавата не е успешна, обидете се повторно!' });
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
        <div className="login-page">
            <header className="login-header">
                <Logo />
                 <div className="nav-icons-row">
                    <HomeButton />
                 </div>
            </header>

            <div className='login-form-wrapper'>
                <form className='login-form' onSubmit={handleSubmit} noValidate>
                    <img src={kidsImage} alt="login slika" className='login-kids-image' />

                    <h2>Добредојдовте во ЛексиЛенд!</h2>
                    <p className='login-message'>Пополнете ја формата за да можете да продолжите со играта.</p>

                    {errors.server && <div className='login-banner-error'>{errors.server}</div>}

                    <div className='login-input'>
                        <label htmlFor='email'>Е-пошта</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={errors.email ? 'login-input-error' : ''}
                            placeholder="you@example.com"
                        />
                        {errors.email && <span className="login-error-text">{errors.email}</span>}
                    </div>

                    <div className="login-input">
                        <label htmlFor="password">Лозинка</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={errors.password ? 'login-input-error' : ''}
                            placeholder="********"
                        />
                        {errors.password && <span className="login-error-text">{errors.password}</span>}
                    </div>

                    <div className='login-form-row'>
                        <div className='login-remember-me'>
                            <input type='checkbox' id='remember' />
                            <label htmlFor='remember'>Запомни профил</label>
                        </div>
                        <a href="/forgot-password" className="login-forgot-link">Заборавена лозинка?</a>
                    </div>

                    <button type='submit' disabled={isSubmitting} className='login-submit'>
                        {isSubmitting ? 'Најавување...' : 'Најави се'}
                    </button>

                    <p className="login-signup-redirect">Немате профил? <a href="/signup">Регистрирајте се</a></p>
                </form>
            </div>
        </div>
    );
}