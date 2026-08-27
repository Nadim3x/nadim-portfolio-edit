import { useEffect, useState } from 'react';
import { useContent } from '@/lib/content-context';
import { CONTACT_LINKS, type Lang } from '@/i18n';

type Props = {
  lang: Lang;
  onToggleLang: () => void;
};

export function Nav({ lang, onToggleLang }: Props) {
  const { getValue } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled((window.scrollY || document.documentElement.scrollTop) > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const isBengali = lang === 'bn';

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <a href="#top" className="logo">
          NADIM<span className="logo-dot">.</span>EDITOR
        </a>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
          <a href="#about" onClick={closeMenu}>{getValue('nav.about', lang)}</a>
          <a href="#reel" onClick={closeMenu}>{getValue('nav.work', lang)}</a>
          <a href="#services" onClick={closeMenu}>{getValue('nav.services', lang)}</a>
          <a href="#contact" onClick={closeMenu}>{getValue('nav.contact', lang)}</a>
        </nav>

        <div className="nav-actions">
          <button
            className={`lang-toggle${isBengali ? ' bn-active' : ' en-active'}`}
            data-lang={lang}
            data-active-language={lang}
            aria-label={`Switch language. Current language: ${isBengali ? 'Bengali' : 'English'}`}
            aria-pressed={isBengali}
            onClick={onToggleLang}
          >
            <span
              className="lang-slider"
              aria-hidden="true"
              style={{
                transform: isBengali ? 'translateX(100%)' : 'translateX(0)',
              }}
            />
            <span className={`lang-opt${!isBengali ? ' active' : ''}`}>EN</span>
            <span className={`lang-opt${isBengali ? ' active' : ''}`}>BN</span>
          </button>

          <a
            href={CONTACT_LINKS.whatsapp}
            className="btn btn-primary btn-small"
            target="_blank"
            rel="noopener noreferrer"
          >
            {getValue('nav.cta', lang)}
          </a>
        </div>

        <button
          className={`nav-burger${menuOpen ? ' open' : ''}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
