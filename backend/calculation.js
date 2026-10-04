// Base rates per adult, per month
const HOSPITAL_RATES = {
    None: 0,
    Basic: 90,
    Bronze: 120,
    Silver: 160,
    Gold: 220
};

const EXTRAS_RATES = {
    None: 0,
    Basic: 25,
    Standard: 45,
    Premium: 70
};

const FAMILY_UPGRADE_FEE = 30; // $30/month for Family cover

/**
 * Calculates LHC Loading percentage for an applicant.
 * Rule: Loading applies ONLY to hospital cover.
 */
function calculateApplicantLHC(age, coverHistory, hospitalTier) {
    if (hospitalTier === 'None') {
        return { loadingPct: 0, warning: null };
    }

    if (coverHistory === 'Yes') {
        return { loadingPct: 0, warning: null };
    }

    if (coverHistory === 'Not sure') {
        return {
            loadingPct: 0,
            warning: 'Cover history is unknown — LHC loading has not been applied. This quote may be inaccurate.'
        };
    }

    // Cover history is "No"
    if (age > 30) {
        const loadingPct = (age - 30) * 0.02; // (age - 30) * 2%
        return { loadingPct, warning: null };
    }

    return { loadingPct: 0, warning: null };
}

/**
 * Main Quote Calculation Engine
 */
function calculateQuoteBreakdown(quote) {
    const isCoupleOrFamily = quote.cover_type === 'Couple' || quote.cover_type === 'Family';
    const adultCount = isCoupleOrFamily ? 2 : 1;

    const hospitalBase = HOSPITAL_RATES[quote.hospital_cover] ?? 0;
    const extrasBase = EXTRAS_RATES[quote.extras_cover] ?? 0;

    // Applicant 1 LHC
    const app1LHC = calculateApplicantLHC(
        Number(quote.applicant1_age),
        quote.applicant1_cover_history,
        quote.hospital_cover
    );
    const app1HospitalCost = hospitalBase * (1 + app1LHC.loadingPct);

    // Applicant 2 LHC (if applicable)
    let app2LHC = { loadingPct: 0, warning: null };
    let app2HospitalCost = 0;

    if (isCoupleOrFamily && quote.applicant2_age) {
        app2LHC = calculateApplicantLHC(
            Number(quote.applicant2_age),
            quote.applicant2_cover_history,
            quote.hospital_cover
        );
        app2HospitalCost = hospitalBase * (1 + app2LHC.loadingPct);
    }

    const totalHospitalMonthly = isCoupleOrFamily
        ? app1HospitalCost + app2HospitalCost
        : app1HospitalCost;

    const totalExtrasMonthly = extrasBase * adultCount;
    const familyFeeMonthly = quote.cover_type === 'Family' ? FAMILY_UPGRADE_FEE : 0;

    const totalMonthlyPremium = totalHospitalMonthly + totalExtrasMonthly + familyFeeMonthly;
    const yearlyBeforeDiscount = totalMonthlyPremium * 12;

    const discountRate = quote.payment_frequency === 'Yearly'
        ? (Number(quote.annual_discount) || 0) / 100
        : 0;

    const yearlyAfterDiscount = quote.payment_frequency === 'Yearly'
        ? yearlyBeforeDiscount * (1 - discountRate)
        : yearlyBeforeDiscount;

    // Warnings array
    const warnings = [];
    if (app1LHC.warning) {
        warnings.push(`Applicant 1: ${app1LHC.warning}`);
    }
    if (isCoupleOrFamily && app2LHC.warning) {
        warnings.push(`Applicant 2: ${app2LHC.warning}`);
    }

    return {
        customer_name: quote.customer_name,
        cover_type: quote.cover_type,
        adult_count: adultCount,
        payment_frequency: quote.payment_frequency,
        annual_discount_pct: Number(quote.annual_discount) || 0,
        hospital_tier: quote.hospital_cover,
        hospital_base_rate: hospitalBase,
        app1_lhc_pct: (app1LHC.loadingPct * 100).toFixed(1),
        app1_hospital_cost: Number(app1HospitalCost.toFixed(2)),
        app2_lhc_pct: isCoupleOrFamily ? (app2LHC.loadingPct * 100).toFixed(1) : null,
        app2_hospital_cost: isCoupleOrFamily ? Number(app2HospitalCost.toFixed(2)) : null,
        total_hospital_monthly: Number(totalHospitalMonthly.toFixed(2)),
        extras_tier: quote.extras_cover,
        extras_base_rate: extrasBase,
        total_extras_monthly: Number(totalExtrasMonthly.toFixed(2)),
        family_upgrade_fee: familyFeeMonthly,
        monthly_premium: Number(totalMonthlyPremium.toFixed(2)),
        yearly_before_discount: Number(yearlyBeforeDiscount.toFixed(2)),
        yearly_after_discount: Number(yearlyAfterDiscount.toFixed(2)),
        warnings,
        required_lhc_statement: "Lifetime Health Cover loading applies only to hospital cover. It does not apply to extras cover."
    };
}

module.exports = {
    calculateQuoteBreakdown,
    HOSPITAL_RATES,
    EXTRAS_RATES
};