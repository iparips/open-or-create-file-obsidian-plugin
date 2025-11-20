import type { ObsidianAdapter } from './obsidianAdapter'

export class NoteCreator {
	obsidian: ObsidianAdapter

	constructor(obsidian: ObsidianAdapter) {
		this.obsidian = obsidian
	}

	public async openOrCreateFileFromTemplate(
		noteFilePath: string,
		templateFilePath?: string,
	): Promise<string> {
		const noteFileExists = this.obsidian.doesFileExist(noteFilePath)
		return noteFileExists
			? this.obsidian.openFile(noteFilePath)
			: this.obsidian
					.createFileAndFolder(noteFilePath, templateFilePath)
					.then(() => this.obsidian.openFile(noteFilePath))
					.then(() => Promise.resolve('Note created and opened'))
	}
}
