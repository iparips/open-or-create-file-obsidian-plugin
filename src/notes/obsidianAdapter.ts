import type { App } from 'obsidian'
import { normalizePath } from 'obsidian'

export class ObsidianAdapter {
	app: App

	constructor(app: App) {
		this.app = app
	}

	/**
	 * filePath is the path of the file to open
	 * sourcePath path of file where the link is being opened from
	 * 	(used for relative path resolution)
	 * returns a promise with string representing message to user
	 * 	about the operation
	 *  */
	public async openFile(filePath: string, sourcePath = ''): Promise<string> {
		return this.app.workspace
			.openLinkText(normalizePath(filePath), normalizePath(sourcePath))
			.catch(() =>
				Promise.reject(`Could not open the filePath [${filePath}], sourcePath[${sourcePath}]`),
			)
			.then(() => Promise.resolve('Note opened'))
	}

	public doesFileExist(fullPath: string): boolean {
		return this.app.vault.getFileByPath(normalizePath(fullPath)) !== null
	}

	public async createFileAndFolder(filePath: string, templateFilePath?: string): Promise<string> {
		const normalisedFilePath = normalizePath(filePath)
		const folderPath = normalisedFilePath.substring(0, normalisedFilePath.lastIndexOf('/'))
		const noteFolderExists = this.app.vault.getFolderByPath(folderPath)
		if (!noteFolderExists) {
			await this.app.vault.createFolder(folderPath)
		}
		return this.getTemplateContentOrEmpty(templateFilePath)
			.then((templateContent: string) => this.app.vault.create(normalisedFilePath, templateContent))
			.then(() => Promise.resolve('Note created'))
	}

	private getTemplateContentOrEmpty(templateFilePath?: string): Promise<string> {
		return templateFilePath ? this.loadTemplateContent(templateFilePath) : Promise.resolve('')
	}

	private loadTemplateContent(templateFilePath: string): Promise<string> {
		const normalisedTemplatePath = normalizePath(templateFilePath)
		const templateFile = this.app.vault.getFileByPath(normalisedTemplatePath)
		return templateFile
			? this.app.vault.read(templateFile)
			: Promise.reject('Template file not found')
	}
}
