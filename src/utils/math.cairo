// Mathematical utilities for DeFi calculations

fn calculate_compound_interest(principal: u256, rate: u256, time: u256, compounds_per_period: u256) -> u256 {
    // Compound interest formula: A = P(1 + r/n)^(nt)
    // Simplified for blockchain computation
    let base = 1000000 + (rate / compounds_per_period); // Using 6 decimal precision
    let mut result = principal;
    let mut i = 0;
    
    while i < time * compounds_per_period {
        result = (result * base) / 1000000;
        i += 1;
    };
    
    result
}

fn calculate_apy_from_apr(apr: u256, compounds_per_year: u256) -> u256 {
    // APY = (1 + APR/n)^n - 1
    calculate_compound_interest(1000000, apr, 1, compounds_per_year) - 1000000
}

fn weighted_average(values: Span<u256>, weights: Span<u256>) -> u256 {
    assert(values.len() == weights.len(), 'Arrays length mismatch');
    
    let mut sum_weighted = 0;
    let mut sum_weights = 0;
    let mut i = 0;
    
    while i < values.len() {
        sum_weighted += (*values.at(i)) * (*weights.at(i));
        sum_weights += *weights.at(i);
        i += 1;
    };
    
    if sum_weights == 0 {
        0
    } else {
        sum_weighted / sum_weights
    }
}

fn calculate_slippage(amount_in: u256, amount_out: u256, expected_rate: u256) -> u256 {
    // Returns slippage as basis points (1% = 100 bp)
    let expected_out = (amount_in * expected_rate) / 1000000; // Assuming 6 decimal rate
    
    if expected_out <= amount_out {
        0 // No slippage or positive slippage
    } else {
        let slippage = expected_out - amount_out;
        (slippage * 10000) / expected_out // Convert to basis points
    }
}