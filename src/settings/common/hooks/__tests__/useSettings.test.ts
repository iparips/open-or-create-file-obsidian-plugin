import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Events, EventRef } from 'obsidian'
import { useSettings } from '../useSettings'
import type { CreateOrOpenFilePluginSettings } from '../../../../types'
import { aCommand, aSettings } from '../../../../test-support/builders'

const createMockEvents = (): Events => {
	const partial: Partial<Events> = {
		on: vi.fn(() => ({}) as EventRef),
		offref: vi.fn(),
	}
	return partial as Events
}

describe('useSettings', () => {
	const mockOnSettingsChange = vi.fn()
	let mockSettingsEvents: Events
	let initialSettings: CreateOrOpenFilePluginSettings

	beforeEach(() => {
		vi.clearAllMocks()
		mockSettingsEvents = createMockEvents()
		initialSettings = aSettings().withCommand(aCommand().build()).build()
	})

	it('returns initial settings', () => {
		const { result } = renderHook(() =>
			useSettings({
				initialSettings,
				onSettingsChange: mockOnSettingsChange,
				settingsEvents: mockSettingsEvents,
			}),
		)

		expect(result.current.settings).toEqual(initialSettings)
	})

	it('returns initial validation result', () => {
		const { result } = renderHook(() =>
			useSettings({
				initialSettings,
				onSettingsChange: mockOnSettingsChange,
				settingsEvents: mockSettingsEvents,
			}),
		)

		expect(result.current.validationResult.isValid).toBe(true)
	})

	describe('updateSettings', () => {
		it('updates local state and calls onSettingsChange', async () => {
			const { result } = renderHook(() =>
				useSettings({
					initialSettings,
					onSettingsChange: mockOnSettingsChange,
					settingsEvents: mockSettingsEvents,
				}),
			)

			const newSettings = aSettings()
				.withCommand(aCommand().withCommandName('Updated Command').build())
				.build()

			await act(async () => {
				await result.current.updateSettings(newSettings)
			})

			expect(result.current.settings).toEqual(newSettings)
			expect(mockOnSettingsChange).toHaveBeenCalledWith(newSettings)
		})

		it('re-validates after settings update', async () => {
			const { result } = renderHook(() =>
				useSettings({
					initialSettings,
					onSettingsChange: mockOnSettingsChange,
					settingsEvents: mockSettingsEvents,
				}),
			)

			const invalidSettings = aSettings()
				.withCommand(
					aCommand()
						.withCommandName('')
						.withTemplatePath('')
						.withDestinationFolder('')
						.withFileName('')
						.build(),
				)
				.build()

			await act(async () => {
				await result.current.updateSettings(invalidSettings)
			})

			expect(result.current.validationResult.isValid).toBe(false)
		})
	})

	describe('settings-reloaded event', () => {
		it('subscribes to settings-reloaded event on mount', () => {
			renderHook(() =>
				useSettings({
					initialSettings,
					onSettingsChange: mockOnSettingsChange,
					settingsEvents: mockSettingsEvents,
				}),
			)

			expect(mockSettingsEvents.on).toHaveBeenCalledWith('settings-reloaded', expect.any(Function))
		})

		it('unsubscribes from event on unmount', () => {
			const { unmount } = renderHook(() =>
				useSettings({
					initialSettings,
					onSettingsChange: mockOnSettingsChange,
					settingsEvents: mockSettingsEvents,
				}),
			)

			unmount()

			expect(mockSettingsEvents.offref).toHaveBeenCalled()
		})

		it('updates settings when settings-reloaded event fires', async () => {
			const onSpy = vi.spyOn(mockSettingsEvents, 'on')

			const { result } = renderHook(() =>
				useSettings({
					initialSettings,
					onSettingsChange: mockOnSettingsChange,
					settingsEvents: mockSettingsEvents,
				}),
			)

			const settingsReloadedCallback = onSpy.mock.calls[0][1] as (
				settings: CreateOrOpenFilePluginSettings,
			) => void

			const syncedSettings = aSettings()
				.withCommand(aCommand().withCommandName('Synced From Another Device').build())
				.build()

			act(() => {
				settingsReloadedCallback(syncedSettings)
			})

			await waitFor(() => {
				expect(result.current.settings).toEqual(syncedSettings)
			})
		})

		it('re-validates when settings-reloaded event fires with invalid settings', async () => {
			const onSpy = vi.spyOn(mockSettingsEvents, 'on')

			const { result } = renderHook(() =>
				useSettings({
					initialSettings,
					onSettingsChange: mockOnSettingsChange,
					settingsEvents: mockSettingsEvents,
				}),
			)

			const settingsReloadedCallback = onSpy.mock.calls[0][1] as (
				settings: CreateOrOpenFilePluginSettings,
			) => void

			const invalidSettings = aSettings()
				.withCommand(
					aCommand()
						.withCommandName('')
						.withTemplatePath('')
						.withDestinationFolder('')
						.withFileName('')
						.build(),
				)
				.build()

			act(() => {
				settingsReloadedCallback(invalidSettings)
			})

			await waitFor(() => {
				expect(result.current.validationResult.isValid).toBe(false)
			})
		})
	})
})
