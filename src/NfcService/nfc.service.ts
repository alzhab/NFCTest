import NfcManager, {Ndef, NfcEvents, NfcTech} from 'react-native-nfc-manager';
import {Alert, Platform} from 'react-native';
import {
  HCESession,
  NFCTagType4,
  NFCTagType4NDEFContentType,
} from 'react-native-hce';

let session: any;

export const NfcService = {
  cancelSubscription: null,
  // READ TAG
  async readTagAndroidFromIos() {
    const tag = new NFCTagType4({
      type: NFCTagType4NDEFContentType.Text,
      content: '',
      writable: true,
    });

    session = await HCESession.getInstance();
    await session.setApplication(tag);
    await session.setEnabled(true);

    return new Promise(resolve => {
      this.cancelSubscription = session.on(
        HCESession.Events.HCE_STATE_WRITE_FULL,
        () => resolve(session.application),
      );
    }).catch(e => {
      console.log(e);
    });
  },
  async readTagIosFromAndroid() {
    let tag: any = null;

    await NfcManager.requestTechnology([NfcTech.Ndef]);

    tag = await NfcManager.getTag().catch(err => {
      Alert.alert(err.toString());
    });

    tag.ndefStatus = await NfcManager.ndefHandler.getNdefStatus();
    const {ndefMessage}: any = await NfcManager.ndefHandler.getNdefMessage();

    if (Platform.OS === 'ios') {
      if (ndefMessage) {
        tag.ndefMessage = Ndef.text.decodePayload(ndefMessage[0].payload);
        await NfcManager.setAlertMessageIOS('Success');
      } else {
        await NfcManager.setAlertMessage('Error');
      }
    }

    return tag;
  },
  async readTagAndroidFromAndroid() {
    let tag: any = null;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      tag = await NfcManager.getTag();
      tag.ndefStatus = await NfcManager.ndefHandler.getNdefStatus();

      return tag;
    } catch (e) {
      Alert.alert('ERROR', JSON.stringify(e));
      return Promise.reject('Error');
    }
  },
  async readTagIosFromIos() {},
  // SEND TAG
  async sendTagAndroidToIos(data: string) {
    const tag = new NFCTagType4({
      type: NFCTagType4NDEFContentType.Text,
      content: data,
      writable: true,
    });

    session = await HCESession.getInstance();
    await session.setApplication(tag);
    await session.setEnabled(true);
  },
  async sendTagIosToAndroid(data: string) {
    await NfcManager.requestTechnology(NfcTech.Ndef).catch(e => {
      Alert.alert('ERROR requestTechnology', JSON.stringify(e));
    });

    const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);

    if (bytes) {
      await NfcManager.ndefHandler.writeNdefMessage(bytes).catch(e => {
        Alert.alert('ERROR writeNdefMessage', e.toString());
        console.error(e);
      });
    }
  },
  async sendTagAndroidToAndroid(data: string) {
    const tag = new NFCTagType4({
      type: NFCTagType4NDEFContentType.Text,
      content: data,
      writable: true,
    });

    session = await HCESession.getInstance();
    await session.setApplication(tag);
    await session.setEnabled(true);
  },
  async sendTagIosToIos(data: string) {},
  async init() {
    const supported = await NfcManager.isSupported();
    if (supported) {
      await NfcManager.start();
    }
    return supported;
  },
  generateRandomHexKey(size: number) {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  },
  async cancel() {
    console.log('cancel');
    await NfcManager.cancelTechnologyRequest();
    if (Platform.OS === 'android') {
      if (this.cancelSubscription) {
        // @ts-ignore
        this.cancelSubscription();
      }
      await session.setEnabled(false);
    }
  },
  async readTag() {
    return new Promise(resolve => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
        resolve(tag);
      });

      NfcManager.setEventListener(
        NfcEvents.DiscoverBackgroundTag,
        (tag: any) => {
          resolve(tag);
        },
      );
    });
  },
  async stopNfcRead() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {});
    NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, () => {});
  },
};
