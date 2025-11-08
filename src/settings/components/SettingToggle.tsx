import React, { useEffect, useRef } from 'react'
import { ToggleComponent } from 'obsidian'

interface SettingToggleProps {
	name: string
	description: string
	value: boolean
	onChange: (value: boolean) => void
}

export const SettingToggle: React.FC<SettingToggleProps> = ({ name, description, value, onChange }) => {
	const toggleRef = useRef<HTMLDivElement>(null)
	const toggleComponentRef = useRef<ToggleComponent | null>(null)
	const onChangeRef = useRef(onChange)

	useEffect(() => {
		onChangeRef.current = onChange}, [onChange]
	)

	useEffect(() => {
		toggleComponentRef.current?.setValue(value)
	}, [value])

	useEffect(() => {
		if (!toggleRef.current) return
		const toggle = new ToggleComponent(toggleRef.current)
		toggle.setValue(value)
		toggle.onChange((newValue) => {
			onChangeRef.current(newValue)
		})
		toggleComponentRef.current = toggle
	}, [])

	return (
		<div className="setting-item" data-plugin="open-or-create-file">
			<div className="setting-item-info">
				<div className="setting-item-name">{name}</div>
				<div className="setting-item-description">{description}</div>
			</div>
			<div className="setting-item-control">
				<div ref={toggleRef}></div>
			</div>
		</div>
	)
}
