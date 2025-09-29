declare module '@/locales/*/messages' {
  export const messages: import('@lingui/core').MessageCatalog
  const catalog: {
    messages: import('@lingui/core').MessageCatalog
  }
  export default catalog
}

declare module '@lingui/message-utils' {
  export * from '@lingui/message-utils/dist/compileMessage'
}

declare module '@lingui/message-utils/compileMessage' {
  export * from '@lingui/message-utils'
}
