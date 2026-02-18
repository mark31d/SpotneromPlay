import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PredictionCardContext, PredictionsContext, UserTeamsContext} from '../App';
import {CloseIcon} from './DrawnBadge';

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

const NAV_ITEMS = [
  {label: 'Home', idx: 0, route: 'MainMenu'},
  {label: 'Sports', idx: 1, route: 'LiveMatches'},
  {label: '', idx: 2, route: null, center: true},
  {label: 'My Predictions', idx: 3, route: 'MyPredictions'},
  {label: 'Account', idx: 4, route: 'Account'},
];

const WAIT_SECONDS = 2.5;

export default function PredictionCardScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [waitingVisible, setWaitingVisible] = useState(false);
  const [resultData, setResultData] = useState(null);
  const {selections, removeSelection, clearSelections} = useContext(PredictionCardContext);
  const {addPrediction} = useContext(PredictionsContext);
  const {userTeams} = useContext(UserTeamsContext);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const submitPrediction = () => {
    if (selections.length === 0) return;
    setWaitingVisible(true);
  };

  useEffect(() => {
    if (!waitingVisible || selections.length === 0) return;
    const picks = [...selections];
    const result = addPrediction(picks, selectedTeam);
    const timer = setTimeout(() => {
      setResultData(result);
      setWaitingVisible(false);
      setResultModalVisible(true);
    }, WAIT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [waitingVisible, selectedTeam]);

  const onResultClose = () => {
    setResultModalVisible(false);
    setResultData(null);
    setSelectedTeam(null);
    clearSelections();
  };

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  const isDisabled = selections.length === 0;

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.headerRow}>
        <Text style={st.title}>Prediction Card</Text>
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
            <Text style={st.emptyTitle}>No picks yet</Text>
            <Text style={st.emptySub}>
              Pick Win, Draw or Lose for matches. No stakes — just test your prediction skills!
            </Text>
            <TouchableOpacity style={st.addMoreBtn} onPress={() => navigation.navigate('LiveMatches')}>
              <Text style={st.addMoreText}>Browse Matches</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={st.hint}>Your picks — no stakes, just for fun</Text>
            {userTeams.length > 0 && (
              <View style={st.teamSelectRow}>
                <Text style={st.teamSelectLabel}>Coach bonus: pick your team</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.teamChips}>
                  <TouchableOpacity
                    style={[st.teamChip, !selectedTeam && st.teamChipSel]}
                    onPress={() => setSelectedTeam(null)}
                    activeOpacity={0.8}>
                    <Text style={[st.teamChipText, !selectedTeam && st.teamChipTextSel]}>None</Text>
                  </TouchableOpacity>
                  {userTeams.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[st.teamChip, selectedTeam === t && st.teamChipSel]}
                      onPress={() => setSelectedTeam(selectedTeam === t ? null : t)}
                      activeOpacity={0.8}>
                      <Text style={[st.teamChipText, selectedTeam === t && st.teamChipTextSel]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={st.teamSelectHint}>+15 coins per correct prediction when your team is selected</Text>
              </View>
            )}
            {selections.map(sel => {
              const [home, away] = (sel.matchLabel || '').split(' vs ');
              const pickDisplay = sel.pickLabel === 'Win' ? (home || 'Home') : sel.pickLabel === 'Lose' ? (away || 'Away') : 'Draw';
              return (
              <View key={sel.id} style={st.selCard}>
                <View style={st.selCardContent}>
                  <Text style={st.selMatch}>{sel.matchLabel}</Text>
                  <Text style={st.selPick}>{pickDisplay}</Text>
                </View>
                <TouchableOpacity style={st.selRemove} onPress={() => removeSelection(sel.id)}>
                  <CloseIcon size={16} />
                </TouchableOpacity>
              </View>
            );})}

            <TouchableOpacity
              style={[st.placeBtn, isDisabled && st.placeBtnDisabled]}
              onPress={submitPrediction}
              disabled={isDisabled}
              activeOpacity={0.8}>
              <Text style={st.placeBtnText}>Submit Prediction</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.addMore} onPress={() => navigation.navigate('LiveMatches')}>
              <Text style={st.addMoreLinkText}>+ Add More Picks</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Waiting Modal */}
      <Modal visible={waitingVisible} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.waitingBox}>
            <ActivityIndicator size="large" color="#CC342D" />
            <Text style={st.waitingTitle}>Waiting for results...</Text>
            <Text style={st.waitingSub}>Matches are being played</Text>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={resultModalVisible} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={[st.resultBox, resultData?.correct && st.resultBoxWin]}>
            <Text style={st.resultTitle}>
              {resultData?.correct ? 'You won!' : 'Not this time'}
            </Text>
            <Text style={st.resultMessage}>{resultData?.message}</Text>
            {resultData?.coinDelta != null && resultData.coinDelta !== 0 && (
              <Text style={[st.coinDelta, resultData.coinDelta > 0 ? st.coinDeltaPlus : st.coinDeltaMinus]}>
                {resultData.coinDelta > 0 ? '+' : ''}{resultData.coinDelta} coins
                {resultData?.coachBonus > 0 && (
                  <Text style={st.coachBonus}> (+{resultData.coachBonus} coach)</Text>
                )}
              </Text>
            )}
            <TouchableOpacity style={st.resultBtn} onPress={onResultClose} activeOpacity={0.8}>
              <Text style={st.resultBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  hint: {color: '#B9B6B6', fontSize: 12, marginBottom: 12},
  selCard: {flexDirection: 'row', backgroundColor: '#1B1A1B', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  selCardContent: {flex: 1},
  selMatch: {color: '#F4F3F3', fontSize: 13, fontWeight: '600', marginBottom: 2},
  selPick: {color: '#CC342D', fontSize: 14, fontWeight: '700'},
  selRemove: {width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(204,52,45,0.15)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center'},
  selRemoveText: {color: '#CC342D', fontSize: 14, fontWeight: '700'},

  placeBtn: {backgroundColor: '#AF1E20', paddingVertical: 15, borderRadius: 14, alignItems: 'center', shadowColor: '#AF1E20', shadowOpacity: 0.4, shadowRadius: 16, elevation: 6, marginBottom: 10, marginTop: 8},
  placeBtnDisabled: {opacity: 0.4},
  placeBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},

  addMore: {alignItems: 'center', paddingVertical: 10},
  addMoreLinkText: {color: '#CC342D', fontSize: 13, fontWeight: '600'},

  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24},
  waitingBox: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#2A2325', minWidth: 260},
  waitingTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginTop: 16},
  waitingSub: {color: '#B9B6B6', fontSize: 13, marginTop: 4},

  resultBox: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#2A2325', minWidth: 280},
  resultBoxWin: {borderColor: '#35D07F'},
  resultTitle: {color: '#F4F3F3', fontSize: 22, fontWeight: '800', marginBottom: 8},
  resultMessage: {color: '#B9B6B6', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 12},
  coinDelta: {fontSize: 16, fontWeight: '700', marginBottom: 16},
  coinDeltaPlus: {color: '#35D07F'},
  coinDeltaMinus: {color: '#CC342D'},
  coachBonus: {color: '#F5C542', fontSize: 14},
  teamSelectRow: {marginBottom: 12},
  teamSelectLabel: {color: '#B9B6B6', fontSize: 11, fontWeight: '600', marginBottom: 6},
  teamChips: {marginBottom: 4},
  teamChip: {backgroundColor: '#1B1A1B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#2A2325'},
  teamChipSel: {borderColor: '#CC342D', backgroundColor: 'rgba(204,52,45,0.2)'},
  teamChipText: {color: '#B9B6B6', fontSize: 13, fontWeight: '600'},
  teamChipTextSel: {color: '#F4F3F3'},
  teamSelectHint: {color: '#666', fontSize: 10, marginTop: 2},
  resultBtn: {backgroundColor: '#CC342D', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12},
  resultBtnText: {color: '#fff', fontSize: 15, fontWeight: '700'},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214'},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
});
