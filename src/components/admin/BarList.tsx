import type { BarItem } from './theme';

/** Titled card with a ranked list of horizontal bars. Ported from BarList.dc.html. */
export function BarList({
  title,
  caption,
  items,
  minHeight,
}: {
  title: string;
  caption?: string;
  items: BarItem[];
  minHeight?: number;
}) {
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '18px 18px 20px',
        height: '100%',
        minHeight,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '.07em',
            textTransform: 'uppercase',
            color: 'var(--faint)',
          }}
        >
          {title}
        </span>
        {caption ? (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)' }}>
            {caption}
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 16 }}>
        {items.length === 0 ? (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
            no data
          </span>
        ) : (
          items.map((r, i) => (
            <div key={r.label + i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    color: 'var(--dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.label}
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text)',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: 'var(--mono)',
                    flex: 'none',
                  }}
                >
                  {r.nFmt}
                </span>
              </div>
              <div
                style={{
                  height: 3,
                  background: 'var(--grid)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    width: r.pct,
                    background: r.barColor,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
