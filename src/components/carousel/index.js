import React, {useRef, useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Carousel from 'react-native-snap-carousel';
import {COLORS} from '../../constants';
import Icon from 'react-native-vector-icons/Ionicons';

const CarouselComponent = ({data = []}) => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  /* ---------------- INDICATORS ---------------- */
  const renderIndicators = () => (
    <View style={styles.indicatorContainer}>
      {data.map((_, index) => {
        const isActive = index === activeSlide;
        return (
          <View
            key={index}
            style={[styles.dotWrapper, isActive && styles.activeDotWrapper]}>
            <View style={styles.dot} />
          </View>
        );
      })}
    </View>
  );

  /* ---------------- RENDER ITEM ---------------- */
  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image source={{uri: item}} resizeMode="cover" style={styles.image} />
      <View style={styles.indicatorWrapper}>{renderIndicators()}</View>
    </View>
  );

  /* ---------------- BUTTON HANDLERS ---------------- */
  const goPrev = () => {
    if (activeSlide > 0) {
      carouselRef.current?.snapToItem(activeSlide - 1);
    }
  };

  const goNext = () => {
    if (activeSlide < data.length - 1) {
      carouselRef.current?.snapToItem(activeSlide + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* -------- LEFT BUTTON -------- */}
      <TouchableOpacity
        style={[styles.arrowButton, {left: 10}]}
        onPress={goPrev}
        disabled={activeSlide === 0}>
        <Icon
          name="chevron-back"
          size={20}
          color={activeSlide === 0 ? COLORS.border : COLORS.black}
        />
      </TouchableOpacity>

      {/* -------- CAROUSEL -------- */}
      <Carousel
        ref={carouselRef}
        data={data}
        renderItem={renderItem}
        sliderWidth={width(100)}
        itemWidth={width(100)}
        onSnapToItem={index => setActiveSlide(index)}
      />

      {/* -------- RIGHT BUTTON -------- */}
      <TouchableOpacity
        style={[styles.arrowButton, {right: 10}]}
        onPress={goNext}
        disabled={activeSlide === data.length - 1}>
        <Icon
          name="chevron-forward"
          size={20}
          color={activeSlide === data.length - 1 ? COLORS.border : COLORS.black}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CarouselComponent;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  card: {
    height: width(80),
    backgroundColor: COLORS.white,
    margin: width(2),
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
    marginBottom: width(4),
  },
  dotWrapper: {
    marginHorizontal: width(1),
  },
  activeDotWrapper: {
    borderWidth: 1,
    borderRadius: 100,
    padding: width(1),
    borderColor: COLORS.black,
  },
  dot: {
    height: 7,
    width: 7,
    backgroundColor: COLORS.black,
    borderRadius: 10,
  },
  arrowButton: {
    position: 'absolute',
    top: '45%',
    zIndex: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
