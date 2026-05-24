import { StyleSheet } from 'react-native';

export function getStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 22, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.card,
    },
    headerLeft: { flex: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    titleDate: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    titleDay: { fontSize: 11, color: C.textDim, marginTop: 2 },
    titleInput: {
      fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3,
      padding: 0, paddingBottom: 2, margin: 0,
      borderBottomWidth: 1.5, borderBottomColor: C.accent,
    },

    langBtn: {
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
      backgroundColor: C.cardHigh, borderWidth: 1, borderColor: C.border,
      alignItems: 'center', justifyContent: 'center',
    },
    langBtnText: { fontSize: 11, fontWeight: '800', color: C.textMuted, letterSpacing: 0.8 },

    themeBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: C.cardHigh, borderWidth: 1, borderColor: C.border,
      alignItems: 'center', justifyContent: 'center',
    },
    themeBtnIcon: {
      width: 16, height: 16, borderRadius: 8, overflow: 'hidden',
      borderWidth: 1.5, borderColor: C.textMuted,
    },
    themeBtnHalf: { position: 'absolute', top: 0, left: 0, width: 8, height: 16, backgroundColor: C.textMuted },

    recBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: C.accentRedFaint, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 5,
      borderWidth: 1, borderColor: C.accentRedBorder,
    },
    recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accentRed },
    recTime: { fontSize: 12, fontWeight: '700', color: C.accentRed, letterSpacing: 1 },

    statsBar: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 22, paddingVertical: 8,
      borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.card,
    },
    statsText: { fontSize: 12, color: C.textMuted },
    statsSep: { fontSize: 12, color: C.textDim, marginHorizontal: 8 },

    errorBar: {
      backgroundColor: C.accentRedFaint, paddingHorizontal: 22, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: C.accentRedBorder,
    },
    errorText: { fontSize: 13, color: C.accentRed },

    scroll: { flex: 1, backgroundColor: C.bg },
    scrollContent: { padding: 18, gap: 10, paddingBottom: 28 },

    emptyState: { flex: 1, alignItems: 'center', paddingTop: 88, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 40, fontWeight: '900', color: C.text, letterSpacing: -1.5, marginBottom: 12 },
    emptyHint: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 },
    emptyServer: {
      marginTop: 36, backgroundColor: C.cardHigh, borderRadius: 14,
      paddingVertical: 12, paddingHorizontal: 20,
      borderWidth: 1, borderColor: C.border, alignItems: 'center', width: '100%',
    },
    emptyLabel: { fontSize: 10, color: C.textDim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
    emptyValue: { fontSize: 13, color: C.accent, fontWeight: '600' },

    bubble: {
      flexDirection: 'row', backgroundColor: C.card,
      borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
      elevation: 2, shadowColor: C.shadow,
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
    },
    bubbleAccent: { width: 3, backgroundColor: C.accent },
    bubbleBody: { flex: 1, padding: 14 },
    bubbleHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    bubbleHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bubbleNum: { fontSize: 11, fontWeight: '700', color: C.accent, letterSpacing: 0.5 },
    bubbleSpeaker: { fontSize: 11, fontWeight: '600', color: C.accent },
    bubbleTime: { fontSize: 11, color: C.textDim },
    bubbleText: { fontSize: 16, color: C.text, lineHeight: 26 },
    bubbleCopied: { borderColor: C.accent },

    loadingAccent: { width: 3, backgroundColor: C.borderMid },
    loadingDots: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 20 },
    loadingDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.accent },

    bottomBar: {
      backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border,
      paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, gap: 10,
    },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionBtn: {
      flex: 1, paddingVertical: 10, borderRadius: 12,
      backgroundColor: C.cardHigh, borderWidth: 1, borderColor: C.border, alignItems: 'center',
    },
    actionBtnDanger: { borderColor: C.accentRedBorder },
    actionBtnText: { fontSize: 12, fontWeight: '700', color: C.textMuted, letterSpacing: 1 },
    actionBtnDangerText: { color: C.accentRed },
    btnDisabled: { opacity: 0.25 },

    recordBtn: {
      borderRadius: 16, backgroundColor: C.accentDeep,
      paddingVertical: 17, alignItems: 'center',
      elevation: 8, shadowColor: C.accentDeep,
      shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 12,
    },
    recordBtnActive: { backgroundColor: '#9F1239', shadowColor: '#9F1239' },
    recordBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    recCircle: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
    stopSquare: { width: 11, height: 11, borderRadius: 3, backgroundColor: '#fff' },
    recordBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center', alignItems: 'center', padding: 28,
    },
    modalCard: {
      width: '100%', backgroundColor: C.card, borderRadius: 20,
      padding: 24, borderWidth: 1, borderColor: C.border,
    },
    modalTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },
    modalInput: {
      backgroundColor: C.cardHigh, borderRadius: 10, borderWidth: 1, borderColor: C.borderMid,
      paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
      color: C.text, fontFamily: 'monospace', marginBottom: 20,
    },
    modalActions: { flexDirection: 'row', gap: 10 },
    modalBtn: {
      flex: 1, paddingVertical: 11, borderRadius: 12,
      backgroundColor: C.cardHigh, borderWidth: 1, borderColor: C.border, alignItems: 'center',
    },
    modalBtnPrimary: { backgroundColor: C.accentDeep, borderColor: C.accentDeep },
    modalBtnText: { fontSize: 14, fontWeight: '700', color: C.textMuted },
    modalBtnPrimaryText: { color: '#fff' },
  });
}
