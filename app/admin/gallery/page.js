import prisma from '@/lib/db';
import { createGalleryItem, deleteGalleryItem } from './actions';
import styles from '../admin.module.css';

export default async function AdminGallery() {
    const galleryItems = await prisma.galleryItem.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Gallery</h1>

            <section className={styles.section}>
                <h3>Add Gallery Item</h3>
                <form action={createGalleryItem} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input name="title" type="text" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <select name="category">
                            <option value="Wedding">Wedding</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Concert">Concert</option>
                            <option value="Party">Party</option>
                            <option value="Decoration">Decoration</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Size</label>
                        <select name="size">
                            <option value="normal">Normal</option>
                            <option value="wide">Wide</option>
                            <option value="tall">Tall</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Image URL</label>
                        <input name="src" type="text" required />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Add Item</button>
                </form>
            </section>

            <section className={styles.section}>
                <h3>Gallery Items</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {galleryItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>{item.category}</td>
                                    <td>{item.size}</td>
                                    <td>
                                        <form action={deleteGalleryItem.bind(null, item.id)}>
                                            <button type="submit" className={styles.deleteBtn}>Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
