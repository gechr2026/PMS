// =============================================================
// usePmsScoreBreakdown — the one place a send's ratings become
// section subtotals and a 0-100 result.
// =============================================================
// /pms/summary/view and /pms/evaluation/view show the same four headline
// numbers for the same send, but each used to compute them on its own.
// They drifted: summary averages per item and drops the employee's own
// self-evaluation, evaluation averaged per role and kept it — so the two
// pages disagreed on identical data (send 116 read 18.00 on one and 62.18
// on the other). This module is that calculation, written once.
//
// Scale: everything here works on the raw 1-5 `selected_option`, never the
// percent-converted `score` column. The 0-100 result is produced at the end
// by sectionScore100().
// =============================================================

/**
 * The rater fields this module needs. The two detail endpoints name the
 * array differently — summary calls it `by_rater`, evaluation results call
 * it `by_evaluator` — but the fields inside are identical, so callers pass
 * whichever array they hold via `ratersOf`.
 */
export interface PmsScoreRater {
    evaluator_role: string;
    selected_option: number | null;
    is_closed: boolean;
}

/** A KPI or competency row. `weight` is its share of its own section (a section's weights sum to 1.00). */
export interface PmsScorableItem {
    weight: number;
}

export interface PmsScoreBreakdownInput<TItem extends PmsScorableItem> {
    kpis: TItem[];
    competencies: TItem[];
    /** Assessment header ratio 0-100, e.g. 70. */
    kpiWeight: number;
    /** Assessment header ratio 0-100, e.g. 30. */
    competencyWeight: number;
    ratersOf: (item: TItem) => PmsScoreRater[];
}

export interface PmsScoreBreakdown {
    /** Section total on the 1-5 scale. */
    kpiSubtotal: number;
    competencySubtotal: number;
    /** Both sections weighted, still on the 1-5 scale — the "ผลการประเมินรวม" figure. */
    weightedTotal: number;
    /** Each section's share of the 100 points, and their sum. */
    kpiScore100: number;
    competencyScore100: number;
    score100: number;
}

export const usePmsScoreBreakdown = () => {
    /**
     * Mean `selected_option` (1-5) for one item across everyone except the
     * employee themselves. Closed rows and "ไม่สามารถประเมินได้" (0) are not
     * counted. Returns null when nobody contributed — callers show '—'.
     */
    const itemAvgExclSelf = (raters: PmsScoreRater[] | null | undefined): number | null => {
        const counted = (raters ?? []).filter(r =>
            r.evaluator_role !== 'self'
            && !r.is_closed
            && r.selected_option !== null
            && r.selected_option !== undefined
            && Number(r.selected_option) !== 0
        );
        if (counted.length === 0) return null;
        const sum = counted.reduce((s, r) => s + Number(r.selected_option), 0);
        return sum / counted.length;
    };

    /** That mean scaled by the item's own weight within its section. */
    const itemEarnedScore = (item: PmsScorableItem, raters: PmsScoreRater[] | null | undefined): number | null => {
        const avg = itemAvgExclSelf(raters);
        if (avg === null) return null;
        return avg * Number(item.weight ?? 0);
    };

    /** Σ of a section's earned scores. Items nobody rated contribute nothing. */
    const sectionSubtotal = <TItem extends PmsScorableItem>(
        items: TItem[] | null | undefined,
        ratersOf: (item: TItem) => PmsScoreRater[],
    ): number =>
        (items ?? []).reduce((s, item) => s + (itemEarnedScore(item, ratersOf(item)) ?? 0), 0);

    /** A section's contribution to the 100-point result: (subtotal ÷ 5) × its header weight. */
    const sectionScore100 = (subtotal: number, headerWeight: number): number =>
        (subtotal / 5) * Number(headerWeight ?? 0);

    /** Every headline number for one send, in one pass. */
    const computeBreakdown = <TItem extends PmsScorableItem>(
        input: PmsScoreBreakdownInput<TItem>,
    ): PmsScoreBreakdown => {
        const kpiSubtotal = sectionSubtotal(input.kpis, input.ratersOf);
        const competencySubtotal = sectionSubtotal(input.competencies, input.ratersOf);
        const kpiWeight = Number(input.kpiWeight ?? 0);
        const competencyWeight = Number(input.competencyWeight ?? 0);

        const kpiScore100 = sectionScore100(kpiSubtotal, kpiWeight);
        const competencyScore100 = sectionScore100(competencySubtotal, competencyWeight);

        return {
            kpiSubtotal,
            competencySubtotal,
            weightedTotal: (kpiSubtotal * kpiWeight) / 100 + (competencySubtotal * competencyWeight) / 100,
            kpiScore100,
            competencyScore100,
            score100: kpiScore100 + competencyScore100,
        };
    };

    return { itemAvgExclSelf, itemEarnedScore, sectionSubtotal, sectionScore100, computeBreakdown };
};
