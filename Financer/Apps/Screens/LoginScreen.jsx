//for this make project on clerk and take key and then expo web browser install

import { View, Text,Image, SafeAreaView,TouchableOpacity } from 'react-native'
import React from 'react'

import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {

  useWarmUpBrowser();
  //to add outh 
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

//for google outh
  const Press = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
 
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);


  
  return (
    <SafeAreaView>
    <Image source={require('./../../assets/login.png')}
    className='w-full h-[400px]   object-cover mt-10'/> 

     
    <View className="p-8 bg-white mt-[-15px] rounded-3xl shadow-md " >
    <Text className="fleax-1 align-middle text-[30px] font-bold">     Dhan Nirankar Ji</Text>
    <Text className="text-[18px] text-slate-500 mt-6 ">    Login kijiye mahapursho ji</Text>
    </View>    

    <TouchableOpacity onPress={Press}  className="p-6 bg-blue-500 rounded-full">
      <Text className="text-white text-center tex-[18px]">Get Started</Text>
    </TouchableOpacity>
  </SafeAreaView>
  )
}