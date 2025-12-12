import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EventRef, Events } from 'obsidian'
import { SettingsLayout } from '../SettingsLayout'
import type { CreateOrOpenFilePluginSettings } from '../../../../types'
import { aCommand, aSettings } from '../../../../test-support/builders'

const createMockEvents = (): Events => {
	const partial: Partial<Events> = {
		on: vi.fn(() => ({}) as EventRef),
		offref: vi.fn(),
	}
	return partial as Events
}

// Mock child components
vi.mock('../ActionsHeader', () => ({
	ActionsHeader: () => <div data-testid="actions-header" />,
}))

vi.mock('../../../open-or-create/components/OpenOrCreateSettings', () => ({
	OpenOrCreateSettings: () => <div data-testid="open-or-create-settings" />,
}))

describe('SettingsComponent', () => {
	const mockUpdatePluginSettings = vi.fn()
	const mockSettingsEvents = createMockEvents()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders ActionsHeader and OpenOrCreateSettings', () => {
		const mockSettings: CreateOrOpenFilePluginSettings = aSettings()
			.withCommand(aCommand().build())
			.build()

		render(
			<SettingsLayout
				settings={mockSettings}
				updatePluginSettings={mockUpdatePluginSettings}
				settingsEvents={mockSettingsEvents}
			/>,
		)

		expect(screen.getByTestId('actions-header')).toBeDefined()
		expect(screen.getByTestId('open-or-create-settings')).toBeDefined()
	})
})
