export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClass} border-3 border-[#e1e3e4] border-t-[#115cb9] rounded-full animate-spin`} />
    </div>
  )
}
