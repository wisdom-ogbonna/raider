import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import onboardingStyles from '../styles/HomeScreenStyles';

const onboardingData = [
  {
    title: 'Welcome to Dwellify',
    description: 'Find homes, agents, and services around Choba & Port Harcourt effortlessly.',
    image: require('../assets/images/onboarding1.png'),
  },
  {
    title: 'Connect with Agents Instantly',
    description: 'Easily reach verified agents nearby and book a house or apartment with ease.',
    image: require('../assets/images/onboarding2.png'),
  },
  {
    title: 'Get Smart Updates',
    description: 'Stay informed about new listings, offers, and agent replies in real time.',
    image: require('../assets/images/onboarding3.png'),
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
      router.replace('/signin');
    }
  };

  const handleSkip = () => {
    router.replace('/signin');
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
                backgroundColor: pageIndex === i ? '#007AFF' : '#D1D5DB',
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
