import styles from './Button.module.css';
import Link from 'next/link';
import MagneticButton from './MagneticButton';

const Button = ({ children, variant = 'primary', href, onClick, className = '', ...props }) => {
    const btnClass = `${styles.button} ${styles[variant]} ${className}`;

    if (href) {
        return (
            <MagneticButton>
                <Link href={href} className={btnClass} {...props}>
                    {children}
                </Link>
            </MagneticButton>
        );
    }

    return (
        <MagneticButton>
            <button className={btnClass} onClick={onClick} {...props}>
                {children}
            </button>
        </MagneticButton>
    );
};

export default Button;
