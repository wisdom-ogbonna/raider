import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import onboardingStyles from '../styles/HomeScreenStyles';
import { useTranslation } from 'react-i18next';

const OnboardingScreen = () => {
  const pagerRef = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();

  const onboardingData = [
    {
      title: t('welcome'),
      description: t('description1'),
      image: require('../assets/images/onboarding1.png'),
    },
    {
      title: t('stay_safe'),
      description: t('description2'),
      image: require('../assets/images/onboarding3.png'),
    },
    {
      title: t('report_fast'),
      description: t('description3'),
      image: require('../assets/images/onboarding2.png'),
    },
    {
      title: t('private_secure'),
      description: t('description4'),
      image: require('../assets/images/onboarding4.png'),
    },
    {
      title: t('support'),
      description: t('description5'),
      image: require('../assets/images/onboarding5.png'),
    },
  ];

  const handleNext = () => {
    if (pageIndex < onboardingData.length - 1) {
      pagerRef.current.setPage(pageIndex + 1);
    } else {
      router.replace('/signup');
    }
  };

  const handleSkip = () => {
    router.replace('/signup');
  };

  const onPageSelected = (e) => {
    setPageIndex(e.nativeEvent.position);
  };

  return (
    <SafeAreaView style={onboardingStyles.container}>
      <PagerView
        style={onboardingStyles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
        ref={pagerRef}
      >
        {onboardingData.map((item, index) => (
          <View key={index} style={onboardingStyles.page}>
            <Image source={item.image} style={onboardingStyles.image} />
            <Text style={onboardingStyles.title}>{item.title}</Text>
            <Text style={onboardingStyles.description}>{item.description}</Text>
          </View>
        ))}
      </PagerView>

      <View style={onboardingStyles.dotsContainer}>
        {onboardingData.map((_, i) => (
          <View
            key={i}
            style={[
              onboardingStyles.dot,
              {
                width: pageIndex === i ? 30 : 12,
                backgroundColor: pageIndex === i ? '#2596be' : '#D1D5DB',
                opacity: pageIndex === i ? 1 : 0.5,
              },
            ]}
          />
        ))}
      </View>

      <View style={onboardingStyles.navContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={onboardingStyles.skipButton}>{t('skip')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={onboardingStyles.nextButton}>
          <Text style={onboardingStyles.nextButtonText}>
            {pageIndex === onboardingData.length - 1 ? t('get_started') : t('next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
