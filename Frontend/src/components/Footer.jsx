// ============================================================
// Footer.jsx — Site Footer
// ============================================================
// Contains: logo, quick links, copyright notice.
// ============================================================

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer" role="contentinfo">
            <div className="footer__inner">

                {/* Brand */}
                <div className="footer__brand">
                    <div className="footer__logo">
                        <span className="footer__logo-icon" aria-hidden="true">⬡</span>
                        <span className="footer__logo-text">Demo<span>App</span></span>
                    </div>
                    <p className="footer__tagline">
                        Secure, modern web application OUR the MERN Stack.
                    </p>
                </div>

                {/* Quick Links */}
                <nav className="footer__nav" aria-label="Footer navigation">
                    <h3 className="footer__heading">Quick Links</h3>
                    <ul className="footer__links" role="list">
                        <li><a href="/#home"    className="footer__link">Home</a></li>
                        <li><a href="/#about"   className="footer__link">About</a></li>
                        <li><a href="/#contact" className="footer__link">Contact</a></li>
                    </ul>
                </nav>

                {/* Contact snippet */}
                <div className="footer__contact">
                    <h3 className="footer__heading">Contact</h3>
                    <ul className="footer__contact-list" role="list">
                        <li>
                            <span className="footer__contact-icon" aria-hidden="true">✉</span>
                            <a href="mailto:support@example.com" className="footer__link">
                                support@example.com
                            </a>
                        </li>
                        <li>
                            <span className="footer__contact-icon" aria-hidden="true">📞</span>
                            <a href="tel:+919876543210" className="footer__link">
                                +91 9876543210
                            </a>
                        </li>
                        <li>
                            <span className="footer__contact-icon" aria-hidden="true">📍</span>
                            <span className="footer__contact-text">Noida, India</span>
                        </li>
                    </ul>
                </div>

            </div>

            {/* Bottom bar */}
            <div className="footer__bottom">
                <p className="footer__copy">
                    © {year} Demo Website. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
