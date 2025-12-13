import styles from './quote.module.css';

export const metadata = {
    title: "Get a Quote | Event Solution Nepal",
    description: "Request a detailed proposal for your upcoming event.",
};

export default function Quote() {
    return (
        <main className={styles.main}>
            {/* Header */}
            <section className={styles.headerSection}>
                <span className={styles.subheading}>Request a Proposal</span>
                <h1 className={styles.title}>
                    Tailored to Your <span className={styles.highlight}>Needs</span>
                </h1>
                <p className={styles.description}>
                    Please provide as many details as possible so we can create an accurate and personalized estimate for your event.
                </p>
            </section>

            {/* Quote Form */}
            <div className={styles.formContainer}>
                <form>
                    {/* Section 1: Contact Info */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Client Details</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input type="text" className={styles.input} placeholder="John Doe" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Company (Optional)</label>
                                <input type="text" className={styles.input} placeholder="Company Name" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input type="email" className={styles.input} placeholder="john@example.com" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Phone Number</label>
                                <input type="tel" className={styles.input} placeholder="+977" required />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Event Details */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Event Specifics</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Event Type</label>
                                <select className={styles.select}>
                                    <option>Select Type...</option>
                                    <option>Wedding Ceremony</option>
                                    <option>Wedding Reception</option>
                                    <option>Corporate Conference</option>
                                    <option>Product Launch</option>
                                    <option>Private Party</option>
                                    <option>Concert / Festival</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Date of Event</label>
                                <input type="date" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Venue Location</label>
                                <input type="text" className={styles.input} placeholder="City or Venue Name" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estimated Guest Count</label>
                                <input type="number" className={styles.input} placeholder="e.g. 500" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Requirements */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Services & Budget</h2>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Services Required</label>
                                <div className={styles.checkboxGrid}>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkboxInput} /> Decoration
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkboxInput} /> Sound & Light
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkboxInput} /> Catering
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkboxInput} /> Photography
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkboxInput} /> Logistics
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkboxInput} /> Artist Mgmt
                                    </label>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estimated Budget (NPR)</label>
                                <select className={styles.select}>
                                    <option>Below 5 Lakhs</option>
                                    <option>5 - 10 Lakhs</option>
                                    <option>10 - 20 Lakhs</option>
                                    <option>20 - 50 Lakhs</option>
                                    <option>50 Lakhs +</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div className={styles.formSection}>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Additional Details</label>
                                <textarea className={styles.textarea} placeholder="Tell us more about your vision, themes, or specific requirements..."></textarea>
                            </div>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
