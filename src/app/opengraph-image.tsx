import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Cult Machine submissions portal';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A0A0A',
          color: '#FFFFFF',
          padding: '64px 72px',
          fontFamily: 'Arial, sans-serif',
          border: '12px solid #F5E000',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 6 }}>
          <span>CULT</span>
          <span style={{ color: '#F5E000', margin: '0 14px' }}>★</span>
          <span>MACHINE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 920 }}>
          <div style={{ fontSize: 94, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4 }}>
            GET HEARD,
            <br />
            <span style={{ color: '#F5E000' }}>NOT BURIED.</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.78)', lineHeight: 1.25 }}>
            Official Cult Machine submissions platform for artists, labels, and curated editorial opportunities.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 18, fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3 }}>
            <span style={{ color: '#F5E000' }}>Free submissions</span>
            <span>Real curation</span>
            <span>Premium PR</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: 4, textTransform: 'uppercase' }}>
            cult-machine.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
