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
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const ReviewModal = ({visible, onClose, onConfirm}) => {
  const {currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    pleaseGiveRating: isDutch ? 'Geef een beoordeling' : 'Please give rating',
    pleaseWriteReview: isDutch
      ? 'Schrijf je beoordeling'
      : 'Please write your review',
    rateExperience: isDutch ? 'Beoordeel je ervaring' : 'Rate Your Experience',
    tapToRate: isDutch ? 'Tik om te beoordelen' : 'Tap to rate',
    writeReview: isDutch ? 'Schrijf een beoordeling' : 'Write a Review',
    shareExperience: isDutch
      ? 'Deel je ervaring...'
      : 'Share your experience...',
    cancel: isDutch ? 'Annuleren' : 'Cancel',
    submit: isDutch ? 'Versturen' : 'Submit',
  };
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
      alert(localizedText.pleaseGiveRating);
      return;
    }

    if (!review.trim()) {
      alert(localizedText.pleaseWriteReview);
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
          <Text style={styles.title}>{localizedText.rateExperience}</Text>

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
            {rating ? `${rating} / 5` : localizedText.tapToRate}
          </Text>

          {/* Review Input */}
          <Text style={styles.label}>{localizedText.writeReview}</Text>
          <TextInput
            style={styles.input}
            placeholder={localizedText.shareExperience}
            placeholderTextColor={COLORS.textLight}
            value={review}
            onChangeText={setReview}
            multiline
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <View style={{width: width(38)}}>
              <GradientButton
                text={localizedText.cancel}
                type="outline"
                useGradient
                onPress={handleClose}
              />
            </View>

            <View style={{width: width(38)}}>
              <GradientButton
                text={localizedText.submit}
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
