import Constants from 'expo-constants';

const ENV = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://1172.16.30.129:8000',
  WS_BASE_URL: Constants.expoConfig?.extra?.wsBaseUrl || 'ws://172.16.30.129:8000',
};

export default ENV;
