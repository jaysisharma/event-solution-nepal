import prisma from '@/lib/db';
import { createProject, deleteProject } from './actions';
import styles from '../admin.module.css';

export default async function AdminProjects() {
    const projects = await prisma.workProject.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Projects</h1>

            <section className={styles.section}>
                <h3>Add New Project</h3>
                <form action={createProject} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input name="title" type="text" required placeholder="e.g. Royal Palace Wedding" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <select name="category">
                            <option value="Wedding">Wedding</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Concert">Concert</option>
                            <option value="Social">Social</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Year</label>
                        <input name="year" type="text" required placeholder="e.g. 2024" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Images (Comma separated URLs)</label>
                        <textarea name="images" required placeholder="https://..., https://..." />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Add Project</button>
                </form>
            </section>

            <section className={styles.section}>
                <h3>Existing Projects</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Year</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id}>
                                    <td>{project.title}</td>
                                    <td>{project.category}</td>
                                    <td>{project.year}</td>
                                    <td>
                                        <form action={deleteProject.bind(null, project.id)}>
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
