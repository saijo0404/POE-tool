use std::collections::HashMap;

pub fn mock_rates() -> HashMap<String, f64> {
    let mut rates = HashMap::new();
    rates.insert("Divine Orb".to_string(), 150.0);
    rates.insert("Chaos Orb".to_string(), 1.0);
    rates.insert("Ambush Scarab".to_string(), 12.0);
    rates.insert("Deafening Essence of Rage".to_string(), 4.0);
    rates.insert("The Doctor".to_string(), 1200.0);
    rates.insert("Dunes Map".to_string(), 5.0);
    rates.insert("Filled Blood Vessel".to_string(), 8.0);
    rates.insert("Headhunter".to_string(), 7500.0);
    rates.insert("Leather Belt".to_string(), 0.5);
    rates
}

mod currency_tests;
mod gear_tests;
