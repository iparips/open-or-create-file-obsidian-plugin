import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockApp, mockTFile, mockTFolder, mockVault } from '../../test-support/__mocks__/obsidian'
import { ObsidianAdapter } from '../obsidianAdapter'
import type { App, Vault } from 'obsidian'

// Note: obsidian module is resolved via alias in vite.config.ts

describe('ObsidianAdapter', () => {
	let app: App
	let vault: Vault
	let adapter: ObsidianAdapter
	const filePath = 'test/folder/file.md'
	const templatePath = 'templates/template.md'
	const folderPath = 'test/folder'

	beforeEach(() => {
		vault = mockVault()
		app = mockApp(vault)
		adapter = new ObsidianAdapter(app)
	})

	describe('openFile', () => {
		it('opens note file when note file exists', async () => {
			vi.spyOn(app.workspace, 'openLinkText').mockResolvedValue(undefined)

			const result = await adapter.openFile(filePath, folderPath)
			expect(result).toBe('Note opened')
			expect(app.workspace.openLinkText).toHaveBeenCalledWith(filePath, folderPath)
		})

		it('rejects with error message when file cannot be opened', async () => {
			vi.spyOn(app.workspace, 'openLinkText').mockRejectedValue(new Error('Failed to open'))

			await expect(adapter.openFile(filePath, folderPath)).rejects.toBe(
				'Could not open the filePath [test/folder/file.md], sourcePath[test/folder]',
			)
		})

		it('uses empty string as default sourcePath when not provided', async () => {
			vi.spyOn(app.workspace, 'openLinkText').mockResolvedValue(undefined)

			await adapter.openFile(filePath)
			expect(app.workspace.openLinkText).toHaveBeenCalledWith(filePath, '')
		})
	})

	describe('doesFileExist', () => {
		it('returns true when file exists', () => {
			const existingFile = mockTFile(filePath)
			vi.spyOn(vault, 'getFileByPath').mockReturnValue(existingFile)

			expect(adapter.doesFileExist(filePath)).toBe(true)
			expect(vault.getFileByPath).toHaveBeenCalledWith(filePath)
		})

		it('returns false when file does not exist', () => {
			vi.spyOn(vault, 'getFileByPath').mockReturnValue(null)

			expect(adapter.doesFileExist(filePath)).toBe(false)
			expect(vault.getFileByPath).toHaveBeenCalledWith(filePath)
		})
	})

	describe('createFileAndFolder', () => {
		it('exits with error when template file is supplied but not found', async () => {
			vi.spyOn(vault, 'getFileByPath').mockReturnValue(null)

			await expect(adapter.createFileAndFolder(filePath, templatePath)).rejects.toBe(
				'Template file not found',
			)
		})

		it('creates empty note when template file is not supplied', async () => {
			vi.spyOn(vault, 'getFileByPath').mockReturnValue(null)
			vi.spyOn(vault, 'getFolderByPath').mockReturnValue(null)
			vi.spyOn(vault, 'createFolder').mockResolvedValue(mockTFolder(folderPath))
			vi.spyOn(vault, 'create').mockResolvedValue(mockTFile(filePath))

			await adapter.createFileAndFolder(filePath)

			expect(vault.createFolder).toHaveBeenCalledWith(folderPath)
			expect(vault.create).toHaveBeenCalledWith(filePath, '')
			expect(vault.read).not.toHaveBeenCalled()
		})

		it('creates note directory when note directory is missing', async () => {
			const templateFile = mockTFile(templatePath)
			vi.spyOn(vault, 'getFileByPath').mockImplementation((path) =>
				path === templatePath ? templateFile : null,
			)
			vi.spyOn(vault, 'getFolderByPath').mockReturnValue(null)
			vi.spyOn(vault, 'createFolder').mockResolvedValue(mockTFolder(folderPath))
			vi.spyOn(vault, 'read').mockResolvedValue('template content')
			vi.spyOn(vault, 'create').mockResolvedValue(mockTFile(filePath))

			await adapter.createFileAndFolder(filePath, templatePath)

			expect(vault.createFolder).toHaveBeenCalledWith(folderPath)
			expect(vault.create).toHaveBeenCalledWith(filePath, 'template content')
		})

		it('creates new files from template when note directory is present', async () => {
			const templateFile = mockTFile(templatePath)
			const existingFolder = mockTFolder(folderPath)

			vi.spyOn(vault, 'getFileByPath').mockImplementation((path) =>
				path === templatePath ? templateFile : null,
			)
			vi.spyOn(vault, 'getFolderByPath').mockReturnValue(existingFolder)
			vi.spyOn(vault, 'read').mockResolvedValue('template content')
			vi.spyOn(vault, 'create').mockResolvedValue(mockTFile(filePath))

			await adapter.createFileAndFolder(filePath, templatePath)

			expect(vault.createFolder).not.toHaveBeenCalled()
			expect(vault.create).toHaveBeenCalledWith(filePath, 'template content')
		})
	})
})
