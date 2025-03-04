import type React from "react"

export const CavemanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120" {...props}>
      <path
        fill="currentColor"
        d="M12 3c1.5 0 2.7.3 3.5 1.2 1.1 1.1 1.5 2.2 1.5 3.8s-.7 2.7-1.5 3.8c-.8.9-2 1.2-3.5 1.2s-2.7-.3-3.5-1.2C7.7 10.7 7 9.6 7 8s.7-2.7 1.5-3.8C9.3 3.3 10.5 3 12 3z"
      />
      <path fill="currentColor" d="M12 14c3.5 0 6 1.5 6 3.5v3.5H6v-3.5c0-2 2.5-3.5 6-3.5z" />
    </svg>
  )
}

