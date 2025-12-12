import { Notice } from 'obsidian'
import { NoteCreator } from '../../notes/noteCreator'
import { ObsidianAdapter } from '../../notes/obsidianAdapter'
import { CommandConfig } from '../../types'
import { PathSegmentBuilder } from './pathSegmentBuilder'
import { PreviousNoteCandidatesFinder } from './previous-note-candidate-finder'
import { TimeShift, TimeShiftParser } from './timeShift'

function buildNoteFilePath(
	destinationFolderPattern: string,
	fileNamePattern: string,
	timeShift?: TimeShift,
) {
	const now = new Date()
	const destinationFolder = PathSegmentBuilder.build(destinationFolderPattern, now, timeShift)
	const fileName = PathSegmentBuilder.build(fileNamePattern, now, timeShift)
	return `${destinationFolder}/${fileName}`
}

function resolveTemplatePath(
	obsidianAdapter: ObsidianAdapter,
	destinationFolderPattern: string,
	fileNamePattern: string,
	templateFilePath: string | undefined,
	usePreviousNoteAsTemplate: boolean,
	commandTimeShift?: TimeShift,
): string | undefined {
	if (!usePreviousNoteAsTemplate) {
		return templateFilePath
	}

	const previousPaths = PreviousNoteCandidatesFinder.generateCandidates(
		destinationFolderPattern,
		fileNamePattern,
		commandTimeShift,
	)
	return previousPaths.find((path) => obsidianAdapter.doesFileExist(path)) ?? templateFilePath
}

export function createOrOpenFileCommandCallback(
	obsidianAdapter: ObsidianAdapter,
	commandConfig: CommandConfig,
) {
	return async () => {
		const {
			destinationFolderPattern,
			fileNamePattern,
			timeShift,
			templateFilePath,
			usePreviousNoteAsTemplate,
		} = commandConfig

		const parsedTimeShift = TimeShiftParser.parse(timeShift)

		const noteFilePath = buildNoteFilePath(
			destinationFolderPattern,
			fileNamePattern,
			parsedTimeShift,
		)

		const effectiveTemplatePath = resolveTemplatePath(
			obsidianAdapter,
			destinationFolderPattern,
			fileNamePattern,
			templateFilePath,
			usePreviousNoteAsTemplate ?? false,
			parsedTimeShift,
		)

		await new NoteCreator(obsidianAdapter)
			.openOrCreateFileFromTemplate(noteFilePath, effectiveTemplatePath)
			.then((outcome) => new Notice(outcome))
			.catch((err) => new Notice(err))
	}
}
