import React, {useEffect, useMemo, useState} from 'react';

import {
  Animated,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {NfcService} from './src/NfcService';
import {HCESessionProvider} from 'react-native-hce';
import View = Animated.View;
import Text = Animated.Text;

const Root = () => {
  const [supported, setSupported] = useState(false);
  const [sendData, setSendData] = useState('Message from: ' + Platform.OS);
  const isIos = useMemo(() => Platform.OS === 'ios', []);
  const [result, setResult] = useState<any>({});

  useEffect(() => {
    NfcService.init().then(res => {
      setSupported(true);
    });
  }, []);

  return supported ? (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.result}>
          <Text>Result: {JSON.stringify(result, null, 2)}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setResult({})}>
            <Text style={styles.label}>Clear</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholderTextColor={'#cecece'}
          style={styles.input}
          value={sendData}
          onChangeText={setSendData}
          placeholder={'Send data'}
        />
      </View>
      <View style={styles.buttons}>
        <View style={styles.row}>
          <Text>READ</Text>

          {isIos ? (
            <>
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    NfcService.readTagIosFromAndroid().then(setResult)
                  }>
                  <Text style={styles.label}>Read from Android</Text>
                </TouchableOpacity>
              </View>

              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    NfcService.readTagIosFromIos().then(setResult)
                  }>
                  <Text style={styles.label}>Read from Ios</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    NfcService.readTagAndroidFromIos().then(setResult)
                  }>
                  <Text style={styles.label}>Read from IOS</Text>
                </TouchableOpacity>
              </View>

              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    NfcService.readTagAndroidFromAndroid().then(setResult)
                  }>
                  <Text style={styles.label}>Read from Android</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.row}>
          <Text>SEND</Text>

          {isIos ? (
            <>
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    NfcService.sendTagIosToAndroid(sendData).finally(() =>
                      NfcService.cancel(),
                    );
                  }}>
                  <Text style={styles.label}>Send to Android</Text>
                </TouchableOpacity>
              </View>

              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    NfcService.sendTagIosToIos(sendData).finally(() =>
                      NfcService.cancel(),
                    )
                  }>
                  <Text style={styles.label}>Send to Ios</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => NfcService.sendTagAndroidToIos(sendData)}>
                  <Text style={styles.label}>Send to IOS</Text>
                </TouchableOpacity>
              </View>

              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    NfcService.sendTagAndroidToAndroid(sendData).finally(() =>
                      NfcService.cancel(),
                    )
                  }>
                  <Text style={styles.label}>Send to Android</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  ) : (
    <Text>Wait...</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 50,
  },
  topContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  result: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#cecece',
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  row: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#4173ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    color: '#fff',
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
});

const App = () => {
  if (Platform.OS === 'android') {
    return (
      // @ts-ignore
      <HCESessionProvider>
        <Root />
      </HCESessionProvider>
    );
  } else {
    return <Root />;
  }
};

export default App;
