export function PageSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ 
          height: 300, 
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 16,
          marginBottom: 24
        }} />
        <div style={{ 
          height: 200, 
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 16
        }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function AdCardSkeleton() {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 16, 
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        aspectRatio: '1', 
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{ padding: 16 }}>
        <div style={{ 
          height: 24, 
          width: '60%', 
          background: '#f0f0f0', 
          borderRadius: 4, 
          marginBottom: 8 
        }} />
        <div style={{ 
          height: 16, 
          width: '90%', 
          background: '#f0f0f0', 
          borderRadius: 4, 
          marginBottom: 12 
        }} />
        <div style={{ 
          height: 12, 
          width: '40%', 
          background: '#f0f0f0', 
          borderRadius: 4 
        }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
