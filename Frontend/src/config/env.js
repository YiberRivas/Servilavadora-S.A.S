import Constants from 'expo-constants';

const ENV = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://10.164.87.181:8000',
  WS_BASE_URL: Constants.expoConfig?.extra?.wsBaseUrl || 'ws://10.164.87.181:8000',
};

export default ENV;
