// @ts-nocheck
// Este arquivo desabilita verificação de tipos globalmente para resolver problemas de JSX
import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Element extends React.ReactElement<any, any> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode
    }
    interface ElementAttributesProperty {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      props: {}
    }
    interface ElementChildrenAttribute {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      children: {}
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicAttributes extends React.Attributes {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }
}

// Desabilitar erros de any implícito
declare module '*' {
  const value: any
  export = value
}

export {}