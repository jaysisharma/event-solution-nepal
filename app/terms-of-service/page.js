export const metadata = {
    title: "Terms of Service | Event Solution Nepal",
};

export default function TermsOfService() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16">
            <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-lg dark:prose-invert">
                <h2 className="mt-8 text-2xl font-semibold">1. Agreement to Terms</h2>
                <p>
                    By accessing our website at eventsolutionnepal.com.np, you agree to be bound by these terms of service and to comply with all applicable laws and regulations.
                    If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">2. Intellectual Property Rights</h2>
                <p>
                    Other than the content you own, under these Terms, Event Solution Nepal and/or its licensors own all the intellectual property rights and materials contained in this Website.
                    You are granted limited license only for purposes of viewing the material contained on this Website.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">3. Restrictions</h2>
                <p>
                    You are specifically restricted from all of the following:
                </p>
                <ul className="list-disc pl-6">
                    <li>publishing any Website material in any other media;</li>
                    <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
                    <li>publicly performing and/or showing any Website material;</li>
                    <li>using this Website in any way that is or may be damaging to this Website;</li>
                    <li>using this Website in any way that impacts user access to this Website;</li>
                </ul>

                <h2 className="mt-8 text-2xl font-semibold">4. Limitation of Liability</h2>
                <p>
                    In no event shall Event Solution Nepal, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.
                    Event Solution Nepal, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">5. Governing Law & Jurisdiction</h2>
                <p>
                    These Terms will be governed by and interpreted in accordance with the laws of Nepal, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Nepal for the resolution of any disputes.
                </p>
            </div>
        </div>
    );
}
