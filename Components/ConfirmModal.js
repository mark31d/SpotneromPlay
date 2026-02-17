import React from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';

export default function ConfirmModal({visible, title, message, onClose, onConfirm, buttonText = 'OK'}) {
  const handleBtn = () => (onConfirm ? onConfirm() : onClose());
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={s.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={s.box} onStartShouldSetResponder={() => true}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          <TouchableOpacity style={s.btn} onPress={handleBtn} activeOpacity={0.8}>
            <Text style={s.btnText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#1B1A1B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#2A2325',
  },
  title: {color: '#F4F3F3', fontSize: 18, fontWeight: '800', marginBottom: 12, textAlign: 'center'},
  message: {color: '#B9B6B6', fontSize: 14, lineHeight: 22, marginBottom: 20, textAlign: 'center'},
  btn: {backgroundColor: '#CC342D', paddingVertical: 12, borderRadius: 12, alignItems: 'center'},
  btnText: {color: '#fff', fontSize: 15, fontWeight: '700'},
});
