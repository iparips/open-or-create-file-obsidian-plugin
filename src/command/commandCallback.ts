import { Notice } from 'obsidian'
import { NoteCreator } from '../notes/noteCreator'
import { ObsidianAdapter } from '../notes/obsidianAdapter'
import { CommandConfig } from '../types'
import { processPattern } from './patternParser'
import { PreviousNoteFinder } from './previousNoteFinder'

function buildNoteFilePath(destinationFolderPattern: string, fileNamePattern: string, timeShift?: string) {
	const now = new Date()
	const destinationFolder = processPattern(destinationFolderPattern, now, timeShift)
	const fileName = processPattern(fileNamePattern, now, timeShift)
	return `${destinationFolder}/${fileName}`
}

export function createOrOpenFileCommandCallback(obsidianAdapter: ObsidianAdapter, commandConfig: CommandConfig) {
	return async () => {
		const { destinationFolderPattern, fileNamePattern, templateFilePath, timeShift, usePreviousNoteAsTemplate } =
			commandConfig
		const noteFilePath = buildNoteFilePath(destinationFolderPattern, fileNamePattern, timeShift)

		// Determine which template to use
		let effectiveTemplatePath = templateFilePath
		if (usePreviousNoteAsTemplate) {
			// Use PreviousNoteFinder to search for existing previous notes
			const finder = new PreviousNoteFinder(destinationFolderPattern, fileNamePattern, timeShift)
			const previousPaths = finder.generatePreviousNotePaths()

			// Find the first existing previous note
			for (const path of previousPaths) {
				if (obsidianAdapter.doesFileExist(path)) {
					effectiveTemplatePath = path
					break
				}
			}
			// If no previous note found, fall back to templateFilePath (which might be undefined)
		}

		await new NoteCreator(obsidianAdapter)
			.openOrCreateFileFromTemplate(noteFilePath, effectiveTemplatePath)
			.then((outcome) => new Notice(outcome))
			.catch((err) => new Notice(err))
	}
}
