import { readFileSync, writeFileSync } from 'fs';

const target = 'src/hooks/useVoiceAssistant.ts';
let c = readFileSync(target, 'utf8');

// Fix typo: awaitAudioModule -> await AudioModule
c = c.replace('awaitAudioModule.requestRecordingPermissionsAsync()', 'await AudioModule.requestRecordingPermissionsAsync()');

// Fix typo: awaitFileSystem -> await FileSystem
c = c.replace('awaitFileSystem.readAsStringAsync', 'await FileSystem.readAsStringAsync');

// Fix audio session config
c = c.replace(
  `await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });`,
  `await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });`
);

writeFileSync(target, c);
console.log('Done. All 3 fixes applied.');
