import prisma from '@/lib/db';
import { createService, deleteService } from './actions';
import styles from '../admin.module.css';

export default async function AdminServices() {
    const services = await prisma.service.findMany({
        orderBy: { id: 'asc' }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Services</h1>

            <section className={styles.section}>
                <h3>Add New Service</h3>
                <form action={createService} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input name="title" type="text" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea name="description" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Image URL</label>
                        <input name="image" type="text" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Tags (Comma separated)</label>
                        <input name="tags" type="text" placeholder="Strategy, Growth, Engagement" />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Add Service</button>
                </form>
            </section>

            <section className={styles.section}>
                <h3>Existing Services</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>{service.title}</td>
                                    <td>{service.description.substring(0, 50)}...</td>
                                    <td>
                                        <form action={deleteService.bind(null, service.id)}>
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
