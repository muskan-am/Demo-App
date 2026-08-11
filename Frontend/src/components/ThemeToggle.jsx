
import { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        if (isDark) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <label className="ui-switch" aria-label="Toggle dark and light theme">
            <input 
                type="checkbox" 
                checked={isDark} 
                onChange={(e) => setIsDark(e.target.checked)} 
            />
            <div className="slider">
                <div className="circle"></div>
            </div>
        </label>
    );
};

export default ThemeToggle;
