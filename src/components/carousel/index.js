import React, {useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../constants';

const CAROUSEL_HEIGHT = width(80);
const CAROUSEL_VERTICAL_MARGIN = width(2);
const CAROUSEL_HORIZONTAL_MARGIN = width(2);
const ARROW_SIZE = 36;

const CarouselComponent = ({data = []}) => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = useMemo(
    () =>
      (Array.isArray(data) ? data : [])
        .map(item => {
          if (!item) {
            return null;
          }
          if (typeof item === 'string') {
            return item.trim();
          }
          return (
            item?.uri ||
            item?.url ||
            item?.secure_url ||
            item?.image ||
            ''
          )
            .toString()
            .trim();
        })
        .filter(Boolean),
    [data],
  );

  const hasMultipleSlides = slides.length > 1;
  const wrapperHeight = CAROUSEL_HEIGHT + CAROUSEL_VERTICAL_MARGIN * 2;
  const arrowTop = CAROUSEL_VERTICAL_MARGIN + (CAROUSEL_HEIGHT - ARROW_SIZE) / 2;

  const renderIndicators = () => (
    <View style={styles.indicatorContainer}>
      {slides.map((_, index) => {
        const isActive = index === activeSlide;
        return (
          <View
            key={index}
            style={[styles.dotWrapper, isActive && styles.activeDotWrapper]}>
            <View style={[styles.dot, isActive && styles.activeDot]} />
          </View>
        );
      })}
    </View>
  );

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image source={{uri: item}} resizeMode="cover" style={styles.image} />
      {hasMultipleSlides ? (
        <View style={styles.indicatorWrapper}>{renderIndicators()}</View>
      ) : null}
    </View>
  );

  const goPrev = () => {
    if (activeSlide > 0) {
      carouselRef.current?.snapToItem(activeSlide - 1);
    }
  };

  const goNext = () => {
    if (activeSlide < slides.length - 1) {
      carouselRef.current?.snapToItem(activeSlide + 1);
    }
  };

  if (!slides.length) {
    return <View style={[styles.wrapper, {height: wrapperHeight}]} />;
  }

  return (
    <View style={[styles.wrapper, {height: wrapperHeight}]}>
      <Carousel
        ref={carouselRef}
        data={slides}
        renderItem={renderItem}
        sliderWidth={width(100)}
        itemWidth={width(100)}
        onSnapToItem={index => setActiveSlide(index)}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
      />

      {hasMultipleSlides ? (
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.arrowButton,
              styles.arrowLeft,
              {top: arrowTop},
              activeSlide === 0 && styles.arrowButtonDisabled,
            ]}
            onPress={goPrev}
            disabled={activeSlide === 0}>
            <Icon
              name="chevron-back"
              size={22}
              color={activeSlide === 0 ? COLORS.textLight : COLORS.textDark}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.arrowButton,
              styles.arrowRight,
              {top: arrowTop},
              activeSlide === slides.length - 1 && styles.arrowButtonDisabled,
            ]}
            onPress={goNext}
            disabled={activeSlide === slides.length - 1}>
            <Icon
              name="chevron-forward"
              size={22}
              color={
                activeSlide === slides.length - 1
                  ? COLORS.textLight
                  : COLORS.textDark
              }
            />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

export default CarouselComponent;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    height: CAROUSEL_HEIGHT,
    backgroundColor: COLORS.white,
    marginHorizontal: CAROUSEL_HORIZONTAL_MARGIN,
    marginVertical: CAROUSEL_VERTICAL_MARGIN,
    borderRadius: width(5),
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  indicatorWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: width(3),
  },
  dotWrapper: {
    marginHorizontal: width(0.8),
    padding: 2,
    borderRadius: 100,
  },
  activeDotWrapper: {
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  dot: {
    height: 7,
    width: 7,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 10,
  },
  activeDot: {
    backgroundColor: COLORS.white,
  },
  arrowButton: {
    position: 'absolute',
    zIndex: 20,
    backgroundColor: COLORS.white,
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  arrowButtonDisabled: {
    opacity: 0.55,
  },
  arrowLeft: {
    left: width(4),
  },
  arrowRight: {
    right: width(4),
  },
});
