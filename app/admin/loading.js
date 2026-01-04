export default function AdminLoading() {
    return (
        <div style={{ padding: '2rem', display: 'grid', gap: '2rem' }}>
            <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px', width: '200px' }} className="animate-pulse"></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: '150px', background: '#f1f5f9', borderRadius: '12px' }} className="animate-pulse"></div>
                ))}
            </div>
            <div style={{ height: '400px', background: '#f1f5f9', borderRadius: '12px' }} className="animate-pulse"></div>
        </div>
    );
}
