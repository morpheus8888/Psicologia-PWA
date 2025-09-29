declare module '@/locales/*/messages' {
	export const messages: import('@lingui/core').MessageCatalog
	const catalog: {
		messages: import('@lingui/core').MessageCatalog
	}
	export default catalog
}

declare module '@lingui/message-utils/compileMessage' {
	export type CompiledIcuChoices = Record<string, CompiledMessage> & {
		offset: number | undefined
	}

	export type CompiledMessageToken =
		| string
		| [name: string, type?: string, format?: null | string | unknown | CompiledIcuChoices]

	export type CompiledMessage = CompiledMessageToken[]

	export type MapTextFn = (value: string) => string

	export function compileMessage(message: string, mapText?: MapTextFn): CompiledMessage

	export function compileMessageOrThrow(
	message: string,
	mapText?: MapTextFn
): CompiledMessage
}

declare module '@lingui/message-utils' {
	export * from '@lingui/message-utils/compileMessage'
}
