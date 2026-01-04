export default function EventsLoading() {
    return (
        <div style={{ paddingTop: '5rem', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1rem 2rem' }}>
            {/* Header Skeleton */}
            <div style={{ height: '40px', width: '200px', background: '#e2e8f0', marginBottom: '2rem', borderRadius: '4px' }} className="animate-pulse"></div>

            {/* Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <div style={{ height: '250px', background: '#f1f5f9' }} className="animate-pulse"></div>
                        <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                            <div style={{ height: '24px', width: '70%', background: '#e2e8f0' }} className="animate-pulse"></div>
                            <div style={{ height: '16px', width: '40%', background: '#e2e8f0' }} className="animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
