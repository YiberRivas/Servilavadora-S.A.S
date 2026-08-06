import Constants from 'expo-constants';

const ENV = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://172.16.7.210:8000',
  WS_BASE_URL: Constants.expoConfig?.extra?.wsBaseUrl || 'ws://172.16.7.210:8000',
};

export default ENV;
