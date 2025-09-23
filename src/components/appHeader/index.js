import React, {useCallback, useMemo, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Menu} from 'react-native-paper';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const AppHeader = ({
  isMenu,
  leftIcon,
  rightIcon,
  menuContent,
  headingText,
  onLeftIconPress,
  onRightIconPress,
  chatHeaderData,
  isShowMenuIcon,
  setCommentType,
  commentType,
}) => {
  const {t} = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [showCommentMenu] = useState(true);

  const handleCloseMenu = useCallback(type => {
    console.log(type, 'typetypetypetype');

    setOpenMenu(false);
    setCommentType(type);
  }, []);

  const renderMenuItems = useCallback(
    () => (
      <>
        {menuContent.map((item, index) => {
          return (
            <Menu.Item
              titleStyle={{
                color: COLORS.textDark,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
                fontSize: 12,
              }}
              leadingIcon={() =>
                isShowMenuIcon ? (
                  <View
                    style={{
                      height: width(8),
                      width: width(8),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={item?.icon}
                      style={{
                        width: 15,
                        height: 15,
                        resizeMode: 'contain',
                      }}
                    />
                  </View>
                ) : null
              }
              style={{
                height: 35,
                marginBottom: 6,
                justifyContent: 'center',
              }}
              onPress={() => handleCloseMenu(item?.title)}
              title={item?.title}
            />
          );
        })}
      </>
    ),
    [handleCloseMenu],
  );

  const handleOpenMenu = useCallback(() => {
    setOpenMenu(true);
  }, []);

  return (
    <View
      style={
        {
          // paddingTop: width(10),
        }
      }>
      <View
        style={{
          backgroundColor: COLORS.backgroundLight,
          height: 73,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}>
        {leftIcon && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: width(3),
              top: width(4),
              zIndex: 999,
            }}
            onPress={() => onLeftIconPress()}>
            <Image
              resizeMode="contain"
              style={{width: 40, height: 40}}
              source={leftIcon}
            />
          </TouchableOpacity>
        )}
        <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
          <Text style={{fontFamily: fontFamly.PlusJakartaSansBold}}>
            {headingText}
          </Text>
        </View>
        {!isMenu && rightIcon && (
          <TouchableOpacity
            style={{position: 'absolute', right: width(3), top: width(4)}}
            onPress={() => onRightIconPress()}>
            <Image
              resizeMode="contain"
              style={{width: 40, height: 40}}
              source={rightIcon}
            />
          </TouchableOpacity>
        )}
        {isMenu && (
          <TouchableOpacity
            style={{position: 'absolute', right: width(3), top: width(4)}}
            onPress={() => handleOpenMenu()}>
            <Menu
              visible={openMenu}
              onDismiss={() => handleCloseMenu('public')}
              anchorPosition="bottom"
              contentStyle={styles.menu}
              elevation={5}
              statusBarHeight={-width(22)}
              anchor={useMemo(
                () => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{}}
                    onPress={handleOpenMenu}>
                    <Image
                      resizeMode="contain"
                      style={{width: 40, height: 40}}
                      source={rightIcon}
                    />
                  </TouchableOpacity>
                ),
                [showCommentMenu, commentType, openMenu, handleOpenMenu],
              )}>
              {renderMenuItems()}
            </Menu>
          </TouchableOpacity>
        )}
        {chatHeaderData && (
          <View
            style={{
              position: 'absolute',
              left: width(15),
              top: width(2),
              zIndex: 99,
              overflow: 'hidden',
              flexDirection: 'row',
              alignItems: 'center',
              width: '70%',
            }}>
            <Image
              resizeMode="cover"
              style={{
                width: 50,
                height: 50,
                borderRadius: 100,
                overflow: 'hidden',
              }}
              source={chatHeaderData.Icon}
            />
            <View style={{flex: 1, padding: 10}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 12,
                }}>
                {chatHeaderData.name}
              </Text>

              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                {chatHeaderData.lastSeen}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  menu: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: COLORS.border,
    top: width(32),
    right: width(9),
    borderWidth: 1,
  },
  menuItemTitle: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  menuItem: {
    height: 25,
    marginVertical: 6,
  },
  anchorButton: {
    borderLeftWidth: 1,
    paddingLeft: width(2),
    borderLeftColor: COLORS.textLight,
    marginRight: width(2),
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 5,
  },
  anchorText: {
    color: COLORS.textLight,
    textTransform: 'capitalize',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});
