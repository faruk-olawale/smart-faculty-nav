const fs = require('fs');
const path = 'src/navigation/AppNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `import QRScreen from '../screens/QRScreen';`,
  `import QRScreen from '../screens/QRScreen';\nimport AssistantScreen from '../screens/AssistantScreen';`
);

const oldFn = `function AssistantScreen() {
  return (
    <View style={{
      flex: 1, backgroundColor: COLORS.background,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 32, marginBottom: 12 }}>🤖</Text>
      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>
        AI Assistant
      </Text>
      <Text style={{ color: COLORS.textDim, fontSize: 13, marginTop: 6 }}>
        Coming in Stage 10
      </Text>
    </View>
  );
}

`;

if (content.includes(oldFn)) {
  content = content.replace(oldFn, '');
  fs.writeFileSync(path, content);
  console.log('NAVIGATOR_FIX_APPLIED');
} else {
  console.log('NAVIGATOR_FIX_NOT_FOUND');
}
