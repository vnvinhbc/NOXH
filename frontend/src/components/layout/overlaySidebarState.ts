export function getOverlaySidebarPresentation(open: boolean) {
  return {
    panel: open ? 'translate-x-0' : '-translate-x-full',
    backdrop: open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
    expanded: open,
  }
}
