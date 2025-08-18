import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const CartCard = ({
  item,
  onBookNow,
  onCancelBooking,
  variant = 'requested',
}) => {
  const {t} = useTranslation();

  const renderActionButton = () => {
    if (variant === 'requested') {
      return (
        <GradientButton
          text={t('bookNow')}
          onPress={() => onBookNow && onBookNow(item)}
          type="filled"
          textStyle={{
            fontSize: 10,
            fontFamly: fontFamly.PlusJakartaSansMedium,
            color: COLORS.white,
          }}
          styleProps={{
            paddingVertical: width(2),
            height: width(7),
          }}
          outlineButtonStyle={{
            paddingVertical: width(2),
          }}
        />
      );
    } else if (variant === 'accepted' && item.actionButton) {
      return (
        <GradientButton
          textStyle={{
            fontSize: 10,
            fontFamly: fontFamly.PlusJakartaSansMedium,
            color: COLORS.white,
          }}
          text={t('cancelBooking')}
          onPress={() => onCancelBooking && onCancelBooking()}
          styleProps={{
            paddingVertical: width(2),
          }}
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={
            item.image
              ? {uri: item.image}
              : require('../../assets/images/coverImage1.png')
          }
          style={styles.cardImage}
          resizeMode="cover"
        />
        {item.isBookmarked && (
          <View style={styles.bookmarkContainer}>
            <Image source={ICONS.favouriteIcon} style={styles.bookmarkIcon} />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.status}>{t('inStock')}</Text>
              {item.verified && (
                <Image
                  source={ICONS.verifyedIcon}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Image source={ICONS.editIcon} style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.artistRow}>
          {variant === 'accepted' && item.artistAvatar && (
            <View style={styles.artistAvatarContainer}>
              <Image
                source={{uri: item.artistAvatar}}
                style={styles.artistAvatar}
                resizeMode="cover"
              />
            </View>
          )}
          <Text style={styles.artistName}>{item.artistName}</Text>
        </View>

        <View style={styles.bottomRow}>
          {renderActionButton()}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.priceUnit}>/{t('perEvent')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    marginHorizontal: width(3.5),
    marginTop: width(3),
    flexDirection: 'row',
    paddingHorizontal: width(4),
    paddingVertical: width(4),
  },
  imageContainer: {
    marginRight: width(2),
    height: width(30),
    width: width(30),
    borderRadius: width(4),
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: width(4),
  },
  bookmarkContainer: {
    position: 'absolute',
    top: width(2),
    right: width(2),
  },
  bookmarkIcon: {
    width: width(5),
    height: width(5),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(1),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(1.5),
  },
  status: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: '#4CAF50',
  },
  verifiedBadge: {
    width: width(3.5),
    height: width(3.5),
    borderRadius: width(1.75),
    backgroundColor: '#FF1744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: COLORS.white,
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  verifiedIcon: {
    width: width(4.5),
    height: width(4.5),
  },
  shareButton: {
    padding: width(1),
  },
  editIcon: {
    width: width(4),
    height: width(4),
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(2),
  },
  artistAvatarContainer: {
    width: width(6),
    height: width(6),
    borderRadius: width(3),
    overflow: 'hidden',
  },
  artistAvatar: {
    width: '100%',
    height: '100%',
  },
  artistName: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: width(2),
    borderRadius: width(2),
  },
  actionButtonText: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  priceUnit: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
});

export default CartCard;
