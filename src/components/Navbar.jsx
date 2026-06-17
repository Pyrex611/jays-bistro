import React from 'react';
import { ShoppingBag, Sun, Moon, Calendar } from 'lucide-react';

const NavLink = ({ page, current, setPage, scrolled, children, theme }) => {
    const isDarkBackground = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const defaultColor = (scrolled || current !== 'home') ? 'var(--color-text)' : (isDarkBackground ? 'var(--color-text)' : 'white');
    
    return (
        <button 
            onClick={() => setPage(page)} 
            className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 relative pb-1 ${current === page ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]/80'}`} 
            style={{ color: defaultColor }}
        >
            {children}
        </button>
    );
};

const Navbar = ({ scrolled, currentPage, setCurrentPage, theme, toggleTheme, cartCount, setIsCartOpen, justUpdatedByAI, WHATSAPP_NUMBER }) => {
    const isDarkNavText = scrolled || currentPage !== 'home';
    const navTextColor = isDarkNavText ? 'var(--color-text)' : 'white';

    return (
        <nav 
            className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? 'py-4 shadow-sm backdrop-blur-xl' : 'bg-transparent py-6'}`}
            style={{ backgroundColor: scrolled ? 'var(--color-nav-bg)' : 'transparent' }}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                
                {/* Left side Links (Desktop) */}
                <div className="hidden md:flex items-center gap-8 w-1/3">
                    <NavLink page="home" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>Home</NavLink>
                    <NavLink page="menu" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>Menu</NavLink>
                    <NavLink page="about" current={currentPage} setPage={setCurrentPage} scrolled={scrolled} theme={theme}>About</NavLink>
                </div>

                {/* Central Logo */}
                <div className="w-1/3 flex justify-start md:justify-center">
                    <div onClick={() => setCurrentPage('home')} className="cursor-pointer transition-all duration-500">
                        <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 ${scrolled ? 'scale-90 shadow-sm bg-[var(--color-bg-secondary)]' : 'scale-100 shadow-lg bg-[var(--color-bg-secondary)]'}`} style={{ borderColor: navTextColor }}>
                            <span className="font-handwritten leading-none text-2xl" style={{ color: navTextColor }}>Jay's</span>
                            <span className="font-handwritten leading-none text-sm text-accent -mt-1">Bistro</span>
                        </div>
                    </div>
                </div>

                {/* Right side Actions */}
                <div className="flex items-center justify-end gap-6 w-1/3">
                    {/* Restaurant CTA */}
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors" style={{ color: navTextColor }}>
                        <Calendar size={16} /> <span className="mt-[2px]">Book Table</span>
                    </a>
                    
                    <button onClick={toggleTheme} className="p-2 rounded-full transition-colors duration-300 hover:text-accent" style={{ color: navTextColor }} title="Toggle Theme">
                        {theme === 'dark' || (theme === 'system' && document.body.className === 'dark-theme') ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full transition-colors duration-300 hover:text-accent" style={{ color: navTextColor }}>
                        <ShoppingBag size={22} />
                        {cartCount > 0 && (
                            <span className={`absolute top-0 right-0 bg-accent text-[var(--color-bg)] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md ${justUpdatedByAI ? 'animate-bounce' : ''}`}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;