import { useState, useMemo } from 'react';
import type { BeastCraftCategory, BeastCraftRecipe, MissionTier } from '../domain/bestiary/types';
import { BESTIARY_RECIPES, DEFAULT_YELLOW_BEAST_PRICE } from '../domain/bestiary/bestiaryData';
import {
  calculateRecipeCost,
  filterRecipes,
  estimateMissionEv,
  formatBeastBulkWhisper,
} from '../domain/bestiary/beastcraftingEngine';

interface UseBestiaryCraftOptions {
  league?: string;
  onCopyWhisper?: (text: string) => void;
}

export function useBestiaryCraft({ league = 'Settlers', onCopyWhisper }: UseBestiaryCraftOptions = {}) {
  const [activeTab, setActiveTab] = useState<'craft' | 'mission'>('craft');
  const [selectedCategory, setSelectedCategory] = useState<BeastCraftCategory | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(BESTIARY_RECIPES[0].id);

  const [primaryCostInput, setPrimaryCostInput] = useState<number>(280);
  const [yellowCostInput, setYellowCostInput] = useState<number>(DEFAULT_YELLOW_BEAST_PRICE);
  const [customOutputInput, setCustomOutputInput] = useState<number>(420);

  const [missionTier, setMissionTier] = useState<MissionTier>('red');
  const [missionCost, setMissionCost] = useState<number>(15);

  const filteredRecipes = useMemo(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    return filterRecipes(BESTIARY_RECIPES, cat, keyword);
  }, [selectedCategory, keyword]);

  const selectedRecipe = useMemo(() => {
    return BESTIARY_RECIPES.find((r) => r.id === selectedRecipeId) ?? BESTIARY_RECIPES[0];
  }, [selectedRecipeId]);

  const costCalc = useMemo(() => {
    return calculateRecipeCost(selectedRecipe, primaryCostInput, yellowCostInput, customOutputInput);
  }, [selectedRecipe, primaryCostInput, yellowCostInput, customOutputInput]);

  const missionEv = useMemo(() => {
    return estimateMissionEv(missionTier, missionCost);
  }, [missionTier, missionCost]);

  const handleSelectRecipe = (r: BeastCraftRecipe) => {
    setSelectedRecipeId(r.id);
    setCustomOutputInput(r.defaultEstimatedOutputChaos);
  };

  const handleCopy = () => {
    const text = formatBeastBulkWhisper(selectedRecipe.primaryBeastNameEn, 5, primaryCostInput, league);
    if (onCopyWhisper) onCopyWhisper(text);
    else navigator.clipboard?.writeText(text);
  };

  return {
    activeTab,
    setActiveTab,
    recipeProps: {
      selectedCategory,
      onCategoryChange: setSelectedCategory,
      keyword,
      onKeywordChange: setKeyword,
      recipes: filteredRecipes,
      selectedRecipe,
      onSelectRecipe: handleSelectRecipe,
      primaryCost: primaryCostInput,
      onPrimaryCostChange: setPrimaryCostInput,
      yellowCost: yellowCostInput,
      onYellowCostChange: setYellowCostInput,
      outputVal: customOutputInput,
      onOutputValChange: setCustomOutputInput,
      calc: costCalc,
      onCopyWhisper: handleCopy,
    },
    missionProps: {
      missionTier,
      onTierChange: setMissionTier,
      missionCost,
      onCostChange: setMissionCost,
      missionEv,
    },
  };
}
