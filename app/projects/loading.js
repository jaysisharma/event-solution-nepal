export default function ProjectsLoading() {
    return (
        <div style={{ paddingTop: '5rem', maxWidth: '90rem', margin: '0 auto', padding: '5rem 1rem 2rem' }}>
            <div style={{ padding: '0 1rem' }}>
                <div style={{ height: '60px', width: '300px', background: '#e2e8f0', marginBottom: '1rem', borderRadius: '4px' }} className="animate-pulse"></div>
                <div style={{ height: '20px', width: '500px', background: '#f1f5f9', marginBottom: '4rem', borderRadius: '4px' }} className="animate-pulse"></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: '500px', background: '#f1f5f9', borderRadius: '4px' }} className="animate-pulse"></div>
                ))}
            </div>
        </div>
    );
}
