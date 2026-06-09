import logoUrl from '@/assets/vspace-logo.png'

type BrandLogoProps = {
  className?: string
  alt?: string
}

export default function BrandLogo({ className = '', alt = 'V-SPACE' }: BrandLogoProps) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`object-contain ${className}`}
    />
  )
}
