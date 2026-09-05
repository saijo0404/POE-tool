use super::category_pricer::{
    price_equipment_list, price_flask_list, price_gem_list, price_jewel_list,
};
use crate::models::ninja::{
    BuildCategories, BuildCategoryTotal, BuildCharacterMeta, BuildCostResult, NinjaBuildData,
    NinjaPricesResult,
};

pub async fn calculate_build_cost(build_data: NinjaBuildData) -> Result<BuildCostResult, String> {
    crate::app_log!(
        "[BuildCalc] 📊 開始計算 Build 成本: 角色='{}', 聯盟='{}', 等級={}, 職業='{}'",
        build_data.character_name,
        build_data.league,
        build_data.level,
        build_data.class_name
    );
    crate::app_log!(
        "[BuildCalc] 📦 角色物品清單: 裝備共 {} 件, 珠寶 {} 顆, 藥劑 {} 瓶, 技能寶石 {} 顆",
        build_data.equipment.len(),
        build_data.jewels.len(),
        build_data.flasks.len(),
        build_data.gems.len()
    );

    let ninja_data = crate::services::ninja::fetch_ninja_prices(&build_data.league, false)
        .await
        .unwrap_or_else(|_| NinjaPricesResult {
            rates: crate::services::ninja::get_accurate_bulk_rates(),
            divine_chaos_rate: 150.0,
            league: build_data.league.clone(),
        });

    let div_rate = ninja_data.divine_chaos_rate;
    let (eq_items, eq_chaos) = price_equipment_list(
        &build_data.equipment,
        &build_data.league,
        &ninja_data.rates,
        div_rate,
    );
    let (jewel_items, jewel_chaos) = price_jewel_list(
        &build_data.jewels,
        &build_data.league,
        &ninja_data.rates,
        div_rate,
    );
    let (flask_items, flask_chaos) = price_flask_list(
        &build_data.flasks,
        &build_data.league,
        &ninja_data.rates,
        div_rate,
    );
    let (gem_items, gem_chaos) = price_gem_list(
        &build_data.gems,
        &build_data.league,
        &ninja_data.rates,
        div_rate,
    );

    let total_chaos = ((eq_chaos + jewel_chaos + flask_chaos + gem_chaos) * 100.0).round() / 100.0;
    let total_divine = (total_chaos / div_rate * 100.0).round() / 100.0;

    crate::app_log!(
        "[BuildCalc] 🎯 造價計算完成: 總計 {} Divine ({} Chaos), 匯率基準: 1 div = {} c",
        total_divine,
        total_chaos,
        div_rate
    );

    Ok(BuildCostResult {
        character: BuildCharacterMeta {
            account: build_data.account,
            name: build_data.character_name,
            league: build_data.league,
            level: build_data.level,
            class: build_data.class_name,
            ascendancy: build_data.ascendancy,
        },
        total_chaos,
        total_divine,
        divine_chaos_rate: div_rate,
        categories: BuildCategories {
            equipment: BuildCategoryTotal {
                items: eq_items,
                total_chaos: (eq_chaos * 100.0).round() / 100.0,
                total_divine: (eq_chaos / div_rate * 100.0).round() / 100.0,
            },
            gems: BuildCategoryTotal {
                items: gem_items,
                total_chaos: (gem_chaos * 100.0).round() / 100.0,
                total_divine: (gem_chaos / div_rate * 100.0).round() / 100.0,
            },
            flasks: BuildCategoryTotal {
                items: flask_items,
                total_chaos: (flask_chaos * 100.0).round() / 100.0,
                total_divine: (flask_chaos / div_rate * 100.0).round() / 100.0,
            },
            jewels: BuildCategoryTotal {
                items: jewel_items,
                total_chaos: (jewel_chaos * 100.0).round() / 100.0,
                total_divine: (jewel_chaos / div_rate * 100.0).round() / 100.0,
            },
        },
    })
}
