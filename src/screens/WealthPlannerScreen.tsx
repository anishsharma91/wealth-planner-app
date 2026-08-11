import { ScrollView, StyleSheet } from 'react-native';

// 1. Import the hook and components
import { InputControls } from '../components/InputControls';
import { SummaryCards } from '../components/SummaryCards';
import { useWealthPlanner } from '../hooks/useWealthPlanner'; // Adjust path based on your folder structure

export default function WealthPlannerScreen() {
  // 2. Call the hook inside the component
  const { state, actions } = useWealthPlanner();

  return (
    <ScrollView style={styles.container}>
      {/* Input Controls */}
      <InputControls {...state} {...actions} />

      {/* Result Summary Cards with Inflation Badge */}
      <SummaryCards
        result={state.result}
        inflationRate={state.inflationRate}
        formatMoney={actions.formatMoney}
      />

      {/* Chart / Table View or additional content here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
});