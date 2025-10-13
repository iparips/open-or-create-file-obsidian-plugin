import React from 'react'

interface SettingInputProps {
	name: string
	description: string
	placeholder: string
	value?: string
	onChange: (value: string) => void
	onBlur?: (value: string) => void
	error?: string
}

export const SettingInput: React.FC<SettingInputProps> = ({
	name,
	description,
	placeholder,
	value,
	onChange,
	onBlur,
	error,
}) => {
	return (
		<div className="setting-item" data-plugin="open-or-create-file">
			<div className="setting-item-info">
				<div className="setting-item-name">{name}</div>
				<div className="setting-item-description">{description}</div>
			</div>
			<div className="w-full">
				{error && <div className="error-message">{error}</div>}
				<input
					type="text"
					className={`${error ? 'error' : ''}`}
					placeholder={placeholder}
					value={value ?? ''}
					onChange={(e) => onChange(e.target.value)}
					onBlur={(e) => onBlur?.(e.target.value)}
				/>
			</div>
		</div>
	)
}
