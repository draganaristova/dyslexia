import React, { useEffect, useState } from 'react';
import '../styles/Register.css';
import kidsImageReg from '../assets/screens/register_kids.png';
import HomeButton from '../widgets/HomeButton';
import Logo from '../widgets/Logo';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPass, setRepeatPass] = useState('');
    const [gender, setGender] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let formErrors = {};

        if (!name) {
            formErrors.name = 'Полето е задолжително';
        }

        if (!surname) {
            formErrors.surname = 'Полето е задолжително';
        }

        if (!age) {
            formErrors.age = 'Полето е задолжително';
        }

        if (!gender) {
            formErrors.gender = 'Изберете пол';
        }

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

        if (!repeatPass) {
            formErrors.repeatPass = 'Полето е задолжително';
        }
        else if (repeatPass !== password) {
            formErrors.repeatPass = 'Лозинките не се совпаѓаат';
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
                body: JSON.stringify({ name, surname, age, email, password, repeatPass, gender }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Успешно е креиран профил!');
            }
            else {
                setErrors({ server: data.message || 'Креирањето не е успешно, обидете се повторно!' });
            }
        }
        catch (error) {
            setErrors({ server: 'Network error. Please try again later.' });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const backgroundClass =
        gender === 'male' ? 'gender-male' :
        gender === 'female' ? 'gender-female' : '';

    useEffect(() => {
        document.body.classList.remove('gender-male', 'gender-female');
        if(backgroundClass) {
            document.body.classList.add(backgroundClass);
        }

        return () => {
            document.body.classList.remove('gender-male', 'gender-female');
        };
    }, [backgroundClass]);

    return (
        <div className={`register-page ${backgroundClass}`}>
            <header className="register-header">
                 <Logo />
                 <div className="nav-icons-row">
                    <HomeButton />
                 </div>
            </header>

            <div className='register-form-wrapper'>
                <form className='register-form register-form-wide' onSubmit={handleSubmit} noValidate>
                    <img src={kidsImageReg} alt="register slika" className='register-kids-image' />

                    <h2>Регистрирај се</h2>
                    <p className='register-message'>Креирај го твојот профил во ЛексиЛенд.</p>

                    {errors.server && <div className='register-banner-error'>{errors.server}</div>}

                    <div className='register-input-grid'>
                        <div className='register-input'>
                            <label htmlFor='name'>Име</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={errors.name ? 'register-input-error' : ''}
                                placeholder="Име на детето"
                            />
                            {errors.name && <span className="register-error-text">{errors.name}</span>}
                        </div>

                        <div className='register-input'>
                            <label htmlFor='surname'>Презиме</label>
                            <input
                                type="text"
                                id="surname"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className={errors.surname ? 'register-input-error' : ''}
                                placeholder="Презиме на детето"
                            />
                            {errors.surname && <span className="register-error-text">{errors.surname}</span>}
                        </div>

                        <div className='register-input'>
                            <label htmlFor='age'>Возраст</label>
                            <input
                                type="number"
                                id="age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className={errors.age ? 'register-input-error' : ''}
                                placeholder="Возраст на детето"
                            />
                            {errors.age && <span className="register-error-text">{errors.age}</span>}
                        </div>

                        <div className='register-input'>
                            <label htmlFor='email'>Е-пошта</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? 'register-input-error' : ''}
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="register-error-text">{errors.email}</span>}
                        </div>

                        <div className="register-input">
                            <label htmlFor="password">Лозинка</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={errors.password ? 'register-input-error' : ''}
                                placeholder="********"
                            />
                            {errors.password && <span className="register-error-text">{errors.password}</span>}
                        </div>

                        <div className="register-input">
                            <label htmlFor="repeatPass">Потврдете лозинка</label>
                            <input
                                type="password"
                                id="repeatPass"
                                value={repeatPass}
                                onChange={(e) => setRepeatPass(e.target.value)}
                                className={errors.repeatPass ? 'register-input-error' : ''}
                                placeholder="********"
                            />
                            {errors.repeatPass && <span className="register-error-text">{errors.repeatPass}</span>}
                        </div>
                    </div>

                    <div className='register-input register-gender-field'>
                        <label>Јас сум</label>
                        <div className='register-gender-row'>
                            <button
                                type='button'
                                className={`register-gender-option ${gender === 'male' ? 'register-selected-male' : ''}`}
                                onClick={() => setGender('male')}
                            >
                                <span className='register-gender-emoji'>👦</span> Момче
                            </button>
                            <button
                                type='button'
                                className={`register-gender-option ${gender === 'female' ? 'register-selected-female' : ''}`}
                                onClick={() => setGender('female')}
                            >
                                <span className='register-gender-emoji'>👧</span> Девојче
                            </button>
                        </div>
                        {errors.gender && <span className="register-error-text">{errors.gender}</span>}
                    </div>

                    <button type='submit' disabled={isSubmitting} className='register-submit'>
                        {isSubmitting ? 'Регистрирање...' : 'Регистрирај се'}
                    </button>
                </form>
            </div>
        </div>
    );
}