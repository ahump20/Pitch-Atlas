import { Skeleton } from 'pitch-atlas'

export const LoadingCard = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 320 }}>
    <Skeleton style={{ height: 48, width: 48, borderRadius: 9999 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
      <Skeleton style={{ height: 12, width: '70%' }} />
      <Skeleton style={{ height: 12, width: '45%' }} />
    </div>
  </div>
)
