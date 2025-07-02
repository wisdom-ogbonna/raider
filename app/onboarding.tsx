import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import onboardingStyles from '../styles/HomeScreenStyles';

const onboardingData = [
  {
    title: 'Welcome',
    description: 'Your trusted ally for reporting and staying safe from immigration-related threats. 100% anonymous. Built for your protection.',
    image: require('../assets/images/onboarding1.png'),
  },
    {
    title: 'Stay Alert, Stay Safe',
    description: 'Get real-time alerts when potential immigration enforcement or suspicious activity is reported near you. No personal info needed.No personal info needed.',
    image: require('../assets/images/onboarding3.png'),
  },

  {
    title: 'Report Suspicious Activity Fast',
    description: 'Quickly share details about raids, unmarked vehicles, or threats help protect your friends, family, and neighbors.',
    image: require('../assets/images/onboarding2.png'),
  },
    {
    title: 'Private. Secure. Anonymous',
    description: 'No government access. No data sold. Your safety is our priority.',
    image: require('../assets/images/onboarding2.png'),
  },
    {
    title: 'Support the Mission',
    description: 'Help us grow by donating or spreading the word. La Migra App is free and built by the community, for the community.',
    image: require('../assets/images/onboarding2.png'),
  },

];

const OnboardingScreen = () => {
  const pagerRef = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);
  const router = useRouter();

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
          <Text style={onboardingStyles.skipButton}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={onboardingStyles.nextButton}>
          <Text style={onboardingStyles.nextButtonText}>
            {pageIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
