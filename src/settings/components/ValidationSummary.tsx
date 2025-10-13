import React from 'react'
import type { ValidationResult } from '../utils/validation/validationResult'

interface ErrorSummaryProps {
	validationResult: ValidationResult
}

export const ValidationSummary: React.FC<ErrorSummaryProps> = ({ validationResult }) => {
	if (!validationResult.hasErrors()) {
		return null
	}

	const errorSummary = validationResult.getErrorSummary()

	return (
		<div className="error-summary" data-plugin="open-or-create-file">
			<div className="error-summary-title">Please fill out the highlighted fields</div>
			<ul className="error-summary-list">
				{errorSummary.map((errorMessage, index) => (
					<li key={index} className="error-summary-item">
						{errorMessage}
					</li>
				))}
			</ul>
		</div>
	)
}
