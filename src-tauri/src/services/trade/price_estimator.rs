use crate::models::trade::EstimatedPriceSummary;

pub struct PriceMetrics {
    pub min_chaos: f64,
    pub min_divine: f64,
    pub median_chaos: f64,
    pub median_divine: f64,
    pub summary: Option<EstimatedPriceSummary>,
}

pub fn calculate_price_metrics(mut chaos_prices: Vec<f64>, div_rate: f64) -> PriceMetrics {
    if chaos_prices.is_empty() {
        return PriceMetrics {
            min_chaos: 0.0,
            min_divine: 0.0,
            median_chaos: 0.0,
            median_divine: 0.0,
            summary: None,
        };
    }

    chaos_prices.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let min_chaos = chaos_prices.first().copied().unwrap_or(0.0);
    let max_chaos = chaos_prices.last().copied().unwrap_or(0.0);
    let median_chaos = chaos_prices[chaos_prices.len() / 2];

    let effective_div_rate = if div_rate > 0.0 { div_rate } else { 150.0 };
    let min_divine = (min_chaos / effective_div_rate * 100.0).round() / 100.0;
    let median_divine = (median_chaos / effective_div_rate * 100.0).round() / 100.0;

    PriceMetrics {
        min_chaos,
        min_divine,
        median_chaos,
        median_divine,
        summary: Some(EstimatedPriceSummary {
            min: min_chaos,
            median: median_chaos,
            max: max_chaos,
        }),
    }
}
