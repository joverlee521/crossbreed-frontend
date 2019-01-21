import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import AuthenticationNavigator from "../utils/auth";
import MainTabNavigator from './MainTabNavigator';

export default createAppContainer(createSwitchNavigator({
  Auth: AuthenticationNavigator,
  Main: MainTabNavigator,
},
{
  initialRouteName: "Auth"
}));