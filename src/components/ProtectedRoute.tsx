// This component is no longer needed as routing is handled in App.tsx
// Keeping it for backward compatibility but it just passes through
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

