import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { BreakdownTable } from '../components/BreakdownTable';
import { CurrencyModal } from '../components/CurrencyModal';
import { GrowthChart } from '../components/GrowthChart';
import { HeaderBar } from '../components/HeaderBar';
import { InputControls } from '../components/InputControls';
import { ModeSelector } from '../components/ModeSelector';
import { PresetChips } from '../components/PresetChips';
import { ResultsCard } from '../components/ResultsCard';
import { SWPBanner } from '../components/SWPBanner';
import { VisualizerTab } from '../components/VisualizerTab';
import { useWealthPlanner } from '../hooks/useWealthPlanner';

export default function HomeScreen() {
const { state, actions } = useWealthPlanner();

return (
<SafeAreaView style={styles.container}>
<HeaderBar
currency={state.currency}
onOpenCurrencyModal={() => actions.setShowCurrencyModal(true)}
onExportPDF={actions.handleExportPDF}
/>

<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
<SWPBanner />
<ModeSelector mode={state.mode} onSelectMode={actions.setMode} />
<PresetChips onApplyPreset={actions.applyPreset} />

<ResultsCard
mode={state.mode}
targetCorpus={state.targetCorpus}
requiredSIP={state.requiredSIP}
years={state.years}
inflationRate={state.inflationRate}
result={state.result}
monthlyPassiveIncome={state.monthlyPassiveIncome}
formatMoney={actions.formatMoney}
/>

<VisualizerTab activeTab={state.activeTab} onSelectTab={actions.setActiveTab} />

{state.activeTab === 'chart' ? (
<GrowthChart yearlyBreakdown={state.result.yearlyBreakdown} />
) : (
<BreakdownTable breakdown={state.result.yearlyBreakdown} formatMoney={actions.formatMoney} />
)}

<InputControls
mode={state.mode}
currency={state.currency}
activeSymbol={state.activeSymbol}
targetCorpus={state.targetCorpus} setTargetCorpus={actions.setTargetCorpus}
monthlySIP={state.monthlySIP} setMonthlySIP={actions.setMonthlySIP}
initialLumpsum={state.initialLumpsum} setInitialLumpsum={actions.setInitialLumpsum}
stepUp={state.stepUp} setStepUp={actions.setStepUp}
returnRate={state.returnRate} setReturnRate={actions.setReturnRate}
years={state.years} setYears={actions.setYears}
topUpAmount={state.topUpAmount} setTopUpAmount={actions.setTopUpAmount}
topUpYear={state.topUpYear} setTopUpYear={actions.setTopUpYear}
topUpMode={state.topUpMode} setTopUpMode={actions.setTopUpMode}
inflationRate={state.inflationRate} setInflationRate={actions.setInflationRate}
/>
</ScrollView>

<CurrencyModal
visible={state.showCurrencyModal}
selectedCurrency={state.currency}
onSelectCurrency={actions.setCurrency}
onClose={() => actions.setShowCurrencyModal(false)}
/>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#F8FAFC' },
scrollContent: { padding: 16 },
});