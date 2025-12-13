import styles from './Section.module.css';

const Section = ({ children, className = '', background = 'white', id = '' }) => {
    return (
        <section id={id} className={`${styles.section} ${styles[background]} ${className}`}>
            <div className={styles.container}>
                {children}
            </div>
        </section>
    );
};

export default Section;
