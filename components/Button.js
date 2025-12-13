import styles from './Button.module.css';
import Link from 'next/link';

const Button = ({ children, variant = 'primary', href, onClick, className = '', ...props }) => {
    const btnClass = `${styles.button} ${styles[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={btnClass} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button className={btnClass} onClick={onClick} {...props}>
            {children}
        </button>
    );
};

export default Button;
