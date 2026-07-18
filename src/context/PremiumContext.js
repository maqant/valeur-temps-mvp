import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { Platform } from 'react-native';

const PremiumContext = createContext();

export const PremiumProvider = ({ children }) => {
  const [isAdFree, setIsAdFree] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState('1.99 €');
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [isLoadingPremium, setIsLoadingPremium] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedDate = await AsyncStorage.getItem('@firstLaunchDate');
        if (!storedDate) {
          await AsyncStorage.setItem('@firstLaunchDate', new Date().toISOString());
          setIsTrialActive(true);
        } else {
          const launchDate = new Date(storedDate);
          if (isNaN(launchDate.getTime())) {
            setIsTrialActive(false);
          } else {
            const now = new Date();
            const diffDays = Math.abs(now - launchDate) / (1000 * 60 * 60 * 24);
            setIsTrialActive(diffDays <= 3);
          }
        }
      } catch (e) {
        console.warn("Error checking trial:", e);
      }

      try {
        // LogLevel to debug during development
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        const apiKey = "test_LhxGwEpDUtADowWtmUdAjohcfDj";
        if (Platform.OS === 'ios') {
          await Purchases.configure({ apiKey });
        } else if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey });
        }
        
        // Initial check
        const customerInfo = await Purchases.getCustomerInfo();
        checkProEntitlement(customerInfo);

        // Fetch offerings to get priceString
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current && offerings.current.availablePackages.length > 0) {
            const pkg = offerings.current.availablePackages[0];
            if (pkg && pkg.product && pkg.product.priceString) {
              setPremiumPrice(pkg.product.priceString);
            }
          }
        } catch (e) {
          console.warn("Could not fetch offerings for price:", e);
        }

        // Best Practice: Add a listener for customer info updates (purchases, expiration, etc.)
        Purchases.addCustomerInfoUpdateListener((info) => {
          checkProEntitlement(info);
        });

      } catch (e) {
        console.warn("Error initializing RevenueCat:", e);
      }

      setIsLoadingPremium(false);
    };

    initialize();
  }, []);

  const checkProEntitlement = (customerInfo) => {
    // We check for the specific entitlement named 'SweatCost Pro'
    if (typeof customerInfo.entitlements.active['SweatCost Pro'] !== 'undefined') {
      setIsAdFree(true);
    } else {
      setIsAdFree(false);
    }
  };

  const showPaywall = async () => {
    try {
      // Using RevenueCatUI to present the paywall built in the dashboard
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'SweatCost Pro',
      });
      
      switch (paywallResult) {
        case RevenueCatUI.PAYWALL_RESULT.PURCHASED:
        case RevenueCatUI.PAYWALL_RESULT.RESTORED:
          return true;
        case RevenueCatUI.PAYWALL_RESULT.CANCELLED:
        case RevenueCatUI.PAYWALL_RESULT.ERROR:
        default:
          return false;
      }
    } catch (e) {
      console.warn('Error presenting paywall:', e);
      return false;
    }
  };

  const showCustomerCenter = async () => {
    try {
      // Allow user to manage their purchases/subscriptions
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      console.warn('Error presenting Customer Center:', e);
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      checkProEntitlement(customerInfo);
      return typeof customerInfo.entitlements.active['SweatCost Pro'] !== 'undefined';
    } catch (e) {
      console.warn('Restore error:', e);
      return false;
    }
  };

  return (
    <PremiumContext.Provider value={{ 
      isAdFree, 
      premiumPrice,
      isTrialActive,
      isLoadingPremium,
      showPaywall, 
      showCustomerCenter, 
      restorePurchases 
    }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
