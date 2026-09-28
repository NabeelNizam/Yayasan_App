'use client'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="id">
      <body style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h2>Terjadi kesalahan sistem</h2>
        <p>Silakan coba lagi. Bila masalah berlanjut, hubungi pengurus.</p>
        {error.digest ? (
          <p style={{ color: '#666', fontSize: 12 }}>Kode: {error.digest}</p>
        ) : null}
        <button
          onClick={() => retry()}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #0B7932',
            background: '#0B7932',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  )
}
