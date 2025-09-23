import React from 'react';
import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const CategoryEditSuccess = ({visible, type}) => {
  const {t} = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t(type ? type : 'Successfully Add')}
            </Text>
          </View>
          <Image
            source={ICONS.checkIcon}
            style={{
              width: width(15),
              height: width(15),
              marginBottom: width(4),
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: width(6),
    padding: width(4),
    justifyContent: 'center',
    alignItems: 'center',
    height: 238,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width(4),
  },
  title: {
    fontSize: width(4.5),
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
});

export default CategoryEditSuccess;
