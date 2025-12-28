import prisma from '@/lib/db';
import { createTeamMember, deleteTeamMember } from './actions';
import styles from '../admin.module.css';

export default async function AdminTeam() {
    const team = await prisma.teamMember.findMany({
        orderBy: { id: 'asc' }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Team</h1>

            <section className={styles.section}>
                <h3>Add Team Member</h3>
                <form action={createTeamMember} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input name="name" type="text" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Role</label>
                        <input name="role" type="text" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Image URL</label>
                        <input name="image" type="text" required placeholder="/meet_the_team/..." />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Add Member</button>
                </form>
            </section>

            <section className={styles.section}>
                <h3>Current Team</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map(member => (
                                <tr key={member.id}>
                                    <td>{member.name}</td>
                                    <td>{member.role}</td>
                                    <td>
                                        <form action={deleteTeamMember.bind(null, member.id)}>
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
