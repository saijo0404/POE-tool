import React from 'react';
import type { BeastCraftCategory, BeastCraftRecipe, RecipeCostCalculation } from '../../domain/bestiary/types';
import { BESTIARY_CATEGORIES } from '../../domain/bestiary/bestiaryData';

interface BestiaryRecipeSectionProps {
  categories?: Array<{ id: BeastCraftCategory | 'all'; label: string }>;
  selectedCategory: BeastCraftCategory | 'all';
  onCategoryChange: (c: BeastCraftCategory | 'all') => void;
  keyword: string;
  onKeywordChange: (k: string) => void;
  recipes: BeastCraftRecipe[];
  selectedRecipe: BeastCraftRecipe;
  onSelectRecipe: (r: BeastCraftRecipe) => void;
  primaryCost: number;
  onPrimaryCostChange: (v: number) => void;
  yellowCost: number;
  onYellowCostChange: (v: number) => void;
  outputVal: number;
  onOutputValChange: (v: number) => void;
  calc: RecipeCostCalculation;
  onCopyWhisper: () => void;
}

export const BestiaryRecipeSection: React.FC<BestiaryRecipeSectionProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <CategoryFilterBar
      categories={props.categories ?? BESTIARY_CATEGORIES}
      selectedCategory={props.selectedCategory}
      onCategoryChange={props.onCategoryChange}
      keyword={props.keyword}
      onKeywordChange={props.onKeywordChange}
    />
    <RecipePickList
      recipes={props.recipes}
      selectedRecipeId={props.selectedRecipe.id}
      onSelectRecipe={props.onSelectRecipe}
    />
    <CostInputsRow
      primaryName={props.selectedRecipe.primaryBeastNameZh}
      primaryCost={props.primaryCost}
      onPrimaryCostChange={props.onPrimaryCostChange}
      yellowCost={props.yellowCost}
      onYellowCostChange={props.onYellowCostChange}
      outputVal={props.outputVal}
      onOutputValChange={props.onOutputValChange}
    />
    <CalcSummaryBanner
      calc={props.calc}
      primaryEn={props.selectedRecipe.primaryBeastNameEn}
      onCopyWhisper={props.onCopyWhisper}
    />
  </div>
);

const CategoryFilterBar: React.FC<{
  categories: Array<{ id: BeastCraftCategory | 'all'; label: string }>;
  selectedCategory: BeastCraftCategory | 'all';
  onCategoryChange: (c: BeastCraftCategory | 'all') => void;
  keyword: string;
  onKeywordChange: (k: string) => void;
}> = ({ categories, selectedCategory, onCategoryChange, keyword, onKeywordChange }) => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onCategoryChange(cat.id)}
        style={{
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid #30363d',
          background: selectedCategory === cat.id ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {cat.label}
      </button>
    ))}
    <input
      type="text"
      placeholder="搜尋配方或野獸..."
      value={keyword}
      onChange={(e) => onKeywordChange(e.target.value)}
      style={{
        padding: '3px 8px',
        borderRadius: '4px',
        border: '1px solid #30363d',
        background: '#0d1117',
        color: '#c9d1d9',
        marginLeft: 'auto',
      }}
    />
  </div>
);

const RecipePickList: React.FC<{
  recipes: BeastCraftRecipe[];
  selectedRecipeId: string;
  onSelectRecipe: (r: BeastCraftRecipe) => void;
}> = ({ recipes, selectedRecipeId, onSelectRecipe }) => (
  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
    {recipes.map((r) => (
      <button
        key={r.id}
        onClick={() => onSelectRecipe(r)}
        style={{
          padding: '6px 10px',
          borderRadius: '4px',
          border: r.id === selectedRecipeId ? '1px solid #f0883e' : '1px solid #30363d',
          background: r.id === selectedRecipeId ? '#2d2218' : '#21262d',
          color: r.id === selectedRecipeId ? '#f0883e' : '#8b949e',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {r.nameZh}
      </button>
    ))}
  </div>
);

const CostInputsRow: React.FC<{
  primaryName: string;
  primaryCost: number;
  onPrimaryCostChange: (v: number) => void;
  yellowCost: number;
  onYellowCostChange: (v: number) => void;
  outputVal: number;
  onOutputValChange: (v: number) => void;
}> = (props) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
    <div>
      <label style={{ display: 'block', color: '#8b949e', fontSize: '11px' }}>主紅獸 ({props.primaryName}) (C)</label>
      <input
        type="number"
        value={props.primaryCost}
        onChange={(e) => props.onPrimaryCostChange(Number(e.target.value) || 0)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      />
    </div>
    <div>
      <label style={{ display: 'block', color: '#8b949e', fontSize: '11px' }}>黃野獸單價 (C)</label>
      <input
        type="number"
        value={props.yellowCost}
        onChange={(e) => props.onYellowCostChange(Number(e.target.value) || 0)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      />
    </div>
    <div>
      <label style={{ display: 'block', color: '#8b949e', fontSize: '11px' }}>預估成品市值 (C)</label>
      <input
        type="number"
        value={props.outputVal}
        onChange={(e) => props.onOutputValChange(Number(e.target.value) || 0)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      />
    </div>
  </div>
);

const CalcSummaryBanner: React.FC<{
  calc: RecipeCostCalculation;
  primaryEn: string;
  onCopyWhisper: () => void;
}> = ({ calc, primaryEn, onCopyWhisper }) => (
  <div
    style={{
      padding: '10px',
      background: '#0d1117',
      borderRadius: '6px',
      border: '1px solid #30363d',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div>
      <div>
        總工藝成本: <span style={{ color: '#e3b341' }}>{calc.totalCraftCostChaos} C</span>
        <span style={{ color: '#8b949e', fontSize: '11px', marginLeft: '6px' }}>
          (黃獸3隻: {calc.yellowBeastCostChaos} C)
        </span>
      </div>
      <div>
        預期淨利: <span style={{ color: calc.netProfitChaos >= 0 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
          {calc.netProfitChaos > 0 ? `+${calc.netProfitChaos}` : calc.netProfitChaos} C
        </span>
        <span style={{ marginLeft: '8px', color: '#8b949e' }}>投報率: {calc.profitMarginPercent}%</span>
      </div>
    </div>
    <button
      onClick={onCopyWhisper}
      style={{
        padding: '5px 10px',
        borderRadius: '4px',
        border: '1px solid #238636',
        background: '#238636',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      大宗收 {primaryEn} (x5)
    </button>
  </div>
);
