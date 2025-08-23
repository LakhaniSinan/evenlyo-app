import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {height, width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {COLORS, fontFamly} from '../../constants';

let propsData = {};
const CustomPicker = React.forwardRef(
  (
    {
      marginVertical,
      labelll,
      value,
      label,
      listData,
      handleSelectValue,
      name,
      type,
      handleOpenModal,
      hideEndIcon,
    },
    ref,
  ) => {
    const [isVisible, setModalVisibility] = useState(false);

    React.useImperativeHandle(ref, () => ({
      show(params) {
        propsData = params;
        setModalVisibility(true);
      },
      hide() {
        setModalVisibility(false);
      },
    }));

    const renderLabel = () => {
      if (value) {
        const selectedItem = listData?.find(item => item?.name === value);
        return selectedItem ? selectedItem?.name : labelll;
      }
      return labelll;
    };

    return (
      <>
        <Text
          style={{
            color: COLORS.textDark,
            fontFamily: fontFamly.PlusJakartaSansBold,
            fontSize: 12,
            marginVertical: width(3),
          }}>
          {label}
        </Text>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            if (handleOpenModal && typeof handleOpenModal === 'function') {
              handleOpenModal(propsData);
            } else {
              setModalVisibility(true);
            }
          }}
          style={[styles.dropdown, {marginVertical: marginVertical || 0}]}>
          <Text
            style={[
              styles.dropdownText,
              {color: value ? COLORS.textDark : COLORS.textLight},
            ]}>
            {renderLabel()}
          </Text>
          {!hideEndIcon && (
            <MaterialIcons
              name={isVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color={COLORS.textDark}
            />
          )}
        </TouchableOpacity>

        <Modal
          isVisible={isVisible}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          backdropOpacity={0.5}
          useNativeDriver={true}
          hideModalContentWhileAnimating={true}
          onBackdropPress={() => {
            if (ref?.current) {
              ref.current.hide();
            } else {
              setModalVisibility(false);
            }
          }}
          style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {type == 'start'
                  ? 'Select Start Time'
                  : type == 'end'
                  ? 'Select End Time'
                  : labelll}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (ref?.current) {
                    ref.current.hide();
                  } else {
                    setModalVisibility(false);
                  }
                }}>
                <MaterialIcons name="close" size={25} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={listData}
              renderItem={({item}) => {
                const isSelected = value === item.name;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (ref?.current) {
                        ref.current.hide();
                      } else {
                        setModalVisibility(false);
                      }
                      if (
                        handleSelectValue &&
                        typeof handleSelectValue === 'function'
                      ) {
                        handleSelectValue(name, item);
                      }
                    }}
                    style={styles.optionContainer}>
                    {isSelected ? (
                      <LinearGradient
                        colors={['#FF295D', '#E31B95', '#C817AE']}
                        start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}
                        style={styles.option}>
                        <Text
                          style={[styles.optionText, {color: '#FFF'}]}
                          numberOfLines={1}>
                          {item.name ? item.name : item.label}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.option,
                          {backgroundColor: COLORS.white},
                        ]}>
                        <Text
                          style={[styles.optionText, {color: COLORS.black}]}
                          numberOfLines={1}>
                          {item.name ? item.name : item.label}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No Data Found!</Text>
                </View>
              }
            />
          </View>
        </Modal>
      </>
    );
  },
);

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingVertical: width(3.5),
    paddingHorizontal: width(5),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  dropdownText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 14,
  },
  modal: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  modalContent: {
    maxHeight: height(60),
    minHeight: height(20),
    width: width(92),
    backgroundColor: 'white',
    borderRadius: width(2),
    paddingVertical: width(4),
  },
  modalHeader: {
    marginHorizontal: width(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width(4),
  },
  modalTitle: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 17,
  },
  optionContainer: {
    marginHorizontal: width(3),
    borderRadius: 100,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: width(4),
    paddingHorizontal: width(5),
    borderRadius: 100,
  },
  optionText: {
    fontWeight: '500',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: COLORS.black,
    fontWeight: '600',
    fontSize: 17,
  },
});

export default CustomPicker;
