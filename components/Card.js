import styles from './Card.module.css';
import Image from 'next/image';
import Link from 'next/link';

const Card = ({ title, description, image, href, buttonText, className = '' }) => {
    return (
        <div className={`${styles.card} ${className}`}>
            {image && (
                <div className={styles.imageWrapper}>
                    <Image src={image} alt={title} fill className={styles.image} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>
            )}
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                {description && <p className={styles.description}>{description}</p>}
                {href && buttonText && (
                    <Link href={href} className={styles.link}>
                        {buttonText} &rarr;
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Card;
