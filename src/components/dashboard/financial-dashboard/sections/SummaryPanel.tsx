"use client";

import { useMemo } from "react";
import { useTranslation, type Locale } from "@/i18n";
import { formatCurrency } from "@/utils/format";

export type SummaryTotals = {
	totalIncome: number;
	subscriptionTotal: number;
	installmentTotal: number;
	periodTotal: number;
	totalExpenses: number;
	leftover: number;
};

type SummaryPanelProps = {
	monthKey: string;
	locale: Locale;
	totals: SummaryTotals;
	formatMonthLabel: (month: string, locale: string) => string;
	mapLocaleToIntl: (locale?: Locale) => string;
	currency?: string;
	intlLocale?: string;
};

export const SummaryPanel = ({
	monthKey,
	locale,
	totals,
	formatMonthLabel,
	mapLocaleToIntl,
	currency,
	intlLocale,
}: SummaryPanelProps) => {
	const { t } = useTranslation();

	const estimatedLeftover = useMemo(() => {
		return (
			totals.totalIncome -
			totals.subscriptionTotal -
			totals.installmentTotal
		);
	}, [totals.totalIncome, totals.subscriptionTotal, totals.installmentTotal]);
	const leftoverWithoutSubscriptions = useMemo(() => {
		return (
			totals.totalIncome - totals.installmentTotal - totals.periodTotal
		);
	}, [totals.totalIncome, totals.installmentTotal, totals.periodTotal]);

	const {
		expenseRatio,
		clampedExpenseRatio,
		expenseRatioPercent,
		expenseBarWidth,
		leftoverIsPositive,
	} = useMemo(() => {
		const relevantExpenses = totals.installmentTotal + totals.periodTotal;
		const ratio =
			totals.totalIncome > 0 ? relevantExpenses / totals.totalIncome : 0;
		const clamped = Math.min(Math.max(ratio, 0), 1);
		return {
			expenseRatio: ratio,
			clampedExpenseRatio: clamped,
			expenseRatioPercent: Math.round(Math.max(ratio, 0) * 100),
			expenseBarWidth: `${clamped * 100}%`,
			leftoverIsPositive: leftoverWithoutSubscriptions >= 0,
		};
	}, [
		totals.totalIncome,
		totals.installmentTotal,
		totals.periodTotal,
		leftoverWithoutSubscriptions,
	]);

	const leftoverStatusAccentClass = leftoverIsPositive
		? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300"
		: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300";
	const leftoverStatusMessage = leftoverIsPositive
		? t("dashboard.summary.leftoverPositive")
		: t("dashboard.summary.leftoverNegative");

	return (
		<div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-lg shadow-emerald-500/5 backdrop-blur-lg transition-all duration-200 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/5 dark:bg-neutral-900/70">
			<h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
				{t("dashboard.summary.title")}
			</h2>
			<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
				{t("dashboard.summary.month", {
					month: formatMonthLabel(monthKey, mapLocaleToIntl(locale)),
				})}
			</p>
			<dl className="mt-6 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
				<div className="flex items-center justify-between">
					<dt>{t("dashboard.summary.income")}</dt>
					<dd className="font-semibold text-neutral-900 dark:text-white">
						{formatCurrency(totals.totalIncome, {
							locale: intlLocale,
							currency,
						})}
					</dd>
				</div>
				<div className="flex items-center justify-between">
					<dt>{t("dashboard.summary.subscriptions")}</dt>
					<dd className="text-neutral-900 dark:text-white">
						{formatCurrency(totals.subscriptionTotal, {
							locale: intlLocale,
							currency,
						})}
					</dd>
				</div>
				<div className="flex items-center justify-between">
					<dt>{t("dashboard.summary.installments")}</dt>
					<dd className="text-neutral-900 dark:text-white">
						{formatCurrency(totals.installmentTotal, {
							locale: intlLocale,
							currency,
						})}
					</dd>
				</div>
				<div className="flex items-center justify-between">
					<dt>{t("dashboard.summary.period")}</dt>
					<dd className="text-neutral-900 dark:text-white">
						{formatCurrency(totals.periodTotal, {
							locale: intlLocale,
							currency,
						})}
					</dd>
				</div>
				<div className="flex flex-col gap-2 border-t border-neutral-200/50 pt-3 dark:border-neutral-700/50">
					<div className="flex items-center justify-between text-sm font-semibold text-neutral-700 dark:text-neutral-300">
						<dt>{t("dashboard.summary.estimatedLeftover")}</dt>
						<dd
							className={
								estimatedLeftover >= 0
									? "text-emerald-600 font-semibold dark:text-emerald-400"
									: "text-rose-600 font-semibold dark:text-rose-400"
							}
						>
							{formatCurrency(estimatedLeftover, {
								locale: intlLocale,
								currency,
							})}
						</dd>
					</div>

					<div className="flex items-center justify-between text-base font-semibold text-neutral-700 dark:text-neutral-300">
						<dt>{t("dashboard.summary.leftover")}</dt>
						<dd
							className={
								leftoverIsPositive
									? "text-emerald-600 dark:text-emerald-400"
									: "text-rose-600 dark:text-rose-400"
							}
						>
							{formatCurrency(leftoverWithoutSubscriptions, {
								locale: intlLocale,
								currency,
							})}
						</dd>
					</div>
				</div>
			</dl>
			<div className="mt-6 space-y-4 text-xs text-neutral-600 dark:text-neutral-400">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
						<span>{t("dashboard.summary.expenseRatio")}</span>
						<span>{expenseRatioPercent}%</span>
					</div>
					<div
						className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
						role="progressbar"
						aria-valuenow={clampedExpenseRatio}
						aria-valuemin={0}
						aria-valuemax={1}
					>
						<div
							className={`h-full rounded-full ${
								expenseRatio > 1
									? "bg-rose-400 dark:bg-rose-500"
									: "bg-emerald-500 dark:bg-emerald-400"
							}`}
							style={{ width: expenseBarWidth }}
						/>
					</div>
					<p>
						{t("dashboard.summary.expenseLegend", {
							expenses: formatCurrency(
								totals.installmentTotal + totals.periodTotal,
								{ locale: intlLocale, currency }
							),
							income: formatCurrency(totals.totalIncome, {
								locale: intlLocale,
								currency,
							}),
						})}
					</p>
				</div>
				<p
					className={`rounded-2xl border px-4 py-3 text-[11px] font-medium ${leftoverStatusAccentClass}`}
				>
					{leftoverStatusMessage}
				</p>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					{t("dashboard.summary.helperCalc") ??
						t("dashboard.summary.helper")}
				</p>
				<p className="text-[11px] text-neutral-500 dark:text-neutral-500">
					{t("dashboard.summary.estimatedHelperCalc") ??
						t("dashboard.summary.estimatedHelper")}
				</p>
			</div>
		</div>
	);
};
