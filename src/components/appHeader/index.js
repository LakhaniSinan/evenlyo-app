import React, {useCallback, useMemo, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Menu} from 'react-native-paper';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import {useSelector} from 'react-redux';

const AppHeader = ({
  isMenu,
  leftIcon,
  rightIcon,
  filterIcon,
  menuContent,
  headingText,
  onLeftIconPress,
  onRightIconPress,
  onFilterPress,
  chatHeaderData,
  isShowMenuIcon,
  setCommentType,
  commentType,
  onNotificationsPress,
  onVendorNotificationsPress,
  vendorNotificationsIcon,
  notificationsIcon,
  handleSelectOption,
  /** When set, overrides default header bar color (e.g. white for Role Management). */
  backgroundColor,
}) => {
  const {t} = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [showCommentMenu] = useState(true);

  const handleCloseMenu = type => {
    setOpenMenu(false);
    setCommentType(type);
    handleSelectOption(type);
  };

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

  const {unreadCount} = useSelector(state => state.notification);
  const {vendorUnreadCount} = useSelector(state => state.vendorNotifications);
  console.log(
    vendorUnreadCount,
    'vendorUnreadCountvendorUnreadCountvendorUnreadCount',
  );

  return (
    <View
      style={{
        backgroundColor: backgroundColor ?? COLORS.backgroundLight,
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
        <Text
          style={{
            color: COLORS.textDark,
            fontFamily: fontFamly.PlusJakartaSansBold,
          }}>
          {typeof headingText === 'string' ? t(headingText) : headingText}
        </Text>
      </View>
      {!isMenu &&
        (filterIcon ||
          rightIcon ||
          vendorNotificationsIcon ||
          notificationsIcon) && (
          <View
            style={{
              position: 'absolute',
              right: width(3),
              top: width(4),
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {notificationsIcon && (
              <TouchableOpacity
                style={{marginRight: rightIcon ? 10 : 0}}
                onPress={onNotificationsPress}>
                <Image
                  source={ICONS.notificationIcon}
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {vendorNotificationsIcon && (
              <TouchableOpacity
                style={{marginRight: rightIcon ? 10 : 0}}
                onPress={onVendorNotificationsPress}>
                <Image
                  source={ICONS.notificationIcon}
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                />
                {vendorUnreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {vendorUnreadCount > 99 ? '99+' : vendorUnreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {filterIcon && (
              <TouchableOpacity
                onPress={onFilterPress}
                style={{marginLeft: vendorNotificationsIcon ? 10 : 0}}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={filterIcon}
                />
              </TouchableOpacity>
            )}
            {rightIcon && (
              <TouchableOpacity onPress={() => onRightIconPress()}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={rightIcon}
                />
              </TouchableOpacity>
            )}
          </View>
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
            resizeMode="contain"
            style={{
              width: 50,
              height: 50,
              borderRadius: 100,
              overflow: 'hidden',
            }}
            source={(() => {
              const raw = chatHeaderData?.Icon;
              if (
                raw == null ||
                raw === '' ||
                (typeof raw === 'string' && !String(raw).trim())
              ) {
                return ICONS.userIcon;
              }
              if (typeof raw === 'number') {
                return raw;
              }
              return {uri: String(raw).trim()};
            })()}
          />
          <View style={{flex: 1, padding: 10}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.textDark,
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
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  menu: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: COLORS.border,
    // top: width(32),
    // right: width(9),
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
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundLight,
    zIndex: 999,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    // Agar font available ho to ye use kar sakte ho:
    // fontFamily: fontFamly.PlusJakartaSansBold,
  },

  spacer: {
    height: 10,
  },
});
