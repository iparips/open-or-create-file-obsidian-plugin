import { vi } from 'vitest'
import type {
	App,
	TFile as ObsidianTFile,
	TFolder as ObsidianTFolder,
	Vault as ObsidianVault,
} from 'obsidian'

export type TFile = ObsidianTFile
export type TFolder = ObsidianTFolder
export type Vault = ObsidianVault

// Mock implementations
export const mockTFile = (path: string): TFile =>
	({
		path,
		basename: path.split('/').pop()?.split('.')[0] || '',
		extension: path.split('.').pop() || '',
		name: path.split('/').pop() || '',
		stat: {
			ctime: Date.now(),
			mtime: Date.now(),
			size: 0,
		},
		parent: null,
		vault: mockVault(),
	}) as unknown as TFile

export const mockTFolder = (path: string): TFolder =>
	({
		path,
		isRoot: () => false,
		name: path.split('/').pop() || '',
		children: [],
		parent: null,
		vault: mockVault(),
	}) as unknown as TFolder

export const mockVault = (): Vault =>
	({
		adapter: {},
		configDir: '',
		getName: () => 'mock-vault',
		getFileByPath: vi.fn(),
		getFolderByPath: vi.fn().mockImplementation((path: string) => null),
		getAbstractFileByPath: vi.fn().mockImplementation((path: string) => null),
		createFolder: vi.fn().mockImplementation((path: string) => Promise.resolve(mockTFolder(path))),
		create: vi
			.fn()
			.mockImplementation((path: string, data: string) => Promise.resolve(mockTFile(path))),
		read: vi.fn().mockImplementation((file: TFile) => Promise.resolve('')),
	}) as unknown as Vault

export const mockApp = (vault = mockVault()): App =>
	({
		vault,
		workspace: {
			openLinkText: vi
				.fn()
				.mockImplementation((linktext: string, sourcePath: string) => Promise.resolve()),
		},
		metadataCache: {},
		fileManager: {},
		commands: {},
		plugins: {},
		internalPlugins: {},
		lastEvent: null,
	}) as unknown as App

export function getModifiers(e: KeyboardEvent): string | null {
	const modifiers: string[] = []
	if (e.ctrlKey) modifiers.push('Ctrl')
	if (e.metaKey) modifiers.push('Meta')
	if (e.altKey) modifiers.push('Alt')
	if (e.shiftKey) modifiers.push('Shift')
	return modifiers.length > 0 ? modifiers.join('+') : null
}

// Mock normalizePath function
export function normalizePath(path: string): string {
	// Simple mock implementation that normalizes path separators
	return path.replace(/\\/g, '/')
}
