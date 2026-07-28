import Constants from 'expo-constants';

const ENV = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.137.1:8000',
  WS_BASE_URL: Constants.expoConfig?.extra?.wsBaseUrl || 'ws://192.168.137.1:8000',
};

export default ENV;
