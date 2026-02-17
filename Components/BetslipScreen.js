import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BetslipContext, BetsContext} from '../App';
import ConfirmModal from './ConfirmModal';

const NAV_SPRITE = {src: require('../assets/nav_icons.png'), cols: 5, rows: 1};

function NavIcon({index, size = 28}) {
  const col = index % NAV_SPRITE.cols;
  return (
    <View style={{width: size, height: size, overflow: 'hidden'}}>
      <Image
        source={NAV_SPRITE.src}
        style={{position: 'absolute', width: NAV_SPRITE.cols * size, height: size, left: -col * size, top: 0}}
        resizeMode="stretch"
      />
    </View>
  );
}

const QUICK_CHIPS = [5, 10, 25];

const NAV_ITEMS = [
  {label: 'Home', idx: 0, route: 'MainMenu'},
  {label: 'Sports', idx: 1, route: 'OddsMarkets'},
  {label: '', idx: 2, route: null, center: true},
  {label: 'My Bets', idx: 3, route: 'MyBets'},
  {label: 'Account', idx: 4, route: 'Account'},
];

export default function BetslipScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const [placedModalVisible, setPlacedModalVisible] = useState(false);
  const {
    selections,
    stake,
    setStake,
    removeSelection,
    clearSelections,
    totalOdds,
    potentialReturn,
  } = useContext(BetslipContext);
  const {addBet, totalPoints} = useContext(BetsContext);

  const placeBet = () => {
    if (selections.length === 0 || stake <= 0) return;
    if (stake > totalPoints) return;
    addBet(selections, stake, totalOdds);
    setPlacedModalVisible(true);
  };

  const onPlacedClose = () => {
    setPlacedModalVisible(false);
    clearSelections();
  };

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  const insufficientBalance = stake > totalPoints;
  const isDisabled = selections.length === 0 || stake <= 0 || insufficientBalance;

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={st.headerRow}>
        <Text style={st.title}>Betslip</Text>
        <View style={st.headerActions}>
          {selections.length > 0 && (
            <TouchableOpacity onPress={clearSelections}>
              <Text style={st.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={st.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {selections.length === 0 ? (
          <View style={st.emptyState}>
            <View style={st.emptyIconWrap}>
              <NavIcon index={2} size={48} />
            </View>
            <Text style={st.emptyTitle}>No selections yet</Text>
            <Text style={st.emptySub}>Tap odds from any match to add picks here.</Text>
            <TouchableOpacity style={st.addMoreBtn} onPress={() => navigation.navigate('LiveMatches')}>
              <Text style={st.addMoreText}>Browse Matches</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Selection Cards */}
            {selections.map(sel => (
              <View key={sel.id} style={st.selCard}>
                <View style={st.selCardContent}>
                  <Text style={st.selMatch}>{sel.matchLabel}</Text>
                  <Text style={st.selMarket}>{sel.market}</Text>
                  <View style={st.selPickRow}>
                    <Text style={st.selPick}>{sel.pickLabel}</Text>
                    <Text style={st.selOdd}>@ {sel.oddValue.toFixed(2)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={st.selRemove} onPress={() => removeSelection(sel.id)}>
                  <Text style={st.selRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Stake Input */}
            <View style={st.stakeCard}>
              <Text style={st.stakeLabel}>Stake (points)</Text>
              <Text style={st.balanceHint}>Balance: {totalPoints.toLocaleString()} pts</Text>
              <View style={st.stakeInputRow}>
                <Text style={st.stakePrefix}>pts</Text>
                <TextInput
                  style={st.stakeInput}
                  keyboardType="numeric"
                  value={stake > 0 ? String(stake) : ''}
                  onChangeText={t => {
                    const v = parseFloat(t) || 0;
                    setStake(v);
                  }}
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={st.quickChips}>
                {QUICK_CHIPS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={st.qChip}
                    onPress={() => setStake(prev => prev + c)}>
                    <Text style={st.qChipText}>+{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            <View style={st.summaryCard}>
              <View style={st.summaryRow}>
                <Text style={st.summaryLabel}>Selections</Text>
                <Text style={st.summaryVal}>{selections.length}</Text>
              </View>
              <View style={st.summaryRow}>
                <Text style={st.summaryLabel}>Stake</Text>
                <Text style={st.summaryVal}>{stake} pts</Text>
              </View>
              <View style={st.summaryRow}>
                <Text style={st.summaryLabel}>Total Odds</Text>
                <Text style={st.summaryVal}>{totalOdds.toFixed(2)}</Text>
              </View>
              <View style={[st.summaryRow, st.summaryRowLast]}>
                <Text style={st.returnLabel}>Potential Return</Text>
                <Text style={st.returnVal}>{potentialReturn} pts</Text>
              </View>
            </View>

            {/* Place Bet */}
            {insufficientBalance && (
              <Text style={st.insufficientText}>Insufficient balance</Text>
            )}
            <TouchableOpacity
              style={[st.placeBtn, isDisabled && st.placeBtnDisabled]}
              onPress={placeBet}
              disabled={isDisabled}
              activeOpacity={0.8}>
              <Text style={st.placeBtnText}>Place Bet</Text>
            </TouchableOpacity>

            {/* Add More */}
            <TouchableOpacity style={st.addMore} onPress={() => navigation.navigate('LiveMatches')}>
              <Text style={st.addMoreLinkText}>+ Add More Selections</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        visible={placedModalVisible}
        title="Bet Placed"
        message={`Stake: ${stake} pts\nTotal Odds: ${totalOdds.toFixed(2)}\nPotential Return: ${potentialReturn} pts`}
        onClose={onPlacedClose}
      />

      {/* Bottom Nav */}
      <View style={[st.bottomNav, {paddingBottom: insets.bottom || 16}]}>
        {NAV_ITEMS.map((n, i) =>
          n.center ? (
            <TouchableOpacity key={i} style={st.navCenter} onPress={() => onNav(n)}>
              <NavIcon index={2} size={28} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity key={i} style={st.navItem} onPress={() => onNav(n)}>
              <NavIcon index={n.idx} size={28} />
              <Text style={[st.navLabel, n.label === '' && {display: 'none'}]}>{n.label}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 8},
  title: {fontSize: 20, fontWeight: '800', color: '#F4F3F3'},
  headerActions: {flexDirection: 'row', gap: 16},
  clearText: {color: '#CC342D', fontSize: 14, fontWeight: '600'},
  closeText: {color: '#B9B6B6', fontSize: 14, fontWeight: '500'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 20},

  emptyState: {alignItems: 'center', justifyContent: 'center', paddingTop: 80},
  emptyIconWrap: {marginBottom: 16},
  emptyTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 6},
  emptySub: {color: '#B9B6B6', fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 24},
  addMoreBtn: {backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12},
  addMoreText: {color: '#CC342D', fontSize: 14, fontWeight: '600'},

  selCard: {flexDirection: 'row', backgroundColor: '#1B1A1B', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#2A2325', marginBottom: 8},
  selCardContent: {flex: 1},
  selMatch: {color: '#F4F3F3', fontSize: 13, fontWeight: '600', marginBottom: 2},
  selMarket: {color: '#B9B6B6', fontSize: 11, marginBottom: 4},
  selPickRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  selPick: {color: '#CC342D', fontSize: 14, fontWeight: '700'},
  selOdd: {color: '#F4F3F3', fontSize: 14, fontWeight: '700'},
  selRemove: {width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(204,52,45,0.15)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center'},
  selRemoveText: {color: '#CC342D', fontSize: 14, fontWeight: '700'},

  stakeCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2A2325', marginBottom: 8},
  stakeLabel: {color: '#B9B6B6', fontSize: 12, fontWeight: '600', marginBottom: 4},
  balanceHint: {color: '#35D07F', fontSize: 11, fontWeight: '600', marginBottom: 8},
  insufficientText: {color: '#CC342D', fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center'},
  stakeInputRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#222022', borderRadius: 10, borderWidth: 1, borderColor: '#2A2325', paddingHorizontal: 12},
  stakePrefix: {color: '#B9B6B6', fontSize: 14, fontWeight: '600', marginRight: 4},
  stakeInput: {flex: 1, color: '#F4F3F3', fontSize: 20, fontWeight: '700', paddingVertical: 10},
  quickChips: {flexDirection: 'row', gap: 8, marginTop: 10},
  qChip: {paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#222022', borderWidth: 1, borderColor: '#2A2325'},
  qChipText: {color: '#F4F3F3', fontSize: 13, fontWeight: '600'},

  summaryCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2A2325', marginBottom: 12},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#2A2325'},
  summaryRowLast: {borderBottomWidth: 0, paddingTop: 10},
  summaryLabel: {color: '#B9B6B6', fontSize: 13},
  summaryVal: {color: '#F4F3F3', fontSize: 13, fontWeight: '600'},
  returnLabel: {color: '#F4F3F3', fontSize: 14, fontWeight: '700'},
  returnVal: {color: '#35D07F', fontSize: 16, fontWeight: '800'},

  placeBtn: {backgroundColor: '#AF1E20', paddingVertical: 15, borderRadius: 14, alignItems: 'center', shadowColor: '#AF1E20', shadowOpacity: 0.4, shadowRadius: 16, elevation: 6, marginBottom: 10},
  placeBtnDisabled: {opacity: 0.4},
  placeBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},

  addMore: {alignItems: 'center', paddingVertical: 10},
  addMoreLinkText: {color: '#CC342D', fontSize: 13, fontWeight: '600'},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214'},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
});
