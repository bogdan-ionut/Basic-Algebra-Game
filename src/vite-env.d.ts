/// <reference types="vite/client" />

import type * as React from 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      'camera-controls'?: boolean;
      'auto-rotate'?: boolean;
      'auto-rotate-delay'?: string;
      'rotation-per-second'?: string;
      'camera-orbit'?: string;
      'min-camera-orbit'?: string;
      'max-camera-orbit'?: string;
      'field-of-view'?: string;
      'shadow-intensity'?: string;
      exposure?: string;
      'interaction-prompt'?: string;
      'touch-action'?: string;
    };
  }
}
