const fs = require('fs');
const path = 'src/services/routeService.ts';
let content = fs.readFileSync(path, 'utf8');

const oldCatch = `  } catch {
    // Fall through to mock
  }`;

const newCatch = `  } catch (err: any) {
    console.warn(
      '[routeService] Backend /route call failed — falling back to straight-line mock route.',
      'Check that the backend is running and API_BASE_URL in constants/index.ts matches your current IP.',
      err?.message || err
    );
  }`;

if (content.includes(oldCatch)) {
  content = content.replace(oldCatch, newCatch);
  fs.writeFileSync(path, content);
  console.log('ROUTE_LOGGING_FIX_APPLIED');
} else {
  console.log('ROUTE_LOGGING_FIX_NOT_FOUND');
}
