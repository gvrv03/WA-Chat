"use client";
import { createContext, useState, useEffect, useContext } from "react";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [userData, setuserData] = useState({
    isLogin: false,
    userRole: "User",
    userName: "Gaurav Narnaware",
    userEmail: "gxurav.work@gmail.com",
    userPhone: "917796305801",
    appDetails: [
      {
        appName: "Clinic AI",
        MAppId: "1884306365850175",
        MAppSecret: "dc0db602156fdd2d26c2b9e1f7d3a364",
        MPhoneNoId: "874495365740081",
        MBusinessAccId: "1603887010583754",
        MAccessToken:
          "EAAaxxEOVoj8BP1nZBjQagFSjdil9iLJQxzpSTiEmMSGKbDkuK0Gvgn4mm3xRxZBm8WfAuiSjDOtfqUapFRcDqVU3T9LZBTZA8lSawj88cL7oKZALq2gXKEnZAww9Q7WVKC6feQSLxfZBZBV6VHb0GM5z3vVHrfttjveMsvMTwC6bKE55qssyldsoNIXiZAJAeggwVCAZDZD",
      },
    ],
  });

  const [selectedAppDetails, setselectedAppDetails] = useState({
    appName: "Clinic AI",
    MAppId: "1884306365850175",
    MAppSecret: "dc0db602156fdd2d26c2b9e1f7d3a364",
    MPhoneNoId: "874495365740081",
    MBusinessAccId: "1603887010583754",
    MAccessToken:
      "EAAaxxEOVoj8BP1nZBjQagFSjdil9iLJQxzpSTiEmMSGKbDkuK0Gvgn4mm3xRxZBm8WfAuiSjDOtfqUapFRcDqVU3T9LZBTZA8lSawj88cL7oKZALq2gXKEnZAww9Q7WVKC6feQSLxfZBZBV6VHb0GM5z3vVHrfttjveMsvMTwC6bKE55qssyldsoNIXiZAJAeggwVCAZDZD",
  });

  const contextData = { userData,selectedAppDetails };
  return (
    <StoreContext.Provider value={contextData}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
