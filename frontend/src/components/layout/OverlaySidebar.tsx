import { useEffect, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { getOverlaySidebarPresentation } from './overlaySidebarState'

interface OverlaySidebarProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: ReactNode
  panelClassName?: string
}

export default function OverlaySidebar({
  open,
  onToggle,
  onClose,
  children,
  panelClassName = 'bg-[#f3f4f5]',
}: OverlaySidebarProps) {
  const presentation = getOverlaySidebarPresentation(open)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed left-4 top-3 z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[#001f49] shadow-md transition hover:bg-[#e6f0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#115cb9]"
        aria-label={open ? 'Dong menu dieu huong' : 'Mo menu dieu huong'}
        aria-expanded={presentation.expanded}
        aria-controls="overlay-navigation"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dong menu dieu huong"
        className={`fixed inset-0 z-50 bg-[#001229]/45 backdrop-blur-[2px] transition-opacity duration-300 ${presentation.backdrop}`}
      />

      <aside
        id="overlay-navigation"
        className={`fixed inset-y-0 left-0 z-[60] flex w-[min(19rem,86vw)] flex-col border-r border-black/10 shadow-2xl transition-transform duration-300 ease-out ${panelClassName} ${presentation.panel}`}
      >
        {children}
      </aside>
    </>
  )
}
