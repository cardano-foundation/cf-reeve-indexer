import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @keyframes view-transition-fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes view-transition-rise-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }

  @keyframes view-transition-slide-in {
    from {
      transform: translateX(-100%);
    }
  }

  @keyframes view-transition-slide-out {
    to {
      transform: translateX(-100%);
    }
  }

  @keyframes view-transition-slide-up {
    from {
      transform: translateY(100%);
    }
  }

  @keyframes view-transition-slide-down {
    to {
      transform: translateY(100%);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    ::view-transition-old(root) {
      animation: view-transition-fade-out 0.15s ease both;
    }

    ::view-transition-new(root) {
      animation: view-transition-rise-in 0.25s ease both;
    }

    ::view-transition-new(sidebar):only-child {
      animation: view-transition-slide-in 0.35s ease both;
    }

    ::view-transition-old(sidebar):only-child {
      animation: view-transition-slide-out 0.25s ease both;
    }

    ::view-transition-new(bottom-navigation):only-child {
      animation: view-transition-slide-up 0.35s ease both;
    }

    ::view-transition-old(bottom-navigation):only-child {
      animation: view-transition-slide-down 0.25s ease both;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none;
    }
  }
`
