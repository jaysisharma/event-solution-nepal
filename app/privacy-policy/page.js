export const metadata = {
    title: "Privacy Policy | Event Solution Nepal",
};

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16">
            <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-lg dark:prose-invert">
                <p>
                    Event Solution Nepal (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting your personal data.
                    This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from)
                    and tell you about your privacy rights and how the law protects you.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">1. Information We Collect</h2>
                <p>
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-6">
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                    <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                </ul>

                <h2 className="mt-8 text-2xl font-semibold">2. How We Use Your Personal Data</h2>
                <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6">
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                    <li>Where we need to comply with a legal obligation.</li>
                </ul>

                <h2 className="mt-8 text-2xl font-semibold">3. Cookies</h2>
                <p>
                    We use cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">4. Contact Us</h2>
                <p>
                    If you have any questions about this privacy policy or our privacy practices, please contact us at:
                    <br />
                    Email: info@eventsolutionnepal.com.np
                </p>
            </div>
        </div>
    );
}
