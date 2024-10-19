import { View, Text, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';


export default function Header() {
    const {user}=useUser();
  return (
    <View className="p-4 mt-8">
          {/* user input */}
        <View className="flex flex-row items-center gap-2" >
          <Image source={{uri:user?.imageUrl}}
          className="rounded-full w-12 h-12"
          />
          <View >
            <Text className="text-[16px]">Welcome</Text>
            <Text  className="text-[20px] font-bold">{user?.fullName}</Text>
          </View>
        </View>

        {/* search bar */}
        <View className="p-3 px-5 mt-5 bg-blue-50 rounded-full shadow-lg flex flex-row  items-center border-[1px] border-blue-200 ">
        <Ionicons name="search" size={26} color="gray" />
      <TextInput placeholder='Search'  
      className="ml-3 text-[18px]"
      onChangeText={(value)=>console.log(value)}
       />
        </View>
     
    </View>
  )
}