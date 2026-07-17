import React, { createContext, useState, useContext, useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

const PremiumContext = createContext();

export const PremiumProvider = ({ children }) => {
  const [isAdFree, setIsAdFree] = useState(false);

  useEffect(() => {
    const initPurchases = async () => {
      try {
        if (Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: "goog_VOTRE_CLE_REVENUECAT" });
        } else if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: "goog_VOTRE_CLE_REVENUECAT" });
        }
        
        const customerInfo = await Purchases.getCustomerInfo();
        if (typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
          setIsAdFree(true);
        }
      } catch (e) {
        console.warn("Error initializing RevenueCat:", e);
      }
    };

    initPurchases();
  }, []);

  const purchasePremium = async () => {
    try {
      // Pour ce test, on triche un peu en forçant l'état Premium
      // Dans une app de prod, on ferait await Purchases.purchasePackage(package)
      setIsAdFree(true);
      return true;
    } catch (e) {
      if (!e.userCancelled) {
        console.warn('Purchase error:', e);
      }
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
        setIsAdFree(true);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Restore error:', e);
      return false;
    }
  };

  return (
    <PremiumContext.Provider value={{ isAdFree, setIsAdFree, purchasePremium, restorePurchases }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
