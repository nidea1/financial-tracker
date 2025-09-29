export const en = {
	common: {
		appName: "Monthly Finance Tracker",
		processing: "Processing...",
		loading: "Loading...",
	},
	auth: {
		title: "Monthly Finance Tracker",
		subtitle:
			"Track incomes and expenses to keep your home budget in control.",
		tabs: {
			login: "Log in",
			register: "Register",
		},
		labels: {
			username: "Username",
			password: "Password",
			confirmPassword: "Confirm Password",
		},
		placeholders: {
			username: "example.user",
			password: "At least 6 characters",
			confirmPassword: "Re-type your password",
		},
		helper: "Your data is stored locally; you can access it from other devices using the same account. Usernames must be unique.",
		buttons: {
			login: "Log in",
			register: "Register",
		},
		errors: {
			usernameRequired: "Username is required.",
			passwordRequired: "Password is required.",
			passwordMismatch: "Passwords do not match.",
			providerUnavailable: "Auth provider is not available.",
			usernameMissing: "Username is required.",
			passwordTooShort: "Password must be at least 6 characters.",
			usernameTaken: "This username is already taken.",
			userNotFound: "User not found.",
			passwordIncorrect: "Incorrect password.",
			generic: "An error occurred.",
			unexpected: "An unexpected error occurred. Please try again.",
		},
	},
	dashboard: {
		welcome: "Welcome",
		logout: "Log out",
		controls: {
			monthPicker: {
				trigger: "Open month picker",
				prev: "Previous year",
				next: "Next year",
				current: "This month",
			},
		},
		validation: {
			nameRequired: "Please add a name.",
			amountPositive: "Amount must be a positive number.",
			countPositive: "Installment count must be a positive integer.",
			formIncomplete: "Please check for missing or invalid fields.",
		},
		sections: {
			incomes: {
				title: "Incomes",
				subtitle: "Enter your salary, rent and other regular incomes.",
				labels: {
					name: "Income name",
					amount: "Amount",
					note: "Note (optional)",
				},
				placeholders: {
					name: "Income name",
					amount: "Amount",
					note: "E.g. payment description",
				},
				empty: "No incomes added yet.",
				add: "Add",
				remove: "Remove",
				summary: "Total income: {{amount}}",
				count: "{{count}} entries",
			},
			subscriptions: {
				title: "Monthly Estimated Expenses",
				subtitle:
					"Enter monthly estimated amounts for recurring payments like Netflix or Spotify.",
				labels: {
					name: "Subscription name",
					amount: "Amount",
					note: "Note (optional)",
				},
				placeholders: {
					name: "Subscription name",
					amount: "Amount",
					note: "E.g. renewal date",
				},
				empty: "No subscriptions added.",
				add: "Add",
				remove: "Remove",
				perMonth: "{{amount}} / month",
				summary: "Total estimated monthly expenses: {{amount}} / month",
				count: "{{count}} entries",
				hint: "Note: If you also add these under period expenses, totals may double-count. Keep them in only one place.",
			},
			installments: {
				title: "Installment Purchases",
				subtitle: "Specify total or monthly amounts for installments.",
				labels: {
					name: "Item name",
					mode: "Calculation mode",
					totalAmount: "Total amount",
					monthlyAmount: "Monthly payment",
					count: "Installment count",
					countType: "Installment type",
					note: "Note (optional)",
				},
				modes: {
					total: "Total + number of installments",
					monthly: "Monthly payment + number of installments",
				},
				placeholders: {
					name: "Item name",
					totalAmount: "Enter total amount",
					monthlyAmount: "Enter monthly payment",
					count: "Number of installments",
					note: "E.g. your bank",
				},
				helper: "If you enter total and count, the monthly amount will be calculated automatically.",
				countOptions: {
					planned: "Total installments",
					remaining: "Remaining installments",
				},
				preview: {
					helper: "Estimated payment plan",
					total: "Total: {{amount}}",
					monthly: "Monthly: {{amount}}",
				},
				save: "Save",
				empty: "No installment purchases added.",
				remove: "Remove",
				perMonth: "{{amount}} / month",
				remaining: "· {{count}} installments left",
				planned: "· {{count}} total installments",
				remainingOverTotal: "· {{remaining}}/{{total}} installments",
				currentOverTotal: "· {{current}}/{{total}} installments",
				total: "Total: {{amount}}",
				summary: "Monthly installment load: {{amount}}",
				count: "{{count}} entries",
			},
			periodExpenses: {
				title: "Period Expenses",
				subtitle:
					"Record flexible spending like card or cash purchases.",
				labels: {
					name: "Expense name",
					amount: "Amount",
					note: "Note (optional)",
				},
				placeholders: {
					name: "Expense name",
					amount: "Amount",
					note: "E.g. category",
				},
				empty: "No expenses added.",
				add: "Add",
				remove: "Remove",
				summary: "Total period expenses: {{amount}}",
				count: "{{count}} entries",
			},
		},
		summary: {
			title: "Monthly Summary",
			month: "{{month}}",
			income: "Total Income",
			subscriptions: "Monthly Estimated Expenses",
			installments: "Installments",
			period: "Period",
			leftover: "Remaining Budget",
			estimatedLeftover: "Estimated Remaining",
			estimatedHelper:
				"Estimated remaining is calculated without period expenses and includes monthly estimated expenses (subscriptions).",
			estimatedHelperCalc:
				"Estimated remaining is calculated as: income − (subscriptions + installments). Period (one-time) expenses are excluded.",
			expenseRatio: "Expense ratio",
			expenseLegend: "{{expenses}} / {{income}}",
			leftoverPositive: "Remaining budget is above target, great!",
			leftoverNegative:
				"Your expenses exceed your income, review your plan.",
			helper: "The remaining budget (excluding subscriptions) — review period expenses and installments to keep it positive.",
			helperCalc:
				"Remaining budget shown here excludes subscriptions. It is calculated as: income − (installments + period expenses).",
		},
		history: {
			title: "Monthly History",
			subtitle: "Compare your performance across previous months.",
			empty: "No historical data yet.",
			income: "Income: {{amount}}",
			expenses: "Expenses: {{amount}}",
			leftover: "Remaining: {{amount}}",
			active: "Active",
		},
		tip: {
			title: "Tip",
			subtitle: "A suggestion to strengthen your budgeting.",
			body: "After adding your incomes at the start of the month, add fixed expenses (subscriptions and installments). Use the remainder as a limit for period expenses and try to keep all spending within it.",
		},
		loading: {
			message: "Loading finance data...",
		},
	},
};

export type EnMessages = typeof en;
