import React, {useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';

import {COLORS, fontFamly} from '../../constants';
import GradientButton from '../button';

const ReviewModal = ({visible, onClose, onConfirm}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible]);

  const resetState = () => {
    setRating(0);
    setReview('');
  };

  const handleConfirm = () => {
    if (!rating) {
      alert('Please give rating');
      return;
    }

    if (!review.trim()) {
      alert('Please write your review');
      return;
    }

    onConfirm({
      rating,
      review: review.trim(),
    });

    resetState();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Rate Your Experience</Text>

          {/* Rating */}
          <Rating
            ratingCount={5}
            imageSize={30}
            startingValue={rating}
            onFinishRating={setRating}
            style={{marginVertical: width(3)}}
          />

          {/* Rating Label */}
          <Text style={styles.ratingText}>
            {rating ? `${rating} / 5` : 'Tap to rate'}
          </Text>

          {/* Review Input */}
          <Text style={styles.label}>Write a Review</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your experience..."
            placeholderTextColor={COLORS.textLight}
            value={review}
            onChangeText={setReview}
            multiline
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <View style={{width: width(38)}}>
              <GradientButton
                text="Cancel"
                type="outline"
                useGradient
                onPress={handleClose}
              />
            </View>

            <View style={{width: width(38)}}>
              <GradientButton
                text="Submit"
                onPress={handleConfirm}
                disabled={!rating || !review.trim()}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal;
const styles = StyleSheet.create({
  /* Dark background */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Modal box */
  container: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: width(4),
    padding: width(5),
    elevation: 10,
  },

  /* Modal title */
  title: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    textAlign: 'center',
  },

  /* Rating text (4 / 5) */
  ratingText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  /* Label above input */
  label: {
    fontSize: 12,
    marginBottom: width(1),
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },

  /* Review input */
  input: {
    height: width(28),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: width(2),
    padding: width(3),
    fontSize: 12,
    color: COLORS.black,
    textAlignVertical: 'top',
    backgroundColor: COLORS.backgroundLight,
    marginBottom: width(4),
  },

  /* Buttons row */
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
